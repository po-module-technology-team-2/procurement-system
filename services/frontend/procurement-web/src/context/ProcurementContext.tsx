import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  NavView, 
  UserRole, 
  ProcessType, 
  TeamType, 
  FactoryLineType,
  RequisitionItem, 
  RequisitionStatus,
  UserProfile,
  DemandType,
  SlaStatus,
  DemandReasonConfig,
  TeamConfig,
  LecReviewerConfig,
  PolicySettings,
  PersonnelMember,
  PersonnelRole,
  EmNoRecord
} from '../types';
import { REAL_PERSONNEL, REAL_LEC_REVIEWERS } from '../data/personnelData';
import { INITIAL_EM_NO_RECORDS } from '../data/emNoMasterData';
import { calculateSla, SLA_HOURS_MAP } from '../utils/slaCalculator';

export { calculateSla, SLA_HOURS_MAP };

export const DEFAULT_DEMAND_REASONS: DemandReasonConfig[] = [
  {
    code: 'BM',
    label: 'Breakdown Maintenance (Line Stoppage)',
    slaHours: 4,
    priority: 'URGENT',
    impactDescription: 'Machine down or critical station stalled; requires immediate emergency resolution.',
    badgeColor: 'rose',
    autoEscalateHours: 1,
    earlyWarningHours: 1,
    escalationTarget: 'Part Leader & Chief LEC Reviewer',
    escalationChannel: 'SMS & Urgent Email Alert'
  },
  {
    code: 'MP',
    label: 'Periodic PM Overhaul',
    slaHours: 48,
    priority: 'MEDIUM',
    impactDescription: 'Scheduled monthly/quarterly cleanroom overhaul and component cycle replacement.',
    badgeColor: 'emerald',
    autoEscalateHours: 6,
    earlyWarningHours: 8,
    escalationTarget: 'Equipment Engineering Committee',
    escalationChannel: 'Weekly Audit Agenda'
  },
  {
    code: 'Setup',
    label: 'Machine Tooling Setup & Fixture Alignment',
    slaHours: 12,
    priority: 'HIGH',
    impactDescription: 'Tooling swap, nozzle conversion, or new fixture installation.',
    badgeColor: 'purple',
    autoEscalateHours: 2,
    earlyWarningHours: 2,
    escalationTarget: 'Designated Part Leader',
    escalationChannel: 'Push Notification & Email'
  },
  {
    code: 'MC',
    label: 'Model Change / Line Conversion',
    slaHours: 8,
    priority: 'HIGH',
    impactDescription: 'Product line switchover, mechanical guide change, sensor retuning.',
    badgeColor: 'amber',
    autoEscalateHours: 2,
    earlyWarningHours: 2,
    escalationTarget: 'Part Leader & Production Lead',
    escalationChannel: 'Push Notification & Line Alert'
  },
  {
    code: 'Setup/MC',
    label: 'Combined Setup & Model Conversion',
    slaHours: 12,
    priority: 'HIGH',
    impactDescription: 'Comprehensive setup and model conversion procedure.',
    badgeColor: 'purple',
    autoEscalateHours: 2,
    earlyWarningHours: 2,
    escalationTarget: 'Part Leader (Shift Supervisor)',
    escalationChannel: 'Email & Dashboard Banner'
  },
  {
    code: 'PD',
    label: 'Production Demand (Volume Surge)',
    slaHours: 24,
    priority: 'HIGH',
    impactDescription: 'Safety buffer stock replenishment for planned volume ramp and shift run-rate.',
    badgeColor: 'blue',
    autoEscalateHours: 4,
    earlyWarningHours: 4,
    escalationTarget: 'Section Leader & LEC Reviewer',
    escalationChannel: 'Standard Email Digest'
  }
];

export const DEFAULT_PERSONNEL: PersonnelMember[] = REAL_PERSONNEL;

export const DEFAULT_TEAMS: TeamConfig[] = [
  {
    id: 'PO_MODULE_2',
    name: 'PO Module Technology Team 2',
    code: 'PO-MOD-TECH-02',
    leadName: 'Hoang Trung Kien',
    leadEmployeeId: 'VH000500',
    assignedProcesses: ['POL', 'TAB', 'DIP', 'LT', 'DB', 'BD'],
    assignedLines: [
      'Line #201', 'Line #202', 'Line #203', 'Line #204', 'Line #205',
      'Line #206', 'Line #207', 'Line #208', 'Line #209', 'Line #210',
      'Line #601', 'Line #604'
    ],
    location: 'Cleanroom Building B, Level 2 & 3',
    active: true
  },
  {
    id: 'PO_MODULE_1',
    name: 'PO Module Technology Team 1',
    code: 'PO-MOD-TECH-01',
    leadName: 'Hoang Xuan Tung',
    leadEmployeeId: 'VH007064',
    assignedProcesses: ['POL', 'TAB'],
    assignedLines: ['Line #201', 'Line #202', 'Line #203'],
    location: 'Cleanroom Building B, Level 2',
    active: false
  },
  {
    id: 'TAB_DIP',
    name: 'TAB & DIP Bonding Team',
    code: 'TAB-DIP-BOND-01',
    leadName: 'Nguyen Van Duc',
    leadEmployeeId: 'VH000189',
    assignedProcesses: ['TAB', 'DIP'],
    assignedLines: ['Line #201', 'Line #202', 'Line #203'],
    location: 'Cleanroom Building A, Level 2',
    active: false
  },
  {
    id: 'LAMI_LASER',
    name: 'Lamination & Laser Cell',
    code: 'LAMI-LASER-CELL',
    leadName: 'Phi Minh Duc',
    leadEmployeeId: 'VH000757',
    assignedProcesses: ['LT', 'POL'],
    assignedLines: ['Line #601', 'Line #604'],
    location: 'Cleanroom Building C, Level 1',
    active: false
  }
];

export const DEFAULT_LEC_REVIEWERS: LecReviewerConfig[] = REAL_LEC_REVIEWERS;

export const DEFAULT_POLICY_SETTINGS: PolicySettings = {
  agingThresholdDays: 180,
  autoApproveLimitUSD: 1000,
  autoBlockDisuse: true,
  enforceCiCheck: true,
  enforceEbomEmLength: true,
  engineApiUrl: 'http://localhost:8000/api/v1',
  emsSimulationUrl: 'http://localhost:9000'
};

