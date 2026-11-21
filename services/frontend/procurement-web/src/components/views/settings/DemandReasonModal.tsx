import React from 'react';
import { DemandReasonConfig, Priority } from '../../../types';
import { Tag, X } from 'lucide-react';

interface DemandReasonModalProps {
  isOpen: boolean;
  newReason: DemandReasonConfig;
  setNewReason: React.Dispatch<React.SetStateAction<DemandReasonConfig>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const DemandReasonModal: React.FC<DemandReasonModalProps> = ({
  isOpen,
  newReason,
  setNewReason,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-600" />
            <span>Add Custom Demand Reason</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reason Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CALIB, RETOOL"
              value={newReason.code}
              onChange={(e) => setNewReason({ ...newReason, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold uppercase outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reason Label / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Precision Optical Sensor Calibration"
              value={newReason.label}
              onChange={(e) => setNewReason({ ...newReason, label: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Max SLA (Hours) *
              </label>
              <input
                type="number"
                min={1}
                max={168}
                required
                value={newReason.slaHours}
                onChange={(e) => setNewReason({ ...newReason, slaHours: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Priority Mapping
              </label>
              <select
                value={newReason.priority}
                onChange={(e) => setNewReason({ ...newReason, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
              >
                <option value="URGENT">URGENT (Line Stoppage)</option>
                <option value="HIGH">HIGH (Standard Tooling)</option>
                <option value="MEDIUM">MEDIUM (PM Overhaul)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Impact Description
            </label>
            <input
              type="text"
              placeholder="Operational impact..."
              value={newReason.impactDescription}
              onChange={(e) => setNewReason({ ...newReason, impactDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20"
            >
              Add Reason
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
