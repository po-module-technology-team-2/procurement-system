import { DemandType, SlaStatus, DemandReasonConfig } from '../types';

export const SLA_HOURS_MAP: Record<DemandType, number> = {
  'BM': 4,        // Emergency Breakdown: 4 Hours Max
  'Setup/MC': 12, // Conversion / Setup: 12 Hours Max
  'PD': 24,       // Production Demand: 24 Hours Max
  'MP': 48        // Periodic Overhaul: 48 Hours Max
};

/**
 * Calculates remaining hours, SLA deadline, and breach status for a requisition.
 */
export function calculateSla(
  createdAtIso: string, 
  demandType: string = 'Setup/MC',
  demandConfigs?: DemandReasonConfig[]
): {
  slaMaxHours: number;
  slaDeadline: string;
  slaStatus: SlaStatus;
  remainingHours: number;
} {
  const match = demandConfigs?.find(c => c.code === demandType);
  const maxHours = match ? match.slaHours : (SLA_HOURS_MAP[demandType as DemandType] || 24);
  const createdMs = new Date(createdAtIso).getTime();
  const deadlineMs = createdMs + (maxHours * 3600 * 1000);
  const nowMs = Date.now();
  const diffHours = (deadlineMs - nowMs) / (3600 * 1000);

  const earlyWarning = match?.earlyWarningHours ?? 2;
  let status: SlaStatus = 'ON_TIME';
  if (diffHours < 0) {
    status = 'BREACHED';
  } else if (diffHours <= earlyWarning) {
    status = 'NEAR_BREACH';
  }

  return {
    slaMaxHours: maxHours,
    slaDeadline: new Date(deadlineMs).toISOString(),
    slaStatus: status,
    remainingHours: Math.round(diffHours * 10) / 10
  };
}
