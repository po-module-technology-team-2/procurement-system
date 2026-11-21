import React, { useState, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { 
  PersonnelMember, 
  ProcessType, 
  Priority, 
  DemandReasonConfig 
} from '../../types';
import { PersonnelTab } from './settings/PersonnelTab';
import { PersonnelModal } from './settings/PersonnelModal';
import { PersonnelExcelImportModal } from './settings/PersonnelExcelImportModal';
import { DemandReasonsTab } from './settings/DemandReasonsTab';
import { DemandReasonModal } from './settings/DemandReasonModal';
import { SlaPolicyTab } from './settings/SlaPolicyTab';
import { TeamsTab } from './settings/TeamsTab';
import { 
  Users, 
  Tag, 
  Clock, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser, 
    setCurrentUser,
    currentTeam, 
    setCurrentTeam,
    demandReasons,
    updateDemandReasons,
    teamsList,
    personnelList,
    addPersonnel,
    updatePersonnel,
    deletePersonnel,
    importPersonnelFromExcel
  } = useProcurement();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'PERSONNEL' | 'DEMAND_REASONS' | 'SLA_LIMITS' | 'TEAMS'>('PERSONNEL');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // SECTION 1: PERSONNEL MANAGEMENT
  // ----------------------------------------------------
  const [personnelRoleFilter, setPersonnelRoleFilter] = useState<string>('ALL');
  const [personnelProcessFilter, setPersonnelProcessFilter] = useState<string>('ALL');
  const [personnelSearch, setPersonnelSearch] = useState<string>('');

  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);
  const [personnelForm, setPersonnelForm] = useState<Omit<PersonnelMember, 'id'>>({
    employeeId: '',
    name: '',
    role: 'ENGINEER',
    title: 'Engineer',
    process: 'DB',
    team: 'PO Module Technology Team 2',
    email: '',
    phone: '',
    isActive: true,
    notes: ''
  });

  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [rawExcelText, setRawExcelText] = useState('');
  const [excelParseError, setExcelParseError] = useState<string | null>(null);

  const allProcesses: ProcessType[] = ['POL', 'TAB', 'DIP', 'LT', 'DB', 'BD'];

  const filteredPersonnel = useMemo(() => {
    return personnelList.filter(p => {
      if (personnelRoleFilter !== 'ALL' && p.role !== personnelRoleFilter) return false;
      if (personnelProcessFilter !== 'ALL' && p.process !== personnelProcessFilter) return false;
      if (personnelSearch.trim()) {
        const q = personnelSearch.toLowerCase();
        return (
          p.employeeId.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          p.team.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [personnelList, personnelRoleFilter, personnelProcessFilter, personnelSearch]);

  const handleOpenAddPersonnel = () => {
    setEditingPersonnelId(null);
    setPersonnelForm({
      employeeId: `VH${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      role: 'ENGINEER',
      title: 'Engineer',
      process: 'DB',
      team: 'PO Module Technology Team 2',
      email: '',
      phone: '',
      isActive: true,
      notes: ''
    });
    setIsPersonnelModalOpen(true);
  };

  const handleOpenEditPersonnel = (person: PersonnelMember) => {
    setEditingPersonnelId(person.id);
    setPersonnelForm({
      employeeId: person.employeeId,
      name: person.name,
      role: person.role,
      title: person.title || 'Engineer',
      process: person.process,
      team: person.team,
      email: person.email || '',
      phone: person.phone || '',
      isActive: person.isActive,
      notes: person.notes || ''
    });
    setIsPersonnelModalOpen(true);
  };

  const handlePersonnelFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personnelForm.employeeId.trim() || !personnelForm.name.trim()) return;

    if (editingPersonnelId) {
      updatePersonnel(editingPersonnelId, personnelForm);
      showToast(`Updated employee: ${personnelForm.name} (${personnelForm.employeeId})`);
    } else {
      addPersonnel(personnelForm);
      showToast(`Added employee: ${personnelForm.name} (${personnelForm.employeeId})`);
    }
    setIsPersonnelModalOpen(false);
  };

  const handleDeletePersonnelConfirm = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete employee "${name}" from the active roster?`)) {
      deletePersonnel(id);
      showToast(`Deleted employee: ${name}`);
    }
  };

  const handleImportExcelSubmit = () => {
    if (!rawExcelText.trim()) return;
    try {
      const rows = rawExcelText.trim().split('\n');
      const parsedMembers: Omit<PersonnelMember, 'id'>[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        const cols = row.split(/\t|,/).map(c => c.trim().replace(/^"(.*)"$/, '$1'));

        if (cols[0]?.toLowerCase().includes('name') || cols[1]?.toLowerCase().includes('emp') || cols[1]?.toLowerCase().includes('id')) {
          continue;
        }

        if (cols.length >= 2) {
          const name = cols[0] || 'Unknown';
          const empId = cols[1] || `VH${Math.floor(100000 + Math.random() * 900000)}`;
          const team = cols[2] || 'PO Module Technology Team 2';
          const email = cols[3]?.includes('@') ? cols[3] : '';
          const phone = cols[4] || '';
          const title = cols[5] || 'Engineer';
          const proc = (allProcesses.includes(cols[6] as ProcessType) ? cols[6] : 'DB') as ProcessType;

          let role: PersonnelMember['role'] = 'ENGINEER';
          const tLower = title.toLowerCase();
          if (tLower.includes('part leader') || tLower.includes('leader') || tLower.includes('lead')) role = 'LEADER';
          else if (tLower.includes('lec') || tLower.includes('reviewer') || tLower.includes('technician')) role = 'LEC';

          parsedMembers.push({
            employeeId: empId,
            name,
            role,
            process: proc,
            team,
            email,
            phone,
            title,
            isActive: true,
            notes: `${title} - ${team}`
          });
        }
      }

      if (parsedMembers.length === 0) {
        setExcelParseError('No valid rows found. Please copy and paste tab-delimited columns.');
        return;
      }

      importPersonnelFromExcel(parsedMembers);
      setIsExcelImportOpen(false);
      setRawExcelText('');
      setExcelParseError(null);
      showToast(`Imported ${parsedMembers.length} employees into personnel roster!`);
    } catch (err: any) {
      setExcelParseError(`Parse error: ${err.message || 'Check delimiter format'}`);
    }
  };

  const handleExportPersonnelCSV = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Title', 'Process', 'Team', 'Email', 'Phone', 'Notes'];
    const rows = filteredPersonnel.map(p => [
      `"${p.employeeId}"`,
      `"${p.name}"`,
      `"${p.role}"`,
      `"${p.title || ''}"`,
      `"${p.process}"`,
      `"${p.team}"`,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.notes || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Personnel_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredPersonnel.length} personnel records to CSV.`);
  };

  // ----------------------------------------------------
  // SECTION 2: DEMAND REASONS & SLA LIMITS
  // ----------------------------------------------------
  const [editableReasons, setEditableReasons] = useState<DemandReasonConfig[]>(demandReasons);
  const [isAddReasonOpen, setIsAddReasonOpen] = useState(false);
  const [newReason, setNewReason] = useState<DemandReasonConfig>({
    code: '',
    label: '',
    slaHours: 12,
    priority: 'HIGH',
    impactDescription: '',
    badgeColor: 'purple'
  });

  const handleSaveReasons = () => {
    updateDemandReasons(editableReasons);
    showToast('SLA response limits and priority matrices saved successfully!');
  };

  const handleReasonPriorityChange = (code: string, newPriority: Priority) => {
    setEditableReasons(prev => prev.map(r => r.code === code ? { ...r, priority: newPriority } : r));
  };

  const handleReasonSlaChange = (code: string, hours: number) => {
    setEditableReasons(prev => prev.map(r => r.code === code ? { ...r, slaHours: hours } : r));
  };

  const handleEarlyWarningChange = (code: string, hours: number) => {
    setEditableReasons(prev => prev.map(r => r.code === code ? { ...r, earlyWarningHours: hours } : r));
  };

  const handleAutoEscalateChange = (code: string, hours: number) => {
    setEditableReasons(prev => prev.map(r => r.code === code ? { ...r, autoEscalateHours: hours } : r));
  };

  const handleEscalationTargetChange = (code: string, target: string) => {
    setEditableReasons(prev => prev.map(r => r.code === code ? { ...r, escalationTarget: target } : r));
  };

  const handleAddReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.code.trim() || !newReason.label.trim()) return;
    const updated = [...demandReasons, newReason];
    updateDemandReasons(updated);
    setEditableReasons(updated);
    setIsAddReasonOpen(false);
    showToast(`Added custom reason: ${newReason.code} (${newReason.label})`);
  };

  const handleDeleteReason = (code: string) => {
    if (window.confirm(`Delete reason ${code}?`)) {
      const updated = demandReasons.filter(r => r.code !== code);
      updateDemandReasons(updated);
      setEditableReasons(updated);
      showToast(`Deleted reason: ${code}`);
    }
  };

  const handleResetSlaToDefault = () => {
    setEditableReasons(demandReasons);
    showToast('Restored SLA values to loaded defaults.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Configuration & Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure shopfloor personnel, purchase reasons, SLA thresholds, and manufacturing teams.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('PERSONNEL')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'PERSONNEL'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personnel Roster ({personnelList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DEMAND_REASONS')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'DEMAND_REASONS'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Purchase Reasons ({demandReasons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SLA_LIMITS')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'SLA_LIMITS'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA Limits & Alarms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEAMS')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'TEAMS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Factory Teams ({teamsList.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'PERSONNEL' && (
        <PersonnelTab
          personnelList={personnelList}
          filteredPersonnel={filteredPersonnel}
          personnelRoleFilter={personnelRoleFilter}
          setPersonnelRoleFilter={setPersonnelRoleFilter}
          personnelProcessFilter={personnelProcessFilter}
          setPersonnelProcessFilter={setPersonnelProcessFilter}
          personnelSearch={personnelSearch}
          setPersonnelSearch={setPersonnelSearch}
          allProcesses={allProcesses}
          onOpenAdd={handleOpenAddPersonnel}
          onOpenEdit={handleOpenEditPersonnel}
          onDelete={handleDeletePersonnelConfirm}
          onOpenExcelImport={() => setIsExcelImportOpen(true)}
          onExportCsv={handleExportPersonnelCSV}
        />
      )}

      {activeTab === 'DEMAND_REASONS' && (
        <DemandReasonsTab
          demandReasons={demandReasons}
          onOpenAddModal={() => setIsAddReasonOpen(true)}
          onDeleteReason={handleDeleteReason}
        />
      )}

      {activeTab === 'SLA_LIMITS' && (
        <SlaPolicyTab
          editableReasons={editableReasons}
          onPriorityChange={handleReasonPriorityChange}
          onSlaHoursChange={handleReasonSlaChange}
          onEarlyWarningChange={handleEarlyWarningChange}
          onAutoEscalateChange={handleAutoEscalateChange}
          onEscalationTargetChange={handleEscalationTargetChange}
          onSave={handleSaveReasons}
          onResetToDefault={handleResetSlaToDefault}
        />
      )}

      {activeTab === 'TEAMS' && (
        <TeamsTab
          teamsList={teamsList}
          currentTeam={currentTeam}
          setCurrentTeam={setCurrentTeam}
        />
      )}

      {/* Modals */}
      <PersonnelModal
        isOpen={isPersonnelModalOpen}
        isEditing={!!editingPersonnelId}
        formData={personnelForm}
        setFormData={setPersonnelForm}
        teamsList={teamsList}
        allProcesses={allProcesses}
        onClose={() => setIsPersonnelModalOpen(false)}
        onSubmit={handlePersonnelFormSubmit}
      />

      <PersonnelExcelImportModal
        isOpen={isExcelImportOpen}
        rawText={rawExcelText}
        setRawText={setRawExcelText}
        parseError={excelParseError}
        onClose={() => setIsExcelImportOpen(false)}
        onImport={handleImportExcelSubmit}
      />

      <DemandReasonModal
        isOpen={isAddReasonOpen}
        newReason={newReason}
        setNewReason={setNewReason}
        onClose={() => setIsAddReasonOpen(false)}
        onSubmit={handleAddReasonSubmit}
      />
    </div>
  );
};
