import React from 'react';
import { Search, X, ListFilter, FolderTree } from 'lucide-react';
import { ALL_FACTORIES, ALL_LINES, ALL_PROCESSES } from '../../../data/emNoMasterData';
import { AVAILABLE_MACHINES } from '../../../data/equipmentHierarchy';

interface EmNoFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterFactory: string;
  setFilterFactory: (f: string) => void;
  filterLine: string;
  setFilterLine: (l: string) => void;
  filterProcess: string;
  setFilterProcess: (p: string) => void;
  filterMachine: string;
  setFilterMachine: (m: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterCriticality: string;
  setFilterCriticality: (c: string) => void;
  viewMode: 'TABLE' | 'TREE';
  setViewMode: (v: 'TABLE' | 'TREE') => void;
}

export const EmNoFilterBar: React.FC<EmNoFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterFactory,
  setFilterFactory,
  filterLine,
  setFilterLine,
  filterProcess,
  setFilterProcess,
  filterMachine,
  setFilterMachine,
  filterStatus,
  setFilterStatus,
  filterCriticality,
  setFilterCriticality,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by EM No (e.g. HWBMTL21101101), Machine, Unit, Assembly, Element, Model Product, or Q-Code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center self-end lg:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'TABLE'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Data Grid Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TREE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'TREE'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Hierarchy Tree</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Factory</label>
          <select
            value={filterFactory}
            onChange={(e) => setFilterFactory(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Factories</option>
            {ALL_FACTORIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Line Number</label>
          <select
            value={filterLine}
            onChange={(e) => setFilterLine(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Lines (12)</option>
            {ALL_LINES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Process</label>
          <select
            value={filterProcess}
            onChange={(e) => setFilterProcess(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Processes</option>
            {ALL_PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Machine</label>
          <select
            value={filterMachine}
            onChange={(e) => setFilterMachine(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Machines ({AVAILABLE_MACHINES.length})</option>
            {AVAILABLE_MACHINES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Health Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE (Normal)</option>
            <option value="MAINTENANCE_REQUIRED">Maintenance Due</option>
            <option value="DOWN_ALERT">DOWN / Alert</option>
            <option value="STANDBY">Standby</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Criticality</label>
          <select
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Criticalities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="STANDARD">Standard</option>
          </select>
        </div>
      </div>
    </div>
  );
};
