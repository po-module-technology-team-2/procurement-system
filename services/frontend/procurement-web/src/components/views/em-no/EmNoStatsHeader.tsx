import React from 'react';
import { Layers, GitBranch, AlertTriangle, Boxes } from 'lucide-react';

interface EmNoStatsHeaderProps {
  kpis: {
    total: number;
    active: number;
    maintenance: number;
    alertCount: number;
    uniqueLines: number;
    uniqueMachines: number;
    linkedPartsCount: number;
  };
}

export const EmNoStatsHeader: React.FC<EmNoStatsHeaderProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total EM No Master
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {kpis.total.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              across {kpis.uniqueMachines} Machines
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Operating Lines
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {kpis.uniqueLines}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              100% Synced
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <GitBranch className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Equipment Status
          </span>
          <div className="flex items-center gap-2 mt-1 text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {kpis.active} Normal
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              {kpis.alertCount} Alert / Down
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Linked Q-Code Parts
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {kpis.linkedPartsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Spare BOM Mapped
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Boxes className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
