export type RequisitionStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'FEEDBACK_PENDING'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ORDERED'
  | 'FULFILLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// SLA / Max Response Deadline Status
export type SlaStatus = 'ON_TIME' | 'NEAR_BREACH' | 'BREACHED';

export type DemandType = 'BM' | 'MP' | 'Setup' | 'MC' | 'Setup/MC' | 'PD' | string;

export interface DemandReasonConfig {
  code: DemandType | string;
  label: string;
  slaHours: number;
  priority: Priority;
  impactDescription: string;
  badgeColor?: string;
  autoEscalateHours?: number;
  earlyWarningHours?: number;
  escalationTarget?: string;
  escalationChannel?: string;
}

export interface RequisitionFeedback {
  id: string;
  author: string;
  employeeId?: string;
  role: 'REQUESTOR' | 'REVIEWER' | 'ADMIN';
  message: string;
  timestamp: string;
  actionTaken?: 'REQUEST_INFO' | 'PROVIDE_INFO' | 'APPROVE' | 'REJECT';
}

export interface RequisitionItem {
  id: string;
  code: string;
  itemCode?: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  currency: string;
  status: RequisitionStatus;
  priority: Priority;
  department: string;
  requestedBy: string; // e.g. EMP-882104 (David Kim)
  requestorEmployeeId?: string;
  requestorName?: string;
  createdAt: string;
  targetDeliveryDate?: string;
  notes?: string;

  // SLA & Maximum Response Deadline Fields
  slaMaxHours?: number;       // BM: 4h, Setup/MC: 12h, PD: 24h, MP: 48h
  slaDeadline?: string;       // ISO datetime of response limit
  slaStatus?: SlaStatus;      // ON_TIME, NEAR_BREACH, BREACHED

  // Extended registration fields
  customName?: string;
  customNameReason?: string;
  substituteCode?: string;
  substituteType?: 'CI' | 'EOL' | 'DUP' | 'CUSTOM';
  substituteReason?: string;
  processStep?: string;       // POL, TAB, DIP, LT, DB, BD

  // Hierarchy: Machine => Unit => Assembly
  machineName?: string;       // Level 1: Machine (e.g. Die Bonder DB-01)
  machineLine?: string;       // e.g. Line #204, Line #601
  machineLines?: string[];    // Multi-selected Lines e.g. ['Line #201', 'Line #202', 'Line #204']
  ebomUnitCode?: string;      // Level 2: Unit (e.g. UNT-VAC-02 Vacuum Unit)
  ebomAssemblyCode?: string;  // Level 3: Assembly (e.g. ASM-DB-001 Bonding Head)
  ebomMechanism?: string;
  ebomEmNo?: string;          // 14 Chars (e.g. HWBMTL21EC0101)
  ebomPartLevel?: string;
  ebomLifespan?: string;
  ebomDrawingNo?: string;
  ebomRegistered?: boolean;   // Registered / linked to EBOM Master

  // Packaging, Order Limits & Stock Thresholds
  moq?: number;               // Minimum Order Quantity (Số lượng mua tối thiểu)
  mpq?: number;               // Master Package Quantity
  spq?: number;               // Standard Package Quantity
  safetyStock?: number;       // Safety stock threshold to trigger purchase warning
  purchaseCycle?: string;     // NONE, MONTHLY, QUARTERLY, BIWEEKLY, CUSTOM_DAYS

  demandType?: DemandType;
  urgencyLevel?: Priority;
  problemDescription?: string;
  currentSituation?: string;
  lineRunningStatus?: 'NORMAL' | 'DEGRADED' | 'STALLED';
  bufferQuantityOnLine?: number;
  quantityLogicText?: string;

  // Review & Decision Matrix Tracking fields
  feedbacks?: RequisitionFeedback[];
  reviewerName?: string;
  reviewerEmployeeId?: string;
  reviewedAt?: string;
  reviewDecisionNotes?: string;
  approvedQuantity?: number;
  procurementStrategy?: 'PURCHASE_NEW' | 'WH_TRANSFER' | 'WORKSHOP_REPAIR' | 'CI_SUBSTITUTE';
  costSavingUSD?: number;

  // LEC Batch Action & Progress Tracking fields
  monthlyAppraisal?: boolean;           // Flagged for monthly equipment committee appraisal
  monthlyAppraisalMonth?: string;       // e.g. "2026-11"
  assignedReviewer?: string;            // Assigned Reviewer / Quotation Specialist
  assignedReviewerEmployeeId?: string;  // Assigned Reviewer Employee ID
  systemRequested?: boolean;            // Transmitted to ERP/EMS backend
  systemRequestId?: string;             // e.g. "EMS-REQ-88410"
  systemRequestedAt?: string;
  emailNotified?: boolean;              // Email notification alert dispatched
  emailNotifiedAt?: string;
  quotationStatus?: 'NOT_REQUIRED' | 'PENDING' | 'IN_PROGRESS' | 'QUOTED';
}
