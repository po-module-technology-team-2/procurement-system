// Production processes requested: POL | TAB | DIP | LT | DB | BD
export type ProcessType = 'POL' | 'TAB' | 'DIP' | 'LT' | 'DB' | 'BD';

// Factory Teams with PO Module Technology Team 2
export type TeamType = 'PO_MODULE_2' | 'PO_MODULE_1' | 'TAB_DIP' | 'LAMI_LASER' | 'CP_SG';

// Lines: #201 ~ #210, #601, #604
export type FactoryLineType = 
  | 'Line #201' 
  | 'Line #202' 
  | 'Line #203' 
  | 'Line #204' 
  | 'Line #205' 
  | 'Line #206' 
  | 'Line #207' 
  | 'Line #208' 
  | 'Line #209' 
  | 'Line #210' 
  | 'Line #601' 
  | 'Line #604';

// Equipment & EM No Master Types (Data.xlsb Sheet 1: Factory, Line, Em No, Model Product, Process, Machine, Unit, Assembly, Element)
export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE_REQUIRED' | 'DOWN_ALERT' | 'STANDBY';
export type EquipmentCriticality = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export interface EmNoRecord {
  id: string;
  emNo: string;            // 14 Chars (e.g. HWBMTL21101101)
  factory: string;         // e.g. HW - Hai Phong Plant
  factoryId: string;       // e.g. HW
  line: string;            // e.g. Line #201
  lineHex: string;         // e.g. 1
  modelProduct: string;    // e.g. Apple Watch Ultra 2 (49mm OLED)
  process: ProcessType | string; // POL, TAB, DIP, LT, DB, BD, MTL, CP
  machine: string;         // e.g. CLEAN, TSA BONDER
  unit: string;            // e.g. LOADING, BONDING
  assembly: string;        // e.g. BUFFER STAGE 1-1
  element: string;         // e.g. Porous Ceramic Vacuum Chuck & Air Float Stage
  maker?: string;          // e.g. YTS, LG PRI, MEERE COMPANY
  floor?: string;          // e.g. Floor 2
  shop?: string;           // e.g. Shop B
  status: EquipmentStatus;
  criticality: EquipmentCriticality;
  associatedQCodes?: string[];
  installedCount?: number;
  lastMaintainedAt?: string;
  notes?: string;
}
