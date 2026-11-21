import React from 'react';
import { EmNoRecord } from '../../../types';
import { getEquipmentStatusBadge } from '../../../utils/emNoHelper';
import { 
  FolderTree, 
  Cpu, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowRight, 
  Info 
} from 'lucide-react';

interface EmNoTreeProps {
  treeHierarchy: Record<string, Record<string, Record<string, EmNoRecord[]>>>;
  expandedMachines: Set<string>;
  toggleMachineExpand: (mach: string) => void;
  expandedUnits: Set<string>;
  toggleUnitExpand: (key: string) => void;
  treeSelectedRecord: EmNoRecord | null;
  setTreeSelectedRecord: (r: EmNoRecord | null) => void;
  copiedCode: string | null;
  onCopy: (t: string) => void;
  onOpenQuickReq: (r: EmNoRecord) => void;
  onOpenEdit: (r: EmNoRecord) => void;
  onDelete: (id: string, emNo: string) => void;
  onOpenDetail: (r: EmNoRecord) => void;
}

export const EmNoTree: React.FC<EmNoTreeProps> = ({
  treeHierarchy,
  expandedMachines,
  toggleMachineExpand,
  expandedUnits,
  toggleUnitExpand,
  treeSelectedRecord,
  setTreeSelectedRecord,
  copiedCode,
  onCopy,
  onOpenQuickReq,
  onOpenEdit,
  onDelete,
  onOpenDetail,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Tree Navigator (5 cols) */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-3 max-h-[750px] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              EBOM Hierarchy Explorer
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {Object.keys(treeHierarchy).length} Machines
          </span>
        </div>

        {/* Tree Nodes */}
        <div className="space-y-1 text-xs">
          {Object.keys(treeHierarchy).sort().map(mach => {
            const isMachOpen = expandedMachines.has(mach);
            const units = treeHierarchy[mach];

            return (
              <div key={mach} className="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden">
                <div
                  onClick={() => toggleMachineExpand(mach)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    {isMachOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <Cpu className="w-3.5 h-3.5 text-blue-500" />
                    <span>{mach}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                    {Object.keys(units).length} Units
                  </span>
                </div>

                {isMachOpen && (
                  <div className="p-2 pl-4 space-y-1.5 bg-white dark:bg-slate-900">
                    {Object.keys(units).sort().map(unit => {
                      const unitKey = `${mach}|${unit}`;
                      const isUnitOpen = expandedUnits.has(unitKey);
                      const assemblies = units[unit];

                      return (
                        <div key={unitKey} className="border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                          <div
                            onClick={() => toggleUnitExpand(unitKey)}
                            className="py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <div className="flex items-center gap-1.5">
                              {isUnitOpen ? (
                                <ChevronDown className="w-3 h-3 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              )}
                              <Layers className="w-3 h-3 text-indigo-500" />
                              <span>{unit}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {Object.keys(assemblies).length} assemblies
                            </span>
                          </div>

                          {isUnitOpen && (
                            <div className="pl-4 pt-1 space-y-1">
                              {Object.keys(assemblies).sort().map(assembly => {
                                const recs = assemblies[assembly];

                                return (
                                  <div key={assembly} className="space-y-1">
                                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                                      <span>↳</span>
                                      <span>{assembly}</span>
                                    </div>

                                    <div className="pl-3 space-y-1">
                                      {recs.map(rec => {
                                        const isSelected = treeSelectedRecord?.id === rec.id;
                                        return (
                                          <div
                                            key={rec.id}
                                            onClick={() => setTreeSelectedRecord(rec)}
                                            className={`p-2 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all border ${
                                              isSelected
                                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-sm'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent text-slate-700 dark:text-slate-300'
                                            }`}
                                          >
                                            <div className="min-w-0">
                                              <span className="font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400 block">
                                                {rec.emNo}
                                              </span>
                                              <span className="text-[10px] text-slate-500 truncate block">
                                                {rec.element}
                                              </span>
                                            </div>
                                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${getEquipmentStatusBadge(rec.status)} shrink-0`}>
                                              {rec.status}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Detail Inspection Card (7 cols) */}
      <div className="lg:col-span-7">
        {treeSelectedRecord ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Selected Equipment Specification Sheet
                </span>
                <h2 className="text-xl font-mono font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  {treeSelectedRecord.emNo}
                  <button
                    type="button"
                    onClick={() => onCopy(treeSelectedRecord.emNo)}
                    className="text-slate-400 hover:text-slate-600"
                    title="Copy EM No"
                  >
                    {copiedCode === treeSelectedRecord.emNo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {treeSelectedRecord.element} • {treeSelectedRecord.modelProduct}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getEquipmentStatusBadge(treeSelectedRecord.status)}`}>
                  {treeSelectedRecord.status}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenQuickReq(treeSelectedRecord)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Requisition</span>
                </button>
              </div>
            </div>

            {/* 14-Character Code Anatomy Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                14-Character EM No Syntax Decoder
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Factory ID</span>
                  <span className="font-mono font-bold text-blue-600">{treeSelectedRecord.factoryId}</span>
                  <span className="text-[10px] text-slate-500 block truncate">Hai Phong Watch</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Line Decoded</span>
                  <span className="font-mono font-bold text-indigo-600">{treeSelectedRecord.line}</span>
                  <span className="text-[10px] text-slate-500 block">Hex: {treeSelectedRecord.lineHex}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Process</span>
                  <span className="font-mono font-bold text-emerald-600">{treeSelectedRecord.process}</span>
                  <span className="text-[10px] text-slate-500 block">Floor {treeSelectedRecord.floor}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Maker</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{treeSelectedRecord.maker || 'LG PRI'}</span>
                  <span className="text-[10px] text-slate-500 block">Installed: {treeSelectedRecord.installedCount} EA</span>
                </div>
              </div>
            </div>

            {/* Hierarchy Mapping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Machine Level</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {treeSelectedRecord.machine}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Unit Level</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {treeSelectedRecord.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assembly Level</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {treeSelectedRecord.assembly}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Model Product</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {treeSelectedRecord.modelProduct}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Sub-Element Mechanism</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {treeSelectedRecord.element}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Associated Q-Codes</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {treeSelectedRecord.associatedQCodes && treeSelectedRecord.associatedQCodes.length > 0 ? (
                      treeSelectedRecord.associatedQCodes.map(q => (
                        <span key={q} className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {q}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No Q-Codes linked yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenEdit(treeSelectedRecord)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(treeSelectedRecord.id, treeSelectedRecord.emNo)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onOpenDetail(treeSelectedRecord)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full Detailed View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <FolderTree className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              Select an Element Node in the Hierarchy Tree
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Click on any machine, unit, assembly, and element in the left tree explorer to inspect its full 14-char EM No breakdown and launch requisitions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
