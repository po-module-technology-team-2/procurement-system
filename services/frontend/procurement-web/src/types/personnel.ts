import { ProcessType, FactoryLineType } from './equipment';

export type PersonnelRole = 'ENGINEER' | 'LEC' | 'LEADER';

export interface PersonnelMember {
  id: string;
  employeeId: string; // employees_id e.g. VH149218
  name: string;
  role: PersonnelRole; // ENGINEER, LEC, LEADER
  process: ProcessType; // POL, TAB, DIP, LT, DB, BD
  team: string; // e.g. PO Module Technology Team 2
  email?: string;
  phone?: string;
  title?: string;
  isActive: boolean;
  notes?: string;
}

export interface TeamConfig {
  id: string;
  name: string;
  code: string;
  leadName: string;
  leadEmployeeId: string;
  assignedProcesses: ProcessType[];
  assignedLines: FactoryLineType[];
  location: string;
  active: boolean;
}

export interface LecReviewerConfig {
  id: string;
  employeeId: string;
  name: string;
  title: string;
  team: string;
  assignedProcesses: ProcessType[];
  approvalLimitUSD: number;
  email: string;
  isActive: boolean;
}

export interface PolicySettings {
  agingThresholdDays: number;
  autoApproveLimitUSD: number;
  autoBlockDisuse: boolean;
  enforceCiCheck: boolean;
  enforceEbomEmLength: boolean;
  engineApiUrl: string;
  emsSimulationUrl: string;
}
