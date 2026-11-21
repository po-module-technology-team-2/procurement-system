import React from 'react';
import { EmNoRecord, EquipmentStatus, EquipmentCriticality } from '../../../types';
import { ALL_FACTORIES, ALL_LINES, ALL_PROCESSES, ALL_MODEL_PRODUCTS } from '../../../data/emNoMasterData';
import { AVAILABLE_MACHINES, getUnitsForMachine, getAssembliesForUnit } from '../../../data/equipmentHierarchy';
import { generateEmNo } from '../../../utils/emNoHelper';
import { Cpu, X } from 'lucide-react';

interface EmNoModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: Omit<EmNoRecord, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<EmNoRecord, 'id'>>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmNoModal: React.FC<EmNoModalProps> = ({
  isOpen,
  isEditing,
  formData,
  setFormData,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {isEditing ? 'Edit EM No Record' : 'Register New EM No'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Factory</label>
              <select
                value={formData.factory}
                onChange={(e) => setFormData(prev => ({ ...prev, factory: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                {ALL_FACTORIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Production Line</label>
              <select
                value={formData.line}
                onChange={(e) => {
                  const l = e.target.value;
                  const hexMatch = l.match(/#(\d+)/);
                  const hex = hexMatch ? hexMatch[1].slice(-1) : '1';
                  setFormData(prev => ({ ...prev, line: l, lineHex: hex }));
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                {ALL_LINES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Process</label>
              <select
                value={formData.process}
                onChange={(e) => setFormData(prev => ({ ...prev, process: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                {ALL_PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Machine</label>
              <select
                value={formData.machine}
                onChange={(e) => {
                  const m = e.target.value;
                  const units = getUnitsForMachine(m);
                  const defaultUnit = units[0] || 'LOADING';
                  const assemblies = getAssembliesForUnit(m, defaultUnit);
                  const defaultAssembly = assemblies[0] || 'BUFFER STAGE 1-1';
                  const newEmNo = generateEmNo('HW', 'B', formData.process as string, '2', formData.lineHex, m, defaultUnit);

                  setFormData(prev => ({
                    ...prev,
                    machine: m,
                    unit: defaultUnit,
                    assembly: defaultAssembly,
                    emNo: newEmNo
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                {AVAILABLE_MACHINES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Assembly</label>
              <input
                type="text"
                value={formData.assembly}
                onChange={(e) => setFormData(prev => ({ ...prev, assembly: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Element (Sub-Component)</label>
              <input
                type="text"
                required
                value={formData.element}
                onChange={(e) => setFormData(prev => ({ ...prev, element: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Model Product</label>
              <select
                value={formData.modelProduct}
                onChange={(e) => setFormData(prev => ({ ...prev, modelProduct: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                {ALL_MODEL_PRODUCTS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">EM No (14 Chars) *</label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateEmNo('HW', 'B', formData.process as string, '2', formData.lineHex, formData.machine, formData.unit);
                    setFormData(prev => ({ ...prev, emNo: generated }));
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Re-generate 14 Chars
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.emNo}
                onChange={(e) => setFormData(prev => ({ ...prev, emNo: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Health Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as EquipmentStatus }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MAINTENANCE_REQUIRED">MAINTENANCE REQUIRED</option>
                <option value="DOWN_ALERT">DOWN ALERT</option>
                <option value="STANDBY">STANDBY</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData(prev => ({ ...prev, criticality: e.target.value as EquipmentCriticality }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="STANDARD">STANDARD</option>
              </select>
            </div>
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
              {isEditing ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
