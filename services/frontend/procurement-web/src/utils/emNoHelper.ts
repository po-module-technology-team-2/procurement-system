import { EquipmentStatus, EquipmentCriticality } from '../types';

const MACHINE_CODE_MAP: Record<string, string> = {
  'CLEAN': '10', 
  'POL ATTACHMENT': '20', 
  'AUTO CLAVE': '50', 
  'CP LOADER': 'AC',
  'CP UNLOADER': 'AM', 
  'MICRO COATING': 'BP', 
  'FOF BONDER': 'DS', 
  'LASER MARKING': 'EC',
  'COF BONDER': 'HE', 
  'SHIELDING TAPE ATTACHER': 'HP', 
  'AP TRIMMING': 'JX',
  'OCA ATTACHMENT': 'KG', 
  'TSA BONDER': 'NI', 
  'B/A INSPECTION C/V': 'OJ'
};

/**
 * Generates an authentic 14-character EM No based on factory taxonomy:
 * [Factory 2c] + [Shop 1c] + [Process 3c] + [Floor 1c] + [Line 1c] + [Machine 2c] + [Unit 2c] + [Seq 2c]
 */
export function generateEmNo(
  fac: string = 'HW', 
  shop: string = 'B', 
  proc: string = 'MTL', 
  floor: string = '2', 
  lineHex: string = '1', 
  machine: string = 'CLEAN', 
  unit: string = 'LOADING', 
  seq: string = '01'
): string {
  const f = (fac || 'HW').padEnd(2, 'X').slice(0, 2).toUpperCase();
  const s = (shop || 'B').slice(0, 1).toUpperCase();
  const p = (proc || 'MTL').padEnd(3, 'X').slice(0, 3).toUpperCase();
  const fl = (floor || '2').slice(0, 1);
  const l = (lineHex || '1').slice(0, 1).toUpperCase();
  
  const mCode = MACHINE_CODE_MAP[machine] || '10';
  const uCode = '11';
  const sCode = (seq || '01').padStart(2, '0').slice(0, 2);

  return `${f}${s}${p}${fl}${l}${mCode}${uCode}${sCode}`;
}

/**
 * Decodes 14-character syntax into structured component breakdown
 */
export function decodeEmNoSyntax(emNo: string) {
  const code = (emNo || '').padEnd(14, ' ');
  return {
    factoryId: code.slice(0, 2).trim(),
    shop: code.slice(2, 3).trim(),
    processCode: code.slice(3, 6).trim(),
    floor: code.slice(6, 7).trim(),
    lineHex: code.slice(7, 8).trim(),
    machineCode: code.slice(8, 10).trim(),
    unitCode: code.slice(10, 12).trim(),
    sequence: code.slice(12, 14).trim(),
  };
}

export function getEquipmentStatusBadge(status: EquipmentStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'MAINTENANCE_REQUIRED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'DOWN_ALERT':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse';
    case 'STANDBY':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  }
}

export function getCriticalityBadge(crit: EquipmentCriticality): string {
  switch (crit) {
    case 'CRITICAL':
      return 'bg-red-500 text-white font-bold';
    case 'HIGH':
      return 'bg-amber-500 text-white font-semibold';
    case 'MEDIUM':
      return 'bg-blue-500 text-white';
    case 'STANDARD':
      return 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  }
}
