import React from 'react';
import { PersonnelMember, ProcessType } from '../../../types';
import { Users, FileSpreadsheet, Download, Plus, Search, Shield, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

interface PersonnelTabProps {
  personnelList: PersonnelMember[];
  filteredPersonnel: PersonnelMember[];
  personnelRoleFilter: string;
  setPersonnelRoleFilter: (role: string) => void;
  personnelProcessFilter: string;
  setPersonnelProcessFilter: (proc: string) => void;
  personnelSearch: string;
  setPersonnelSearch: (q: string) => void;
  allProcesses: ProcessType[];
  onOpenAdd: () => void;
  onOpenEdit: (person: PersonnelMember) => void;
  onDelete: (id: string, name: string) => void;
  onOpenExcelImport: () => void;
  onExportCsv: () => void;
}

export const PersonnelTab: React.FC<PersonnelTabProps> = ({
  personnelList,
  filteredPersonnel,
  personnelRoleFilter,
  setPersonnelRoleFilter,
  personnelProcessFilter,
  setPersonnelProcessFilter,
  personnelSearch,
  setPersonnelSearch,
  allProcesses,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onOpenExcelImport,
  onExportCsv,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Action Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Shopfloor Personnel Roster (Engineers, LEC Reviewers, Leaders)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage employee master data (`employees_id`, `name`, `role`, `process`, `team`) with full CRUD and Excel paste sync.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenExcelImport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import from Excel</span>
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Filter by Role</label>
            <select
              value={personnelRoleFilter}
              onChange={(e) => setPersonnelRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-semibold"
            >
              <option value="ALL">All Roles ({personnelList.length})</option>
              <option value="ENGINEER">Engineers</option>
              <option value="LEC">LEC Reviewers</option>
              <option value="LEADER">Line Leaders</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Filter by Process</label>
            <select
              value={personnelProcessFilter}
              onChange={(e) => setPersonnelProcessFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-semibold"
            >
              <option value="ALL">All Manufacturing Processes</option>
              {allProcesses.map(p => (
                <option key={p} value={p}>{p} Process</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Search Employee</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
                placeholder="Search by Employee ID, Name, Team, or specialty..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs table-auto">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-32">Employee ID</th>
                <th className="py-3 px-3 w-44">Name</th>
                <th className="py-3 px-3 w-28">Role</th>
                <th className="py-3 px-3 w-24">Process</th>
                <th className="py-3 px-3 min-w-[200px]">Team / Department</th>
                <th className="py-3 px-3 min-w-[180px]">Specialty / Notes</th>
                <th className="py-3 px-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No employees found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredPersonnel.map((person) => {
                  const isPartLeader = person.role === 'LEADER' && (
                    (person.title && person.title.toLowerCase().includes('part')) ||
                    (person.notes && person.notes.toLowerCase().includes('part leader')) ||
                    ['VH007064', 'VH000757', 'VH000189'].includes(person.employeeId) ||
                    (person.name !== 'Hoang Trung Kien' && !person.title?.toLowerCase().includes('team'))
                  );
                  const isTeamLeader = person.role === 'LEADER' && !isPartLeader;

                  return (
                    <tr key={person.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {person.employeeId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{person.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {person.title || (isPartLeader ? 'Part Leader' : isTeamLeader ? 'Team Leader' : person.role === 'LEC' ? 'Technician / Reviewer' : 'Engineer')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isPartLeader ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 inline-flex items-center gap-1 shadow-xs">
                            <Shield className="w-2.5 h-2.5 text-amber-600" />
                            PART LEADER
                          </span>
                        ) : isTeamLeader ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 inline-flex items-center gap-1 shadow-xs">
                            <Shield className="w-2.5 h-2.5 text-indigo-600" />
                            TEAM LEADER
                          </span>
                        ) : person.role === 'LEC' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                            LEC REVIEWER
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200">
                            ENGINEER
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {person.process}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px]" title={person.team}>
                        {person.team}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]" title={person.notes}>
                        {person.notes || '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenEdit(person)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="Edit employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(person.id, person.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
