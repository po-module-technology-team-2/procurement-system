import React from 'react';
import { EmNoRecord } from '../../../types';
import { getEquipmentStatusBadge, getCriticalityBadge } from '../../../utils/emNoHelper';
import { Cpu, X, Copy, Check, Plus } from 'lucide-react';

interface EmNoDrawerProps {
  isOpen: boolean;
  record: EmNoRecord | null;
  copiedCode: string | null;
  onCopy: (t: string) => void;
  onClose: () => void;
  onLaunchQuickReq: (r: EmNoRecord) => void;
}

export const EmNoDrawer: React.FC<EmNoDrawerProps> = ({
  isOpen,
  record,
  copiedCode,
  onCopy,
  onClose,
  onLaunchQuickReq,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto animate-slideLeft p-6 space-y-6">
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  EM No Specification Sheet
                </h3>
                <span className="text-[11px] text-slate-400">Detailed Shopfloor Equipment Breakdown</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* EM No Code Title */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Equipment Master Code (14 Chars)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                {record.emNo}
              </span>
              <button
                type="button"
                onClick={() => onCopy(record.emNo)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                title="Copy EM No"
              >
                {copiedCode === record.emNo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 14 Chars Deep Breakdown */}
          <div className="mt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              14-Character Code Anatomy Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Chars 1-2: Factory</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.factoryId} (Hai Phong)</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Char 3: Shop</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.shop || 'Shop B'}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Chars 4-6: Process</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.process}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Char 7: Floor</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.floor || 'Floor 2'}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Char 8: Line (Hex)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.line} (Hex: {record.lineHex})</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Chars 9-14: Machine/Unit</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.machine}</span>
              </div>
            </div>
          </div>

          {/* Shopfloor Parameters */}
          <div className="mt-5 space-y-2 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shopfloor Parameters
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Model Product</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.modelProduct}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Machine</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.machine}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Unit</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.unit}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Assembly</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.assembly}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Element (Sub-Component)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{record.element}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Equipment Maker</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.maker || 'LG PRI'}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Operational Health Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEquipmentStatusBadge(record.status)}`}>
                  {record.status}
                </span>
              </div>
              <div className="py-2.5 px-3 flex justify-between">
                <span className="text-slate-400">Criticality</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCriticalityBadge(record.criticality)}`}>
                  {record.criticality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onLaunchQuickReq(record)}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Part Requisition</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