interface ProcurementContextType {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentProcess: ProcessType;
  setCurrentProcess: (process: ProcessType) => void;
  currentTeam: TeamType;
  setCurrentTeam: (team: TeamType) => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  requisitions: RequisitionItem[];
  addRequisition: (item: Omit<RequisitionItem, 'id' | 'createdAt'>) => string;
  updateStatus: (
    id: string, 
    status: RequisitionStatus, 
    note?: string, 
    reviewer?: string,
    approvedQty?: number,
    strategy?: 'PURCHASE_NEW' | 'WH_TRANSFER' | 'WORKSHOP_REPAIR' | 'CI_SUBSTITUTE',
    costSaving?: number
  ) => void;
  addFeedback: (
    requisitionId: string, 
    author: string, 
    role: 'REQUESTOR' | 'REVIEWER' | 'ADMIN', 
    message: string, 
    actionTaken?: 'REQUEST_INFO' | 'PROVIDE_INFO' | 'APPROVE' | 'REJECT',
    employeeId?: string
  ) => void;
  deleteRequisition: (id: string) => void;

  // Personnel (Engineers, LEC Reviewers, Leaders) Management
  personnelList: PersonnelMember[];
  addPersonnel: (member: Omit<PersonnelMember, 'id'>) => void;
  updatePersonnel: (id: string, member: Partial<PersonnelMember>) => void;
  deletePersonnel: (id: string) => void;
  importPersonnelFromExcel: (members: Omit<PersonnelMember, 'id'>[]) => void;

  // Equipment & EM No Master Records
  emNoList: EmNoRecord[];
  addEmNo: (record: Omit<EmNoRecord, 'id'>) => void;
  updateEmNo: (id: string, record: Partial<EmNoRecord>) => void;
  deleteEmNo: (id: string) => void;
  importEmNoRecords: (records: Omit<EmNoRecord, 'id'>[]) => void;
  registerEbomLink: (
    emNo: string, 
    qCode: string, 
    metadata?: { machine?: string; unit?: string; assembly?: string; customName?: string }
  ) => void;

  // LEC Batch Action Methods on Requisitions
  batchAssignReviewer: (reqIds: string[], reviewerName: string, reviewerId: string) => void;
  batchSystemRequest: (reqIds: string[]) => void;
  batchSendEmail: (reqIds: string[], subject?: string) => void;
  batchAddToMonthlyAppraisal: (reqIds: string[], month: string) => void;
  batchUpdateStatus: (reqIds: string[], status: RequisitionStatus, note: string) => void;

  // Dynamic Settings Configuration
  demandReasons: DemandReasonConfig[];
  updateDemandReasons: (reasons: DemandReasonConfig[]) => void;
  teamsList: TeamConfig[];
  updateTeamsList: (teams: TeamConfig[]) => void;
  lecReviewers: LecReviewerConfig[];
  updateLecReviewers: (reviewers: LecReviewerConfig[]) => void;
  activeLecReviewerId: string;
  setActiveLecReviewerId: (id: string) => void;
  policySettings: PolicySettings;
  updatePolicySettings: (settings: Partial<PolicySettings>) => void;
  resetToDefaultSettings: () => void;
}

