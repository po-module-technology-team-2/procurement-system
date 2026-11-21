import React from 'react';
import { DemandReasonConfig, Priority } from '../../../types';
import { Tag, Plus, Trash2 } from 'lucide-react';

interface DemandReasonsTabProps {
  demandReasons: DemandReasonConfig[];
  onOpenAddModal: () => void;
  onDeleteReason: (code: string) => void;
}

export const DemandReasonsTab: React.FC<DemandReasonsTabProps> = ({
  demandReasons,
  onOpenAddModal,
  onDeleteReason,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <span>Purchase Requisition Reasons (BM, MP, Setup, MC & Custom Reasons)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure reason codes, titles, production impacts, and interlock review requirements. Full CRUD supported.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Reason</span>
            </button>
          </div>
        </div>

        {/* Reasons Table */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[700px] text-left text-xs table-auto">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-28">Code</th>
                <th className="py-3 px-3 w-52">Label / Reason Name</th>
                <th className="py-3 px-3 w-24">Max SLA</th>
                <th className="py-3 px-3 w-28">Priority</th>
                <th className="py-3 px-3 min-w-[200px]">Impact Description</th>
                <th className="py-3 px-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {demandReasons.map((reason) => {
                const isCoreReason = ['BM', 'MP', 'Setup', 'MC', 'Setup/MC', 'PD'].includes(reason.code);
                return (
                  <tr key={reason.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {reason.code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {reason.label}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {reason.slaHours}h
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        reason.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        reason.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {reason.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {reason.impactDescription || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!isCoreReason && (
                        <button
                          type="button"
                          onClick={() => onDeleteReason(reason.code)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete custom reason"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
