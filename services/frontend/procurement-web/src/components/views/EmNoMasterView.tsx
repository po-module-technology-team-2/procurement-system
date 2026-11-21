import React, { useState, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { EmNoRecord } from '../../types';
import { generateEmNo } from '../../utils/emNoHelper';
import { EmNoStatsHeader } from './em-no/EmNoStatsHeader';
import { EmNoFilterBar } from './em-no/EmNoFilterBar';
import { EmNoTable } from './em-no/EmNoTable';
import { EmNoTree } from './em-no/EmNoTree';
import { EmNoDrawer } from './em-no/EmNoDrawer';
import { EmNoModal } from './em-no/EmNoModal';
import { EmNoQuickReqModal } from './em-no/EmNoQuickReqModal';
import { EmNoImportModal } from './em-no/EmNoImportModal';
import { Cpu, Upload, Download, Plus, CheckCircle2 } from 'lucide-react';

export const EmNoMasterView: React.FC = () => {
  const { 
    emNoList, 
    addEmNo, 
    updateEmNo, 
    deleteEmNo, 
    importEmNoRecords, 
    addRequisition,
    currentUser
  } = useProcurement();

  // Navigation / View Modes: 'TABLE' | 'TREE'
  const [viewMode, setViewMode] = useState<'TABLE' | 'TREE'>('TABLE');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFactory, setFilterFactory] = useState('ALL');
  const [filterLine, setFilterLine] = useState('ALL');
  const [filterProcess, setFilterProcess] = useState('ALL');
  const [filterMachine, setFilterMachine] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & Drawers State
  const [selectedRecord, setSelectedRecord] = useState<EmNoRecord | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isQuickReqModalOpen, setIsQuickReqModalOpen] = useState(false);
  const [quickReqRecord, setQuickReqRecord] = useState<EmNoRecord | null>(null);

  // Quick Requisition form state
  const [quickReqPartTitle, setQuickReqPartTitle] = useState('');
  const [quickReqQty, setQuickReqQty] = useState(1);
  const [quickReqUrgency, setQuickReqUrgency] = useState<'URGENT' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [quickReqReason, setQuickReqReason] = useState('BM');

  // Copy Feedback state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add / Edit Form State
  const [formData, setFormData] = useState<Omit<EmNoRecord, 'id'>>({
    emNo: '',
    factory: 'HW - Hai Phong Smart Watch',
    factoryId: 'HW',
    line: 'Line #201',
    lineHex: '1',
    modelProduct: 'Apple Watch Ultra 2 (49mm OLED)',
    process: 'POL',
    machine: 'CLEAN',
    unit: 'LOADING',
    assembly: 'BUFFER STAGE 1-1',
    element: 'Porous Ceramic Vacuum Chuck & Air Float Stage',
    maker: 'YTS',
    floor: 'Floor 2',
    shop: 'Shop B',
    status: 'ACTIVE',
    criticality: 'HIGH',
    associatedQCodes: ['QCAD17426'],
    installedCount: 1,
    lastMaintainedAt: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Import State
  const [rawCsvText, setRawCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filteredRecords = useMemo(() => {
    return emNoList.filter(item => {
      if (filterFactory !== 'ALL' && item.factory !== filterFactory) return false;
      if (filterLine !== 'ALL' && item.line !== filterLine) return false;
      if (filterProcess !== 'ALL' && item.process !== filterProcess) return false;
      if (filterMachine !== 'ALL' && item.machine !== filterMachine) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      if (filterCriticality !== 'ALL' && item.criticality !== filterCriticality) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.emNo.toLowerCase().includes(q) ||
          item.machine.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q) ||
          item.assembly.toLowerCase().includes(q) ||
          item.element.toLowerCase().includes(q) ||
          item.modelProduct.toLowerCase().includes(q) ||
          (item.maker && item.maker.toLowerCase().includes(q)) ||
          item.line.toLowerCase().includes(q) ||
          (item.associatedQCodes && item.associatedQCodes.some(code => code.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [emNoList, filterFactory, filterLine, filterProcess, filterMachine, filterStatus, filterCriticality, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // KPI Analytics calculations
  const kpis = useMemo(() => {
    const total = emNoList.length;
    const active = emNoList.filter(r => r.status === 'ACTIVE').length;
    const maintenance = emNoList.filter(r => r.status === 'MAINTENANCE_REQUIRED').length;
    const alertCount = emNoList.filter(r => r.status === 'DOWN_ALERT').length;
    const uniqueLines = new Set(emNoList.map(r => r.line)).size;
    const uniqueMachines = new Set(emNoList.map(r => r.machine)).size;
    const linkedPartsCount = emNoList.filter(r => r.associatedQCodes && r.associatedQCodes.length > 0).length;

    return { total, active, maintenance, alertCount, uniqueLines, uniqueMachines, linkedPartsCount };
  }, [emNoList]);

  // Tree Hierarchy
  const treeHierarchy = useMemo(() => {
    const map: Record<string, Record<string, Record<string, EmNoRecord[]>>> = {};
    filteredRecords.forEach(rec => {
      if (!map[rec.machine]) map[rec.machine] = {};
      if (!map[rec.machine][rec.unit]) map[rec.machine][rec.unit] = {};
      if (!map[rec.machine][rec.unit][rec.assembly]) map[rec.machine][rec.unit][rec.assembly] = [];
      map[rec.machine][rec.unit][rec.assembly].push(rec);
    });
    return map;
  }, [filteredRecords]);

  const [expandedMachines, setExpandedMachines] = useState<Set<string>>(new Set(['CLEAN', 'POL ATTACHMENT']));
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(['CLEAN|LOADING']));
  const [treeSelectedRecord, setTreeSelectedRecord] = useState<EmNoRecord | null>(null);

  const toggleMachineExpand = (mach: string) => {
    setExpandedMachines(prev => {
      const next = new Set(prev);
      if (next.has(mach)) next.delete(mach);
      else next.add(mach);
      return next;
    });
  };

  const toggleUnitExpand = (key: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenDetail = (record: EmNoRecord) => {
    setSelectedRecord(record);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingRecordId(null);
    setFormData({
      emNo: generateEmNo('HW', 'B', 'MTL', '2', '1', 'CLEAN', 'LOADING', '01'),
      factory: 'HW - Hai Phong Smart Watch',
      factoryId: 'HW',
      line: 'Line #201',
      lineHex: '1',
      modelProduct: 'Apple Watch Ultra 2 (49mm OLED)',
      process: 'POL',
      machine: 'CLEAN',
      unit: 'LOADING',
      assembly: 'BUFFER STAGE 1-1',
      element: 'Porous Ceramic Vacuum Chuck & Air Float Stage',
      maker: 'YTS',
      floor: 'Floor 2',
      shop: 'Shop B',
      status: 'ACTIVE',
      criticality: 'HIGH',
      associatedQCodes: ['QCAD17426'],
      installedCount: 1,
      lastMaintainedAt: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (record: EmNoRecord) => {
    setEditingRecordId(record.id);
    setFormData({
      emNo: record.emNo,
      factory: record.factory,
      factoryId: record.factoryId,
      line: record.line,
      lineHex: record.lineHex,
      modelProduct: record.modelProduct,
      process: record.process,
      machine: record.machine,
      unit: record.unit,
      assembly: record.assembly,
      element: record.element,
      maker: record.maker || 'LG PRI',
      floor: record.floor || 'Floor 2',
      shop: record.shop || 'Shop B',
      status: record.status,
      criticality: record.criticality,
      associatedQCodes: record.associatedQCodes || [],
      installedCount: record.installedCount || 1,
      lastMaintainedAt: record.lastMaintainedAt || new Date().toISOString().split('T')[0],
      notes: record.notes || ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (id: string, emNo: string) => {
    if (window.confirm(`Are you sure you want to delete EM No record "${emNo}"?`)) {
      deleteEmNo(id);
      showToast(`Deleted EM No: ${emNo}`);
      if (selectedRecord?.id === id) setIsDetailDrawerOpen(false);
      if (treeSelectedRecord?.id === id) setTreeSelectedRecord(null);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emNo.trim()) return;

    if (editingRecordId) {
      updateEmNo(editingRecordId, formData);
      showToast(`Updated EM No: ${formData.emNo}`);
    } else {
      addEmNo(formData);
      showToast(`Created new EM No: ${formData.emNo}`);
    }
    setIsAddEditModalOpen(false);
  };

  const handleOpenQuickReq = (record: EmNoRecord) => {
    setQuickReqRecord(record);
    setQuickReqPartTitle(`${record.element} for ${record.machine} (${record.assembly})`);
    setQuickReqQty(1);
    setQuickReqUrgency(record.criticality === 'CRITICAL' ? 'URGENT' : 'HIGH');
    setQuickReqReason(record.status === 'DOWN_ALERT' ? 'BM' : 'Setup');
    setIsQuickReqModalOpen(true);
  };

  const handleExecuteQuickReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReqRecord) return;

    const code = `REQ-${Date.now().toString().slice(-6)}`;
    const randomItemCode = quickReqRecord.associatedQCodes?.[0] || 'Q00001';

    addRequisition({
      code,
      title: quickReqPartTitle,
      itemCode: randomItemCode,
      category: `Q4.${quickReqRecord.machine} Spares`,
      quantity: quickReqQty,
      unit: 'EA',
      estimatedPrice: 280,
      currency: 'USD',
      status: 'SUBMITTED',
      priority: quickReqUrgency,
      department: quickReqRecord.line,
      requestedBy: `${currentUser.employeeId} (${currentUser.name})`,
      requestorEmployeeId: currentUser.employeeId,
      requestorName: currentUser.name,
      notes: `[Auto-Generated from EM No Master: ${quickReqRecord.emNo}] Machine: ${quickReqRecord.machine}, Unit: ${quickReqRecord.unit}, Assembly: ${quickReqRecord.assembly}`,
      machineName: quickReqRecord.machine,
      machineLine: quickReqRecord.line,
      ebomEmNo: quickReqRecord.emNo,
      ebomUnitCode: quickReqRecord.unit,
      ebomAssemblyCode: quickReqRecord.assembly,
      demandType: quickReqReason,
      processStep: quickReqRecord.process,
      lineRunningStatus: quickReqRecord.status === 'DOWN_ALERT' ? 'STALLED' : 'NORMAL'
    });

    setIsQuickReqModalOpen(false);
    showToast(`Created Requisition ${code} linked to ${quickReqRecord.emNo}!`);
  };

  const handleExportCsv = () => {
    const headers = [
      'Factory', 'Line', 'EM No', 'Model Product', 'Process', 'Machine', 'Unit', 'Assembly', 'Element', 'Maker', 'Status', 'Criticality', 'Associated Q-Codes'
    ];
    const rows = filteredRecords.map(r => [
      `"${r.factory}"`,
      `"${r.line}"`,
      `"${r.emNo}"`,
      `"${r.modelProduct}"`,
      `"${r.process}"`,
      `"${r.machine}"`,
      `"${r.unit}"`,
      `"${r.assembly}"`,
      `"${r.element}"`,
      `"${r.maker || ''}"`,
      `"${r.status}"`,
      `"${r.criticality}"`,
      `"${(r.associatedQCodes || []).join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EM_NO_MASTER_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredRecords.length} records to CSV!`);
  };

  const handleParseCsv = () => {
    if (!rawCsvText.trim()) return;
    try {
      const lines = rawCsvText.trim().split('\n');
      const parsedRecords: Omit<EmNoRecord, 'id'>[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));

        if (i === 0 && (cols[0].toLowerCase().includes('factory') || cols[2]?.toLowerCase().includes('em no'))) {
          continue;
        }

        if (cols.length >= 6) {
          parsedRecords.push({
            factory: cols[0] || 'HW - Hai Phong Smart Watch',
            factoryId: 'HW',
            line: cols[1] || 'Line #201',
            lineHex: '1',
            emNo: cols[2] || `HW${Date.now().toString().slice(-12)}`,
            modelProduct: cols[3] || 'Apple Watch Ultra 2 (49mm OLED)',
            process: cols[4] || 'POL',
            machine: cols[5] || 'CLEAN',
            unit: cols[6] || 'LOADING',
            assembly: cols[7] || 'BUFFER STAGE 1-1',
            element: cols[8] || 'Porous Ceramic Vacuum Chuck & Air Float Stage',
            maker: cols[9] || 'LG PRI',
            status: 'ACTIVE',
            criticality: 'HIGH',
            associatedQCodes: cols[12] ? cols[12].split(';').map(s => s.trim()) : [],
            installedCount: 1,
            lastMaintainedAt: new Date().toISOString().split('T')[0]
          });
        }
      }

      if (parsedRecords.length === 0) {
        setImportFeedback('Could not detect valid CSV rows. Please verify format.');
        return;
      }

      importEmNoRecords(parsedRecords);
      setIsImportModalOpen(false);
      setRawCsvText('');
      setImportFeedback(null);
      showToast(`Successfully imported ${parsedRecords.length} EM No records!`);
    } catch (err: any) {
      setImportFeedback(`Parsing error: ${err.message || 'Invalid format'}`);
    }
  };

  const hasActiveFilters = 
    filterFactory !== 'ALL' || 
    filterLine !== 'ALL' || 
    filterProcess !== 'ALL' || 
    filterMachine !== 'ALL' || 
    filterStatus !== 'ALL' || 
    filterCriticality !== 'ALL' || 
    !!searchQuery;

  const handleClearFilters = () => {
    setFilterFactory('ALL');
    setFilterLine('ALL');
    setFilterProcess('ALL');
    setFilterMachine('ALL');
    setFilterStatus('ALL');
    setFilterCriticality('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                EM No Master & EBOM Explorer
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Data.xlsb Sheet 1 (7,727 Equipment Matrix)
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full-fidelity Equipment Hierarchy: Factory, Line, Em No, Model Product, Process, Machine, Unit, Assembly & Sub-Element Linkage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register EM No</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <EmNoStatsHeader kpis={kpis} />

      {/* Filters Toolbar */}
      <EmNoFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterFactory={filterFactory}
        setFilterFactory={setFilterFactory}
        filterLine={filterLine}
        setFilterLine={setFilterLine}
        filterProcess={filterProcess}
        setFilterProcess={setFilterProcess}
        filterMachine={filterMachine}
        setFilterMachine={setFilterMachine}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCriticality={filterCriticality}
        setFilterCriticality={setFilterCriticality}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* View Switcher: Table vs. Tree */}
      {viewMode === 'TABLE' ? (
        <EmNoTable
          filteredRecords={filteredRecords}
          paginatedRecords={paginatedRecords}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          copiedCode={copiedCode}
          onCopy={handleCopy}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDelete}
          onOpenQuickReq={handleOpenQuickReq}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      ) : (
        <EmNoTree
          treeHierarchy={treeHierarchy}
          expandedMachines={expandedMachines}
          toggleMachineExpand={toggleMachineExpand}
          expandedUnits={expandedUnits}
          toggleUnitExpand={toggleUnitExpand}
          treeSelectedRecord={treeSelectedRecord}
          setTreeSelectedRecord={setTreeSelectedRecord}
          copiedCode={copiedCode}
          onCopy={handleCopy}
          onOpenQuickReq={handleOpenQuickReq}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDelete}
          onOpenDetail={handleOpenDetail}
        />
      )}

      {/* Modals & Drawers */}
      <EmNoDrawer
        isOpen={isDetailDrawerOpen}
        record={selectedRecord}
        copiedCode={copiedCode}
        onCopy={handleCopy}
        onClose={() => setIsDetailDrawerOpen(false)}
        onLaunchQuickReq={(r) => {
          setIsDetailDrawerOpen(false);
          handleOpenQuickReq(r);
        }}
      />

      <EmNoModal
        isOpen={isAddEditModalOpen}
        isEditing={!!editingRecordId}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleSaveModal}
      />

      <EmNoQuickReqModal
        isOpen={isQuickReqModalOpen}
        record={quickReqRecord}
        partTitle={quickReqPartTitle}
        setPartTitle={setQuickReqPartTitle}
        quantity={quickReqQty}
        setQuantity={setQuickReqQty}
        urgency={quickReqUrgency}
        setUrgency={setQuickReqUrgency}
        reason={quickReqReason}
        setReason={setQuickReqReason}
        onClose={() => setIsQuickReqModalOpen(false)}
        onSubmit={handleExecuteQuickReq}
      />

      <EmNoImportModal
        isOpen={isImportModalOpen}
        rawCsvText={rawCsvText}
        setRawCsvText={setRawCsvText}
        importFeedback={importFeedback}
        onClose={() => setIsImportModalOpen(false)}
        onParseCsv={handleParseCsv}
      />
    </div>
  );
};
