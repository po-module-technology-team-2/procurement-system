import React from 'react';
import { EmNoRecord } from '../../../types';
import { Wrench, X } from 'lucide-react';

interface EmNoQuickReqModalProps {
  isOpen: boolean;
  record: EmNoRecord | null;
  partTitle: string;
  setPartTitle: (t: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  urgency: 'URGENT' | 'HIGH' | 'MEDIUM';
  setUrgency: (u: 'URGENT' | 'HIGH' | 'MEDIUM') => void;
  reason: string;
  setReason: (r: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmNoQuickReqModal: React.FC<EmNoQuickReqModalProps> = ({
  isOpen,
  record,
  partTitle,
  setPartTitle,
  quantity,
  setQuantity,
  urgency,
  setUrgency,
  reason,
  setReason,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Quick Requisition for {record.emNo}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Machine & Line:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.machine} ({record.line})</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Unit / Assembly:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.unit} / {record.assembly}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">EM No:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{record.emNo}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Requisition Title *</label>
            <input
              type="text"
              required
              value={partTitle}
              onChange={(e) => setPartTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Quantity (EA) *</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Urgency Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              >
                <option value="URGENT">URGENT (Line Breakdown)</option>
                <option value="HIGH">HIGH Priority</option>
                <option value="MEDIUM">MEDIUM Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Demand Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
            >
              <option value="BM">Breakdown Maintenance (Line Stoppage)</option>
              <option value="Setup">Tooling Setup & Fixture Alignment</option>
              <option value="MP">Periodic PM Overhaul</option>
              <option value="MC">Model Change / Line Conversion</option>
              <option value="PD">Production Demand (Volume Ramp)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Submit Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