const initialRequisitions: RequisitionItem[] = [
  {
    id: 'req-001',
    code: 'REQ-2026-001',
    itemCode: 'QCAC13053',
    title: 'Precision Optical Alignment Sensors (QCAC13053)',
    category: 'Q4.Sensors & Automation',
    quantity: 12,
    unit: 'EA',
    estimatedPrice: 115.2,
    currency: 'USD',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    department: 'PO Module Technology Team 2',
    requestedBy: 'EMP-882104 (David Kim)',
    requestorEmployeeId: 'EMP-882104',
    requestorName: 'David Kim',
    createdAt: '2026-11-20T08:30:00Z',
    targetDeliveryDate: '2026-11-25',
    slaMaxHours: 12,
    slaDeadline: '2026-11-20T20:30:00Z',
    slaStatus: 'NEAR_BREACH',
    notes: '[Demand: Setup/MC] [Machine: Die Bonder 01 (DB-01)] Weekly inspection wear detected.',
    customName: 'Die Bonder Precision Optical Alignment Sensor Unit',
    customNameReason: 'Shopfloor terminology aligned with bonding head calibration',
    processStep: 'DB',
    machineName: 'Die Bonder 01 (DB-01)',
    machineLine: 'Line #204',
    // Hierarchy: Machine => Unit => Assembly
    ebomUnitCode: 'UNT-OPT-01 [Precision Optical Positioning Unit]',
    ebomAssemblyCode: 'ASM-DB-001 [Bonding Head Carriage Assembly]',
    ebomMechanism: 'Optical Calibration Carriage',
    ebomEmNo: 'HWBMTL21EC0101',
    ebomPartLevel: 'Sub-Assembly Level 2',
    ebomLifespan: '6 Months (2,500 Operating Hours)',
    demandType: 'Setup/MC',
    problemDescription: 'Precision optical drift observed during 7nm wafer positioning. Calibration error exceeding 0.02mm tolerance.',
    currentSituation: 'Buffer count 2 EA on line. Run rate sustainable for 48 hours before mandatory line throttle.',
    quantityLogicText: '2 machines * 3 heads * 2 shifts safety buffer = 12 EA',
    assignedReviewer: 'Sarah Jenkins',
    assignedReviewerEmployeeId: 'EMP-771022',
    quotationStatus: 'IN_PROGRESS',
    feedbacks: [
      {
        id: 'fb-1',
        author: 'Sarah Jenkins',
        employeeId: 'EMP-771022',
        role: 'REVIEWER',
        message: 'Guardrail check: Central warehouse shows 0 onhand, but Transfer check indicates 15 EA available in Central Plant Haiphong Warehouse W2. Can we request an inter-plant transfer instead of new procurement?',
        timestamp: '2026-11-20T10:15:00Z',
        actionTaken: 'REQUEST_INFO'
      },
      {
        id: 'fb-2',
        author: 'David Kim',
        employeeId: 'EMP-882104',
        role: 'REQUESTOR',
        message: 'Checked with WH2 logistics: Those 15 units are already allocated to Line #208 preventive maintenance overhaul starting tomorrow. Dispatch lead time would cause a 48h line stoppage on Line #204. Requesting local purchase or split allocation.',
        timestamp: '2026-11-20T11:30:00Z',
        actionTaken: 'PROVIDE_INFO'
      }
    ]
  },
  {
    id: 'req-002',
    code: 'REQ-2026-002',
    itemCode: 'QCAD17426',
    title: 'High-Torque Servomotor Assembly (QCAD17426)',
    category: 'Q4.Drive Systems',
    quantity: 4,
    unit: 'EA',
    estimatedPrice: 380.0,
    currency: 'USD',
    status: 'FEEDBACK_PENDING',
    priority: 'URGENT',
    department: 'PO Module Technology Team 2',
    requestedBy: 'EMP-774012 (Michael Chang)',
    requestorEmployeeId: 'EMP-774012',
    requestorName: 'Michael Chang',
    createdAt: '2026-11-20T13:15:00Z',
    targetDeliveryDate: '2026-11-22',
    slaMaxHours: 4,
    slaDeadline: '2026-11-20T17:15:00Z',
    slaStatus: 'NEAR_BREACH',
    notes: '[Demand: BM] [Machine: TAB Bonder TB-03] Emergency motor drive stator failure.',
    customName: 'TAB Bonder High-Torque Main Axis Drive Servomotor',
    customNameReason: 'CAD DWG-TB03-M1 reference label for engineering work order',
    processStep: 'TAB',
    machineName: 'TAB Bonder TB-03',
    machineLine: 'Line #202',
    // Hierarchy: Machine => Unit => Assembly
    ebomUnitCode: 'UNT-DRV-02 [Main Axis Drive Unit]',
    ebomAssemblyCode: 'ASM-TB-004 [X-Y Gantry Motion Assembly]',
    ebomMechanism: 'Main Axis Drive Stage',
    ebomEmNo: 'HWBMTL19EC0402',
    ebomPartLevel: 'Critical Drive Component',
    ebomLifespan: '18 Months',
    demandType: 'BM',
    problemDescription: 'Motor stator coil burnout causing emergency alarm code E-502. Line #202 is completely halted.',
    currentSituation: 'Line #202 TAB stalled. Buffer stock exhausted (0 EA). Urgent decision needed.',
    quantityLogicText: '1 primary motor + 1 backup spare * 2 sister lines = 4 EA',
    monthlyAppraisal: true,
    monthlyAppraisalMonth: '2026-11',
    quotationStatus: 'PENDING',
    feedbacks: [
      {
        id: 'fb-3',
        author: 'Sarah Jenkins',
        employeeId: 'EMP-771022',
        role: 'REVIEWER',
        message: 'Reviewer alert: This model QCAD17426 has a registered CI substitute code QCAC23740 with identical mounting pitch and power rating, already in local buffer stock (6 EA available). Can we swap to the CI part to clear line stoppage immediately at $0 cost?',
        timestamp: '2026-11-20T14:00:00Z',
        actionTaken: 'REQUEST_INFO'
      }
    ]
  },
  {
    id: 'req-003',
    code: 'REQ-2026-003',
    itemCode: 'Q00001',
    title: 'Pneumatic Actuator Cylinders 25mm (Q00001)',
    category: 'Q4.Pneumatics',
    quantity: 16,
    unit: 'EA',
    estimatedPrice: 45.0,
    currency: 'USD',
    status: 'APPROVED',
    priority: 'HIGH',
    department: 'PO Module Technology Team 2',
    requestedBy: 'EMP-991044 (Alex Chen)',
    requestorEmployeeId: 'EMP-991044',
    requestorName: 'Alex Chen',
    createdAt: '2026-11-19T10:00:00Z',
    targetDeliveryDate: '2026-11-28',
    slaMaxHours: 48,
    slaDeadline: '2026-11-21T10:00:00Z',
    slaStatus: 'ON_TIME',
    notes: '[Demand: MP] [Machine: Module Assembly MA-01] Scheduled periodic PM overhaul.',
    customName: 'Module Pick & Place Pneumatic Cylinder 25mm',
    customNameReason: 'Shopfloor cylinder standard for automated feeder',
    processStep: 'POL',
    machineName: 'Module Assembly MA-01',
    machineLine: 'Line #201',
    // Hierarchy: Machine => Unit => Assembly
    ebomUnitCode: 'UNT-PNU-05 [Pneumatic Actuation Unit]',
    ebomAssemblyCode: 'ASM-MA-002 [Feeder Gantry Assembly]',
    ebomMechanism: 'Part Pick-and-Place Gantry',
    ebomEmNo: 'HWBMTL20EC0305',
    demandType: 'MP',
    reviewerName: 'Sarah Jenkins (Chief Reviewer)',
    reviewerEmployeeId: 'EMP-771022',
    reviewedAt: '2026-11-19T14:00:00Z',
    approvedQuantity: 16,
    procurementStrategy: 'PURCHASE_NEW',
    reviewDecisionNotes: 'All 10 guardrails passed. UP001 contract active ($45.00 SP). Workshop wait-repair stock exhausted. Approved for PO creation.',
    quantityLogicText: '8 feeder positions * 2 cylinders per station = 16 EA',
    feedbacks: [
      {
        id: 'fb-4',
        author: 'Sarah Jenkins',
        employeeId: 'EMP-771022',
        role: 'REVIEWER',
        message: 'Guardrail audit complete. 10 interlocks cleared, no aging buffer, unit price verified under Master Purchasing Agreement. Requisition APPROVED.',
        timestamp: '2026-11-19T14:00:00Z',
        actionTaken: 'APPROVE'
      }
    ]
  },
  {
    id: 'req-004',
    code: 'REQ-2026-004',
    itemCode: 'Q00002',
    title: 'ATM Robot Gripper Arm Vacuum Suction Cups (Q00002)',
    category: 'Q4.Robot Parts',
    quantity: 24,
    unit: 'EA',
    estimatedPrice: 18.5,
    currency: 'USD',
    status: 'ORDERED',
    priority: 'MEDIUM',
    department: 'PO Module Technology Team 2',
    requestedBy: 'EMP-882104 (David Kim)',
    requestorEmployeeId: 'EMP-882104',
    requestorName: 'David Kim',
    createdAt: '2026-11-18T14:20:00Z',
    targetDeliveryDate: '2026-11-24',
    slaMaxHours: 24,
    slaDeadline: '2026-11-19T14:20:00Z',
    slaStatus: 'ON_TIME',
    notes: '[Demand: PD] Production surge buffer replenishment.',
    customName: 'Laser Cell Dual Gripper Silicone Suction Pads',
    processStep: 'LT',
    machineName: 'Laser Cutter LC-02',
    machineLine: 'Line #601',
    // Hierarchy: Machine => Unit => Assembly
    ebomUnitCode: 'UNT-ROB-03 [Robot Wrist Vacuum Unit]',
    ebomAssemblyCode: 'ASM-LC-003 [Laser Transfer Arm Assembly]',
    ebomMechanism: 'End-Effector Transfer Head',
    ebomEmNo: 'HWBMTL22EC0109',
    demandType: 'PD',
    reviewerName: 'Sarah Jenkins',
    reviewerEmployeeId: 'EMP-771022',
    reviewedAt: '2026-11-19T09:00:00Z',
    approvedQuantity: 24,
    procurementStrategy: 'PURCHASE_NEW',
    systemRequested: true,
    systemRequestId: 'EMS-REQ-99210',
    systemRequestedAt: '2026-11-19T09:15:00Z',
    reviewDecisionNotes: 'PO #PO-2026-8841 issued to SMC Corporation. Delivery ETA: Nov 24.',
    quantityLogicText: '12 cups per robotic wrist * 2 robots = 24 EA'
  },
  {
    id: 'req-005',
    code: 'REQ-2026-005',
    itemCode: 'QCBC04912',
    title: 'Ultra-Precision CCD Alignment Camera 5MP (QCBC04912)',
    category: 'Q4.Vision Systems',
    quantity: 2,
    unit: 'EA',
    estimatedPrice: 1250.0,
    currency: 'USD',
    status: 'UNDER_REVIEW',
    priority: 'URGENT',
    department: 'PO Module Technology Team 2',
    requestedBy: 'EMP-991044 (Alex Chen)',
    requestorEmployeeId: 'EMP-991044',
    requestorName: 'Alex Chen',
    createdAt: '2026-11-20T14:00:00Z',
    targetDeliveryDate: '2026-11-21',
    slaMaxHours: 4,
    slaDeadline: '2026-11-20T18:00:00Z',
    slaStatus: 'NEAR_BREACH',
    notes: '[Demand: BM] High-resolution AOI camera sensor failure.',
    customName: 'Vision Alignment Head CCD Sensor Module 5MP',
    customNameReason: 'Direct CAD spec for vision inspection head alignment',
    processStep: 'BD',
    machineName: 'AOI Station AOI-02',
    machineLine: 'Line #604',
    // Hierarchy: Machine => Unit => Assembly
    ebomUnitCode: 'UNT-CAM-01 [Optical Sensor Head Unit]',
    ebomAssemblyCode: 'ASM-AOI-002 [Vision Gantry Assembly]',
    ebomMechanism: 'Telecentric Vision Gantry',
    ebomEmNo: 'HWBMTL20EC0911',
    demandType: 'BM',
    problemDescription: 'Camera sensor dead pixels causing false defect rejects on 98% of panels. Line #604 stopped.',
    currentSituation: 'Emergency downtime clock ticking. 0 spare cameras in local inventory.',
    quantityLogicText: '1 immediate line replacement + 1 hot-spare = 2 EA',
    emailNotified: true,
    emailNotifiedAt: '2026-11-20T14:45:00Z',
    feedbacks: [
      {
        id: 'fb-5',
        author: 'Sarah Jenkins',
        employeeId: 'EMP-771022',
        role: 'REVIEWER',
        message: 'Workshop Wait-Repair bay has 1 EA camera awaiting lens recalibration (reconditioned unit available within 24h at $350 SPR price). Can we adopt Strategy C (Repair) for 1 EA and approve Strategy A for 1 EA to save $900?',
        timestamp: '2026-11-20T14:30:00Z',
        actionTaken: 'REQUEST_INFO'
      }
    ]
  },
  {
    id: 'req-006',
    code: 'REQ-2026-006',
    itemCode: 'QCBD09123',
    title: 'Linear Guide Rail Carriage Block 15mm (QCBD09123)',
    category: 'Q4.Mechanical Drive',
    quantity: 8,
    unit: 'EA',
    estimatedPrice: 92.0,
    currency: 'USD',
    status: 'APPROVED',
    priority: 'HIGH',
    department: 'PO Module Technology Team 2',
    requestedBy: 'EMP-774012 (Michael Chang)',
    requestorEmployeeId: 'EMP-774012',
    requestorName: 'Michael Chang',
    createdAt: '2026-11-19T08:00:00Z',
    targetDeliveryDate: '2026-11-23',
    slaMaxHours: 48,
    slaDeadline: '2026-11-21T08:00:00Z',
    slaStatus: 'ON_TIME',
    notes: '[Demand: MP] TAB bonder stage motion guide replacement.',
    customName: 'High-Rigidity Linear Motion Slide Block 15mm',
    processStep: 'DIP',
    machineName: 'TAB Bonder TB-01',
    machineLine: 'Line #203',
    // Hierarchy: Machine => Unit => Assembly
    ebomUnitCode: 'UNT-SLD-01 [Thermode Slide Unit]',
    ebomAssemblyCode: 'ASM-TB-001 [Heated Bonder Carriage Assembly]',
    ebomMechanism: 'Thermode Sub-Stage Carriage',
    ebomEmNo: 'HWBMTL19EC0104',
    demandType: 'MP',
    reviewerName: 'Sarah Jenkins',
    reviewerEmployeeId: 'EMP-771022',
    reviewedAt: '2026-11-19T11:00:00Z',
    approvedQuantity: 8,
    procurementStrategy: 'WH_TRANSFER',
    costSavingUSD: 736.0,
    reviewDecisionNotes: 'Interlock Guardrail identified 12 EA available in Central WH2 under transfer allocation. Approved via Strategy B: Inter-Plant Transfer. Zero new purchase cost ($736.00 saved).',
    quantityLogicText: '4 carriages * 2 axes = 8 EA'
  }
];

