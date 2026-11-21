import React from 'react';
import { DemandReasonConfig, Priority } from '../../../types';
import { Clock, RotateCcw, Save } from 'lucide-react';

interface SlaPolicyTabProps {
  editableReasons: DemandReasonConfig[];
  onPriorityChange: (code: string, priority: Priority) => void;
  onSlaHoursChange: (code: string, hours: number) => void;
  onEarlyWarningChange: (code: string, hours: number) => void;
  onAutoEscalateChange: (code: string, hours: number) => void;
  onEscalationTargetChange: (code: string, target: string) => void;
  onSave: () => void;
  onResetToDefault: () => void;
}

export const SlaPolicyTab: React.FC<SlaPolicyTabProps> = ({
  editableReasons,
  onPriorityChange,
  onSlaHoursChange,
  onEarlyWarningChange,
  onAutoEscalateChange,
  onEscalationTargetChange,
  onSave,
  onResetToDefault,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <span>SLA Response Deadlines & Escalation Alarm Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Directly configure response countdown deadlines, early breach warning thresholds, auto-escalation delays, and designated Part Leader / Gatekeeper escalation targets.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Standard Matrix</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save SLA & Escalation Matrix</span>
            </button>
          </div>
        </div>

        {/* Matrix Grid: Interactive Editor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
          {editableReasons.map((r) => {
            return (
              <div
                key={r.code}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-700 transition-all space-y-3.5 shadow-xs"
              >
                {/* Reason Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase ${
                      r.code === 'BM' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200' :
                      r.code === 'MP' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' :
                      r.code === 'MC' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                    }`}>
                      {r.code}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate max-w-[150px]" title={r.label}>
                      {r.label}
                    </span>
                  </div>

                  <select
                    value={r.priority}
                    onChange={(e) => onPriorityChange(r.code, e.target.value as Priority)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border outline-none ${
                      r.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300' :
                      r.priority === 'HIGH' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300' :
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                {/* Numeric SLA Limit Fields */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Max SLA Limit</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={168}
                        value={r.slaHours}
                        onChange={(e) => onSlaHoursChange(r.code, parseInt(e.target.value) || 1)}
                        className="w-16 font-mono font-bold text-base text-blue-600 dark:text-blue-400 bg-transparent outline-none"
                      />
                      <span className="text-[11px] text-slate-500 font-semibold">Hours</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <label className="text-[10px] font-bold text-amber-500 block mb-1">Early Warning</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={48}
                        value={r.earlyWarningHours || 2}
                        onChange={(e) => onEarlyWarningChange(r.code, parseInt(e.target.value) || 1)}
                        className="w-16 font-mono font-bold text-base text-amber-600 dark:text-amber-400 bg-transparent outline-none"
                      />
                      <span className="text-[11px] text-slate-500 font-semibold">Hours</span>
                    </div>
                  </div>
                </div>

                {/* Escalation Target */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Escalation Recipient</label>
                  <input
                    type="text"
                    value={r.escalationTarget || ''}
                    onChange={(e) => onEscalationTargetChange(r.code, e.target.value)}
                    placeholder="e.g. Part Leader & Chief LEC"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
