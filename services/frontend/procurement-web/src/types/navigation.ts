export type NavView = 'qcode-lookup' | 'dashboard' | 'requisitions' | 'inventory' | 'em-no' | 'settings';

export type UserRole = 'ADMIN' | 'REQUESTOR' | 'APPROVER' | 'BUYER' | 'AUDITOR';

export interface UserProfile {
  employeeId: string; // e.g. EMP-882104
  name: string;       // e.g. David Kim
  role: UserRole;
  team: string;       // e.g. PO_MODULE_2
  teamLabel: string;
  title: string;
}