const VALID_ROLES: UserRole[] = ['ADMIN', 'REQUESTOR', 'APPROVER', 'BUYER', 'AUDITOR'];
const VALID_PROCESSES: ProcessType[] = ['POL', 'TAB', 'DIP', 'LT', 'DB', 'BD'];
const VALID_TEAMS: TeamType[] = ['PO_MODULE_2', 'PO_MODULE_1', 'TAB_DIP', 'LAMI_LASER', 'CP_SG'];
const VALID_VIEWS: NavView[] = ['qcode-lookup', 'dashboard', 'requisitions', 'inventory', 'settings'];

function parseUrlState(): { role: UserRole; process: ProcessType; team: TeamType; view: NavView } {
  const fullHash = window.location.hash.replace(/^#\/?/, '');
  const [hashPath, hashQuery] = fullHash.split('?');
  
  const urlSearch = new URLSearchParams(window.location.search);
  const hashSearch = new URLSearchParams(hashQuery || '');

  let role: UserRole = 'REQUESTOR';
  let process: ProcessType = 'DB';
  let team: TeamType = 'PO_MODULE_2';
  let view: NavView = 'qcode-lookup';

  const pathParts = (hashPath || '').split('/').filter(Boolean);
  if (pathParts.length >= 4) {
    const [pRole, pProc, pTeam, pView] = pathParts;
    if (VALID_ROLES.includes(pRole.toUpperCase() as UserRole)) role = pRole.toUpperCase() as UserRole;
    if (VALID_PROCESSES.includes(pProc.toUpperCase() as ProcessType)) process = pProc.toUpperCase() as ProcessType;
    if (VALID_TEAMS.includes(pTeam.toUpperCase() as TeamType)) team = pTeam.toUpperCase() as TeamType;
    if (VALID_VIEWS.includes(pView.toLowerCase() as NavView)) view = pView.toLowerCase() as NavView;
  } else if (pathParts.length >= 1 && VALID_VIEWS.includes(pathParts[0].toLowerCase() as NavView)) {
    view = pathParts[0].toLowerCase() as NavView;
  }

  const qRole = hashSearch.get('role') || urlSearch.get('role');
  const qTeam = hashSearch.get('team') || urlSearch.get('team');
  const qProcess = hashSearch.get('process') || urlSearch.get('process');
  const qView = hashSearch.get('view') || hashSearch.get('page') || urlSearch.get('view');

  if (qRole && VALID_ROLES.includes(qRole.toUpperCase() as UserRole)) role = qRole.toUpperCase() as UserRole;
  if (qTeam && VALID_TEAMS.includes(qTeam.toUpperCase() as TeamType)) team = qTeam.toUpperCase() as TeamType;
  if (qProcess && VALID_PROCESSES.includes(qProcess.toUpperCase() as ProcessType)) process = qProcess.toUpperCase() as ProcessType;
  if (qView && VALID_VIEWS.includes(qView.toLowerCase() as NavView)) view = qView.toLowerCase() as NavView;

  return { role, process, team, view };
}

function constructUrlHash(v: NavView, r: UserRole, t: TeamType, p: ProcessType): string {
  const params = new URLSearchParams();
  params.set('role', r);
  params.set('team', t);
  params.set('process', p);
  return `#/${v}?${params.toString()}`;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = parseUrlState();
  const [activeView, setActiveViewState] = useState<NavView>(initial.view);
  const [currentRole, setCurrentRoleState] = useState<UserRole>(initial.role);
  const [currentProcess, setCurrentProcessState] = useState<ProcessType>(initial.process);
  const [currentTeam, setCurrentTeamState] = useState<TeamType>(initial.team);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>(initialRequisitions);

  // 1. Configurable Demand Reasons & SLA Policy
  const [demandReasons, setDemandReasons] = useState<DemandReasonConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_demand_reasons_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DEMAND_REASONS;
  });

  const updateDemandReasons = useCallback((reasons: DemandReasonConfig[]) => {
    setDemandReasons(reasons);
    try {
      localStorage.setItem('ops_procurement_demand_reasons_v2', JSON.stringify(reasons));
    } catch {}
  }, []);

  // 2. Configurable Teams
  const [teamsList, setTeamsList] = useState<TeamConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_teams_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TEAMS;
  });

  const updateTeamsList = useCallback((teams: TeamConfig[]) => {
    setTeamsList(teams);
    try {
      localStorage.setItem('ops_procurement_teams_list', JSON.stringify(teams));
    } catch {}
  }, []);

  // 3. Configurable LEC Reviewers
  const [lecReviewers, setLecReviewers] = useState<LecReviewerConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_lec_reviewers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LEC_REVIEWERS;
  });

  const updateLecReviewers = useCallback((reviewers: LecReviewerConfig[]) => {
    setLecReviewers(reviewers);
    try {
      localStorage.setItem('ops_procurement_lec_reviewers', JSON.stringify(reviewers));
    } catch {}
  }, []);

  // 4. Active Reviewer ID
  const [activeLecReviewerId, setActiveLecReviewerIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_active_reviewer_id');
      if (saved) return saved;
    } catch {}
    return 'lec-1';
  });

  const setActiveLecReviewerId = useCallback((id: string) => {
    setActiveLecReviewerIdState(id);
    try {
      localStorage.setItem('ops_procurement_active_reviewer_id', id);
    } catch {}
  }, []);

  // 5. Policy & Guardrail Settings
  const [policySettings, setPolicySettings] = useState<PolicySettings>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_policy_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_POLICY_SETTINGS;
  });

  const updatePolicySettings = useCallback((newSettings: Partial<PolicySettings>) => {
    setPolicySettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('ops_procurement_policy_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const resetToDefaultSettings = useCallback(() => {
    setDemandReasons(DEFAULT_DEMAND_REASONS);
    setTeamsList(DEFAULT_TEAMS);
    setLecReviewers(DEFAULT_LEC_REVIEWERS);
    setActiveLecReviewerIdState('lec-1');
    setPolicySettings(DEFAULT_POLICY_SETTINGS);
    try {
      localStorage.removeItem('ops_procurement_demand_reasons');
      localStorage.removeItem('ops_procurement_teams_list');
      localStorage.removeItem('ops_procurement_lec_reviewers');
      localStorage.removeItem('ops_procurement_active_reviewer_id');
      localStorage.removeItem('ops_procurement_policy_settings');
    } catch {}
  }, []);

  // User Profile (Employee ID + Name binding with Real Factory Personnel from Sheet 2)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (initial.role === 'APPROVER') {
      const activeReviewer = DEFAULT_LEC_REVIEWERS.find(r => r.id === 'lec-1') || DEFAULT_LEC_REVIEWERS[0];
      return {
        employeeId: activeReviewer.employeeId,
        name: activeReviewer.name,
        role: initial.role,
        team: initial.team,
        teamLabel: activeReviewer.team,
        title: activeReviewer.title
      };
    }
    if (initial.role === 'ADMIN') {
      return {
        employeeId: 'VH000500',
        name: 'Hoang Trung Kien',
        role: 'ADMIN',
        team: 'PO_MODULE_2',
        teamLabel: 'PO Module Technology Team 2',
        title: 'Team Leader - PO Module Technology Team 2'
      };
    }
    return {
      employeeId: 'VH149218',
      name: 'Cao Van Tan',
      role: 'REQUESTOR',
      team: 'PO_MODULE_2',
      teamLabel: 'PO Module Technology Team 2',
      title: 'Equipment Engineer'
    };
  });

  // When currentRole or activeLecReviewerId changes, sync currentUser identity
  useEffect(() => {
    if (currentRole === 'APPROVER') {
      const activeReviewer = lecReviewers.find(r => r.id === activeLecReviewerId) || lecReviewers[0];
      setCurrentUser(prev => ({
        ...prev,
        employeeId: activeReviewer ? activeReviewer.employeeId : 'VH081996',
        name: activeReviewer ? activeReviewer.name : 'Pham Duc Long',
        role: currentRole,
        title: activeReviewer ? activeReviewer.title : 'Technician / LEC Reviewer',
        teamLabel: activeReviewer ? activeReviewer.team : 'PO Module Technology Team 2'
      }));
    } else if (currentRole === 'ADMIN') {
      setCurrentUser(prev => ({
        ...prev,
        employeeId: 'VH000500',
        name: 'Hoang Trung Kien',
        role: 'ADMIN',
        title: 'Team Leader - PO Module Technology Team 2',
        team: 'PO_MODULE_2',
        teamLabel: 'PO Module Technology Team 2'
      }));
    } else {
      setCurrentUser(prev => ({
        ...prev,
        employeeId: 'VH149218',
        name: 'Cao Van Tan',
        role: currentRole,
        title: 'Equipment Engineer',
        team: 'PO_MODULE_2',
        teamLabel: 'PO Module Technology Team 2'
      }));
    }
  }, [currentRole, activeLecReviewerId, lecReviewers]);

  const syncToUrl = useCallback((v: NavView, r: UserRole, t: TeamType, p: ProcessType) => {
    const targetHash = constructUrlHash(v, r, t, p);
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, []);

  const setActiveView = (view: NavView) => {
    setActiveViewState(view);
    syncToUrl(view, currentRole, currentTeam, currentProcess);
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    syncToUrl(activeView, role, currentTeam, currentProcess);
  };

  const setCurrentProcess = (proc: ProcessType) => {
    setCurrentProcessState(proc);
    syncToUrl(activeView, currentRole, currentTeam, proc);
  };

  const setCurrentTeam = (team: TeamType) => {
    setCurrentTeamState(team);
    syncToUrl(activeView, currentRole, team, currentProcess);
  };

  // Sync to URL on mount
  useEffect(() => {
    syncToUrl(activeView, currentRole, currentTeam, currentProcess);
  }, []);

  // Listen to browser navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const parsed = parseUrlState();
      setActiveViewState(parsed.view);
      setCurrentRoleState(parsed.role);
      setCurrentProcessState(parsed.process);
      setCurrentTeamState(parsed.team);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const addRequisition = (item: Omit<RequisitionItem, 'id' | 'createdAt'>): string => {
    const newId = `req-${Date.now()}`;
    const newCode = `REQ-2026-${String(requisitions.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();
    const dType = item.demandType || 'Setup/MC';
    const slaCalc = calculateSla(nowIso, dType, demandReasons);

    const newItem: RequisitionItem = {
      ...item,
      id: newId,
      code: item.code.startsWith('REQ-') ? item.code : newCode,
      itemCode: item.itemCode || (item.code.startsWith('REQ-') ? undefined : item.code),
      createdAt: nowIso,
      requestorEmployeeId: item.requestorEmployeeId || currentUser.employeeId,
      requestorName: item.requestorName || currentUser.name,
      requestedBy: item.requestedBy || `${currentUser.employeeId} (${currentUser.name})`,
      department: item.department || (currentUser.teamLabel || 'PO Module Technology Team 2'),
      processStep: item.processStep || currentProcess,
      slaMaxHours: slaCalc.slaMaxHours,
      slaDeadline: slaCalc.slaDeadline,
      slaStatus: slaCalc.slaStatus,
      feedbacks: item.feedbacks || [
        {
          id: `fb-init-${Date.now()}`,
          author: currentUser.name,
          employeeId: currentUser.employeeId,
          role: 'REQUESTOR',
          message: `Requisition registered by ${currentUser.employeeId} (${currentUser.name}) for ${item.title}. Submitted for LEC reviewer inspection. Max response SLA: ${slaCalc.slaMaxHours}h.`,
          timestamp: nowIso,
          actionTaken: 'PROVIDE_INFO'
        }
      ]
    };
    setRequisitions((prev) => [newItem, ...prev]);
    return newItem.code;
  };

  const updateStatus = (
    id: string, 
    status: RequisitionStatus, 
    note?: string, 
    reviewer?: string,
    approvedQty?: number,
    strategy?: 'PURCHASE_NEW' | 'WH_TRANSFER' | 'WORKSHOP_REPAIR' | 'CI_SUBSTITUTE',
    costSaving?: number
  ) => {
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated: RequisitionItem = {
          ...r,
          status,
          reviewerName: reviewer || currentUser.name,
          reviewerEmployeeId: currentUser.employeeId,
          reviewedAt: new Date().toISOString(),
          ...(note ? { reviewDecisionNotes: note } : {}),
          ...(approvedQty !== undefined ? { approvedQuantity: approvedQty } : {}),
          ...(strategy ? { procurementStrategy: strategy } : {}),
          ...(costSaving !== undefined ? { costSavingUSD: costSaving } : {})
        };

        if (note) {
          const newFeedback = {
            id: `fb-${Date.now()}`,
            author: reviewer || currentUser.name,
            employeeId: currentUser.employeeId,
            role: 'REVIEWER' as const,
            message: note,
            timestamp: new Date().toISOString(),
            actionTaken: (status === 'APPROVED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'REQUEST_INFO') as any
          };
          updated.feedbacks = [...(updated.feedbacks || []), newFeedback];
        }

        return updated;
      })
    );
  };

  const addFeedback = (
    requisitionId: string, 
    author: string, 
    role: 'REQUESTOR' | 'REVIEWER' | 'ADMIN', 
    message: string, 
    actionTaken?: 'REQUEST_INFO' | 'PROVIDE_INFO' | 'APPROVE' | 'REJECT',
    employeeId?: string
  ) => {
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id !== requisitionId) return r;
        const newFb = {
          id: `fb-${Date.now()}`,
          author,
          employeeId: employeeId || currentUser.employeeId,
          role,
          message,
          timestamp: new Date().toISOString(),
          actionTaken,
        };
        const updatedStatus = actionTaken === 'REQUEST_INFO' ? 'FEEDBACK_PENDING' : 
                              actionTaken === 'PROVIDE_INFO' ? 'UNDER_REVIEW' : 
                              actionTaken === 'APPROVE' ? 'APPROVED' : 
                              actionTaken === 'REJECT' ? 'REJECTED' : r.status;
        return {
          ...r,
          status: updatedStatus as RequisitionStatus,
          feedbacks: [...(r.feedbacks || []), newFb]
        };
      })
    );
  };

  const deleteRequisition = (id: string) => {
    setRequisitions((prev) => prev.filter((r) => r.id !== id));
  };

  // 6. Personnel (Engineers, LEC Reviewers, Leaders) State & Full CRUD with Excel Import
  const [personnelList, setPersonnelList] = useState<PersonnelMember[]>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_personnel_list_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PERSONNEL;
  });

  const addPersonnel = useCallback((member: Omit<PersonnelMember, 'id'>) => {
    const newMember: PersonnelMember = {
      ...member,
      id: `per-${Date.now()}`
    };
    setPersonnelList(prev => {
      const updated = [newMember, ...prev];
      try {
        localStorage.setItem('ops_procurement_personnel_list_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updatePersonnel = useCallback((id: string, member: Partial<PersonnelMember>) => {
    setPersonnelList(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...member } : p);
      try {
        localStorage.setItem('ops_procurement_personnel_list_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deletePersonnel = useCallback((id: string) => {
    setPersonnelList(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('ops_procurement_personnel_list_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const importPersonnelFromExcel = useCallback((members: Omit<PersonnelMember, 'id'>[]) => {
    setPersonnelList(prev => {
      const existingEmpIds = new Set(prev.map(p => p.employeeId.toUpperCase()));
      const newItems: PersonnelMember[] = [];
      members.forEach((m, idx) => {
        if (!existingEmpIds.has(m.employeeId.toUpperCase())) {
          existingEmpIds.add(m.employeeId.toUpperCase());
          newItems.push({
            ...m,
            id: `per-imp-${Date.now()}-${idx}`
          });
        }
      });
      const combined = [...newItems, ...prev];
      try {
        localStorage.setItem('ops_procurement_personnel_list_v3', JSON.stringify(combined));
      } catch {}
      return combined;
    });
  }, []);

  // 6b. Equipment & EM No Master Records State & Full CRUD
  const [emNoList, setEmNoList] = useState<EmNoRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ops_procurement_em_no_list_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EM_NO_RECORDS;
  });

  const addEmNo = useCallback((record: Omit<EmNoRecord, 'id'>) => {
    const newRecord: EmNoRecord = {
      ...record,
      id: `em-${Date.now()}`
    };
    setEmNoList(prev => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('ops_procurement_em_no_list_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updateEmNo = useCallback((id: string, record: Partial<EmNoRecord>) => {
    setEmNoList(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...record } : item);
      try {
        localStorage.setItem('ops_procurement_em_no_list_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteEmNo = useCallback((id: string) => {
    setEmNoList(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('ops_procurement_em_no_list_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const importEmNoRecords = useCallback((records: Omit<EmNoRecord, 'id'>[]) => {
    setEmNoList(prev => {
      const existingEmNos = new Set(prev.map(item => item.emNo.toUpperCase()));
      const newItems: EmNoRecord[] = [];
      records.forEach((r, idx) => {
        if (!existingEmNos.has(r.emNo.toUpperCase())) {
          existingEmNos.add(r.emNo.toUpperCase());
          newItems.push({
            ...r,
            id: `em-imp-${Date.now()}-${idx}`
          });
        }
      });
      const updated = [...newItems, ...prev];
      try {
        localStorage.setItem('ops_procurement_em_no_list_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const registerEbomLink = useCallback((
    emNo: string, 
    qCode: string, 
    metadata?: { machine?: string; unit?: string; assembly?: string; customName?: string }
  ) => {
    setEmNoList(prev => {
      const cleanEmNo = emNo.trim().toUpperCase();
      const existingIndex = prev.findIndex(item => item.emNo.toUpperCase() === cleanEmNo);
      let updated: EmNoRecord[];
      if (existingIndex >= 0) {
        const target = prev[existingIndex];
        const existingCodes = new Set(target.associatedQCodes || []);
        existingCodes.add(qCode.trim().toUpperCase());
        const updatedItem: EmNoRecord = {
          ...target,
          associatedQCodes: Array.from(existingCodes),
          notes: metadata?.customName ? `Linked to ${metadata.customName} (${qCode})` : target.notes
        };
        updated = [...prev];
        updated[existingIndex] = updatedItem;
      } else {
        const newRecord: EmNoRecord = {
          id: `em-ebom-${Date.now()}`,
          emNo: cleanEmNo,
          factory: 'Hai Phong Plant',
          factoryId: 'HW',
          line: 'Line #204',
          lineHex: '4',
          modelProduct: 'Display Module Standard',
          process: 'DB',
          machine: metadata?.machine || 'COF BONDER',
          unit: metadata?.unit || 'MAIN BONDING',
          assembly: metadata?.assembly || 'HEAD 1',
          element: metadata?.customName || `Component ${qCode}`,
          status: 'ACTIVE',
          criticality: 'HIGH',
          associatedQCodes: [qCode.trim().toUpperCase()],
          notes: `Registered via EBOM Requisition Link for ${qCode}`
        };
        updated = [newRecord, ...prev];
      }
      try {
        localStorage.setItem('ops_procurement_em_no_list_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // 7. LEC Batch Actions on Requisitions
  const batchAssignReviewer = useCallback((reqIds: string[], reviewerName: string, reviewerId: string) => {
    const nowIso = new Date().toISOString();
    setRequisitions(prev =>
      prev.map(r => {
        if (!reqIds.includes(r.id)) return r;
        const newFb = {
          id: `fb-batch-assign-${Date.now()}-${r.id}`,
          author: currentUser.name,
          employeeId: currentUser.employeeId,
          role: 'REVIEWER' as const,
          message: `[Batch Assignment] Assigned to technical reviewer ${reviewerName} (${reviewerId}) for quotation audit.`,
          timestamp: nowIso,
          actionTaken: 'REQUEST_INFO' as const
        };
        return {
          ...r,
          assignedReviewer: reviewerName,
          assignedReviewerEmployeeId: reviewerId,
          quotationStatus: 'IN_PROGRESS',
          feedbacks: [...(r.feedbacks || []), newFb]
        };
      })
    );
  }, [currentUser]);

  const batchSystemRequest = useCallback((reqIds: string[]) => {
    const nowIso = new Date().toISOString();
    setRequisitions(prev =>
      prev.map(r => {
        if (!reqIds.includes(r.id)) return r;
        const sysId = `EMS-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
        const newFb = {
          id: `fb-batch-sys-${Date.now()}-${r.id}`,
          author: currentUser.name,
          employeeId: currentUser.employeeId,
          role: 'REVIEWER' as const,
          message: `[System Request] Dispatched to factory ERP/EMS system with reference ID #${sysId}.`,
          timestamp: nowIso,
          actionTaken: 'PROVIDE_INFO' as const
        };
        return {
          ...r,
          systemRequested: true,
          systemRequestId: sysId,
          systemRequestedAt: nowIso,
          feedbacks: [...(r.feedbacks || []), newFb]
        };
      })
    );
  }, [currentUser]);

  const batchSendEmail = useCallback((reqIds: string[], subject?: string) => {
    const nowIso = new Date().toISOString();
    setRequisitions(prev =>
      prev.map(r => {
        if (!reqIds.includes(r.id)) return r;
        const newFb = {
          id: `fb-batch-mail-${Date.now()}-${r.id}`,
          author: currentUser.name,
          employeeId: currentUser.employeeId,
          role: 'REVIEWER' as const,
          message: `[Email Notification] Priority notification dispatched to ${r.requestorName || 'Requestor'} regarding ${subject || 'expedited review status'}.`,
          timestamp: nowIso,
          actionTaken: 'PROVIDE_INFO' as const
        };
        return {
          ...r,
          emailNotified: true,
          emailNotifiedAt: nowIso,
          feedbacks: [...(r.feedbacks || []), newFb]
        };
      })
    );
  }, [currentUser]);

  const batchAddToMonthlyAppraisal = useCallback((reqIds: string[], month: string = '2026-11') => {
    const nowIso = new Date().toISOString();
    setRequisitions(prev =>
      prev.map(r => {
        if (!reqIds.includes(r.id)) return r;
        const newFb = {
          id: `fb-batch-appr-${Date.now()}-${r.id}`,
          author: currentUser.name,
          employeeId: currentUser.employeeId,
          role: 'REVIEWER' as const,
          message: `[Monthly Appraisal] Item scheduled for ${month} Monthly Equipment & CAPEX Committee Appraisal.`,
          timestamp: nowIso,
          actionTaken: 'REQUEST_INFO' as const
        };
        return {
          ...r,
          monthlyAppraisal: true,
          monthlyAppraisalMonth: month,
          feedbacks: [...(r.feedbacks || []), newFb]
        };
      })
    );
  }, [currentUser]);

  const batchUpdateStatus = useCallback((reqIds: string[], status: RequisitionStatus, note: string) => {
    const nowIso = new Date().toISOString();
    setRequisitions(prev =>
      prev.map(r => {
        if (!reqIds.includes(r.id)) return r;
        const newFb = {
          id: `fb-batch-status-${Date.now()}-${r.id}`,
          author: currentUser.name,
          employeeId: currentUser.employeeId,
          role: 'REVIEWER' as const,
          message: `[Batch Decision] Status updated to ${status}. Note: ${note}`,
          timestamp: nowIso,
          actionTaken: (status === 'APPROVED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'PROVIDE_INFO') as any
        };
        return {
          ...r,
          status,
          reviewedAt: nowIso,
          reviewerName: currentUser.name,
          reviewerEmployeeId: currentUser.employeeId,
          reviewDecisionNotes: note,
          feedbacks: [...(r.feedbacks || []), newFb]
        };
      })
    );
  }, [currentUser]);

  return (
    <ProcurementContext.Provider
      value={{
        activeView,
        setActiveView,
        currentRole,
        setCurrentRole,
        currentProcess,
        setCurrentProcess,
        currentTeam,
        setCurrentTeam,
        currentUser,
        setCurrentUser,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        requisitions,
        addRequisition,
        updateStatus,
        addFeedback,
        deleteRequisition,
        demandReasons,
        updateDemandReasons,
        teamsList,
        updateTeamsList,
        lecReviewers,
        updateLecReviewers,
        activeLecReviewerId,
        setActiveLecReviewerId,
        policySettings,
        updatePolicySettings,
        resetToDefaultSettings,
        personnelList,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        importPersonnelFromExcel,
        emNoList,
        addEmNo,
        updateEmNo,
        deleteEmNo,
        importEmNoRecords,
        registerEbomLink,
        batchAssignReviewer,
        batchSystemRequest,
        batchSendEmail,
        batchAddToMonthlyAppraisal,
        batchUpdateStatus,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = (): ProcurementContextType => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
