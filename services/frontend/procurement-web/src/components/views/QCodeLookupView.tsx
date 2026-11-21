import React, { useState, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { NEXACRO_ITEMS_DB, NexacroItemInfo, lookupQCode } from '../../data/nexacroItems';
import { PurchaseRegistrationForm } from './PurchaseRegistrationForm';
import { RequisitionItem } from '../../types';
import { 
  Search, 
  Trash2, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRightLeft, 
  Clock, 
  Wrench, 
  Target, 
  Plus, 
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
  SlidersHorizontal,
  Boxes,
  ShieldCheck,
  Zap,
  Tag,
  ArrowRight,
  Maximize2,
  AlertCircle,
  FileCheck,
  Scale,
  CheckSquare,
  Square,
  EyeOff,
  Eye,
  User,
  Workflow,
  Package,
  DollarSign
} from 'lucide-react';

const INITIAL_CODES = `Q00001
Q00002
QCAC13053
QCAD17426
QCAC23740
QCAC56634
QCAD48186
QCAD61530`;

export const QCodeLookupView: React.FC = () => {
  const { 
    currentTeam, 
    requisitions, 
    addRequisition, 
    setActiveView, 
    currentRole, 
    currentProcess, 
    currentUser,
    demandReasons
  } = useProcurement();

  // Lookup mode: Batch list search vs. Advanced conditional filter search
  const [lookupMode, setLookupMode] = useState<'BATCH_LIST' | 'CONDITIONAL'>('BATCH_LIST');

  // Batch Q-Codes input & collapsible state
  const [rawInput, setRawInput] = useState<string>(INITIAL_CODES);
  const [isBatchInputCollapsed, setIsBatchInputCollapsed] = useState<boolean>(true);

  // Advanced Condition Filters
  const [interlockFilter, setInterlockFilter] = useState<string>('ALL');
  const [q4Filter, setQ4Filter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  // Row expansion state (accordion)
  const [expandedCode, setExpandedCode] = useState<string | null>('Q00001');
  const [showFullAudit, setShowFullAudit] = useState<boolean>(false);

  // Multi-selection state
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  // Hide registered toggle
  const [hideRegistered, setHideRegistered] = useState<boolean>(false);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Registration success toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isRequestor = currentRole === 'REQUESTOR';

  // Map of registered Q-Codes to their requisition item
  const registeredReqMap = useMemo(() => {
    const map = new Map<string, RequisitionItem>();
    requisitions.forEach(r => {
      if (r.itemCode) map.set(r.itemCode, r);
      if (r.code && !r.code.startsWith('REQ-')) map.set(r.code, r);
    });
    return map;
  }, [requisitions]);

  // Parse batch input with real-time auto-clean and auto-deduplication
  const parsedCodes = useMemo(() => {
    const lines = rawInput.split('\n');
    const result: string[] = [];
    const seen = new Set<string>();

    for (const rawLine of lines) {
      const tokens = rawLine.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
      for (const token of tokens) {
        const clean = token.replace(/\s+/g, '').toUpperCase();
        if (clean && !seen.has(clean)) {
          seen.add(clean);
          result.push(clean);
        }
      }
    }
    return result;
  }, [rawInput]);

  // Count of items in current batch that are registered
  const registeredInBatchCount = useMemo(() => {
    return parsedCodes.filter(c => registeredReqMap.has(c)).length;
  }, [parsedCodes, registeredReqMap]);

  const handleBlur = () => {
    if (parsedCodes.length > 0) {
      setRawInput(parsedCodes.join('\n'));
    }
  };

  const handleClearRegisteredFromBatch = () => {
    const remaining = parsedCodes.filter(c => !registeredReqMap.has(c));
    setRawInput(remaining.join('\n'));
    setSuccessToast(`Removed ${registeredInBatchCount} already-registered components from your batch input.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const allDatabaseItems = useMemo(() => Object.values(NEXACRO_ITEMS_DB), []);

  // Filtered Items
  const displayedItems = useMemo(() => {
    let baseList: NexacroItemInfo[] = [];

    if (lookupMode === 'BATCH_LIST') {
      baseList = parsedCodes.map((code) => {
        const found = lookupQCode(code);
        if (found) return found;
        return {
          item_code: code,
          status: 'Active',
          description: `Industrial Component (${code}) - Specification standard mock`,
          model: `${code}-STD`,
          maker: 'Standard OEM Maker',
          vendor_name: 'LG Display Industrial Supply Partner',
          uom: 'EA',
          catalog_group: 'Q4.General Parts',
          buy_item_type: 'Individual Management',
          unit_price_sp: 45.0,
          unit_price_spr: 0.0,
          min_order_qty: 1,
          onhand_qty: 0,
          allocated_qty: 0,
          available_qty: 0,
          image_url: '',
          fdm_url: '',
          interlock_disuse: false,
          disuse_reason_category: '',
          disuse_detail_reason: '',
          interlock_aging: false,
          aging_days: 30,
          aging_detail_reason: 'Normal inventory velocity',
          unit_price_status_code: 'UP004',
          unit_price_status_detail: 'No Price / RFQ In Progress',
          unit_price_flag: 'N',
          interlock_stop_po: false,
          stop_po_reason_category: '',
          stop_po_detail_reason: '',
          interlock_transfer: false,
          transfer_qty: 0,
          interlock_wait_repair: false,
          wait_repair_qty: 0,
          interlock_po_opt_target: false,
          interlock_qlty_mgt_target: false,
          interlock_ci_flag: false,
          hold_reason: 'Unregistered item in local offline database',
        };
      });
    } else {
      baseList = allDatabaseItems;
    }

    return baseList.filter((item) => {
      // 0. Hide registered filter
      if (hideRegistered && registeredReqMap.has(item.item_code)) {
        return false;
      }

      // 1. Interlock Filter
      let matchInterlock = true;
      if (interlockFilter === 'STOP_PO') matchInterlock = item.interlock_stop_po;
      else if (interlockFilter === 'DISUSE') matchInterlock = item.interlock_disuse;
      else if (interlockFilter === 'AGING') matchInterlock = item.interlock_aging;
      else if (interlockFilter === 'TRANSFER') matchInterlock = item.interlock_transfer;
      else if (interlockFilter === 'WAIT_REPAIR') matchInterlock = item.interlock_wait_repair;
      else if (interlockFilter === 'NO_PRICE') matchInterlock = item.unit_price_status_code === 'UP004';
      else if (interlockFilter === 'PO_OPT') matchInterlock = item.interlock_po_opt_target;
      else if (interlockFilter === 'QLTY') matchInterlock = item.interlock_qlty_mgt_target;
      else if (interlockFilter === 'CI') matchInterlock = item.interlock_ci_flag;

      // 2. Q4 Group Filter
      let matchQ4 = true;
      if (q4Filter !== 'ALL') {
        matchQ4 = item.catalog_group === q4Filter;
      }

      // 3. Stock Status Filter
      let matchStock = true;
      if (stockFilter === 'AVAILABLE') matchStock = item.available_qty > 0;
      else if (stockFilter === 'OUT_OF_STOCK') matchStock = item.onhand_qty === 0;
      else if (stockFilter === 'TRANSFER_AVAIL') matchStock = item.transfer_qty > 0;
      else if (stockFilter === 'REPAIR_AVAIL') matchStock = item.wait_repair_qty > 0;

      // 4. Keyword text search
      const q = keyword.toLowerCase().trim();
      const matchKeyword = 
        !q ||
        item.item_code.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.maker.toLowerCase().includes(q) ||
        item.vendor_name.toLowerCase().includes(q) ||
        item.catalog_group.toLowerCase().includes(q);

      return matchInterlock && matchQ4 && matchStock && matchKeyword;
    });
  }, [lookupMode, parsedCodes, allDatabaseItems, hideRegistered, registeredReqMap, interlockFilter, q4Filter, stockFilter, keyword]);

  const catalogGroups = useMemo(() => {
    const set = new Set<string>();
    allDatabaseItems.forEach(i => {
      if (i.catalog_group) set.add(i.catalog_group);
    });
    return Array.from(set).sort();
  }, [allDatabaseItems]);

  const toggleRowExpansion = (code: string) => {
    setExpandedCode(prev => prev === code ? null : code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Multi-Selection logic
  const toggleSelectCode = (code: string) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const isAllSelected = displayedItems.length > 0 && selectedCodes.size === displayedItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(displayedItems.map(i => i.item_code)));
    }
  };

  // Batch Register Action
  const handleBatchRegister = () => {
    let count = 0;
    selectedCodes.forEach(code => {
      const item = displayedItems.find(i => i.item_code === code) || lookupQCode(code);
      if (item) {
        addRequisition({
          code: item.item_code,
          itemCode: item.item_code,
          title: item.description,
          category: item.catalog_group || 'Spare Parts',
          quantity: 1,
          unit: item.uom || 'EA',
          estimatedPrice: item.unit_price_sp || 50.0,
          currency: 'USD',
          status: item.interlock_stop_po ? 'REJECTED' : 'SUBMITTED',
          priority: 'HIGH',
          department: currentUser.teamLabel || 'PO Module Technology Team 2',
          requestorEmployeeId: currentUser.employeeId,
          requestorName: currentUser.name,
          requestedBy: `${currentUser.employeeId} (${currentUser.name})`,
          notes: `Batch registered requisition. Submitted for reviewer inspection and interlock clearance.`,
        });
        count++;
      }
    });

    setSuccessToast(`Successfully registered ${count} purchase requisitions under ${currentUser.employeeId} (${currentUser.name})!`);
    setSelectedCodes(new Set());
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleExportCSV = (itemsToExport: NexacroItemInfo[] = displayedItems) => {
    const headers = [
      'item_code',
      'catalog_group_Q4',
      'model',
      'description',
      'maker',
      'vendor_name',
      'uom',
      'unit_price_sp',
      'unit_price_spr',
      'unit_price_status_code',
      'onhand_total',
      'onhand_allocation',
      'onhand_available',
      'stop_po_flag',
      'disuse_flag',
      'aging_flag',
      'transfer_flag',
      'wait_repair_flag',
      'ci_flag',
      'is_registered_in_pr'
    ];

    const rows = itemsToExport.map((item) => [
      `"${item.item_code}"`,
      `"${item.catalog_group}"`,
      `"${item.model}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.maker}"`,
      `"${item.vendor_name}"`,
      `"${item.uom}"`,
      item.unit_price_sp,
      item.unit_price_spr,
      `"${item.unit_price_status_code}"`,
      item.onhand_qty,
      item.allocated_qty,
      item.available_qty,
      item.interlock_stop_po ? 'Y' : 'N',
      item.interlock_disuse ? 'Y' : 'N',
      item.interlock_aging ? 'Y' : 'N',
      item.interlock_transfer ? 'Y' : 'N',
      item.interlock_wait_repair ? 'Y' : 'N',
      item.interlock_ci_flag ? 'Y' : 'N',
      registeredReqMap.has(item.item_code) ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `qcode_audit_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* 1. Page Header & Role-Adaptive Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Q-Code Verification & Interlock Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Process: {currentProcess}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Component unit price (SP/SPR), shopfloor inventory on-hand, and 10 guardrail interlocks are loaded directly from the system (Nexacro / MES Core) and evaluated autonomously.
          </p>
        </div>

        {/* Role Identity Card */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isRequestor ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                {isRequestor ? 'Requestor Identity' : 'LEC Technical Gatekeeper'}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 font-mono">
                <span className="text-blue-600 dark:text-blue-400">{currentUser.employeeId}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>{currentUser.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleExportCSV()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SLA Policy Notice Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            SLA Response Deadlines:
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {demandReasons.map((r, idx) => (
              <React.Fragment key={r.code}>
                {idx > 0 && ' • '}
                <span>{r.code}: <strong className={r.code === 'BM' ? 'text-rose-600' : r.code === 'Setup/MC' ? 'text-purple-600' : ''}>{r.slaHours} Hours</strong></span>
              </React.Fragment>
            ))}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300">
          Target: {currentUser.teamLabel || 'PO Module Technology Team 2'}
        </span>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* 2. Mode Selector & Condition-Based Query Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 w-full max-w-full overflow-hidden">
        {/* Mode Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLookupMode('BATCH_LIST')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                lookupMode === 'BATCH_LIST'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              1. Batch Q-Code Query List
            </button>

            <button
              onClick={() => setLookupMode('CONDITIONAL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                lookupMode === 'CONDITIONAL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              2. Query by Conditions (Filter Mode)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHideRegistered(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                hideRegistered 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
              title="Toggle to hide or display items that have already been registered as purchase requisitions"
            >
              {hideRegistered ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideRegistered ? 'Hiding Registered' : 'Hide Registered'}</span>
              {registeredReqMap.size > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono">
                  {registeredReqMap.size}
                </span>
              )}
            </button>

            <div className="text-xs text-slate-400 font-mono">
              Matched Items: <strong className="text-blue-600 dark:text-blue-400">{displayedItems.length}</strong>
            </div>
          </div>
        </div>

        {/* Mode 1: Collapsed & Streamlined Batch Q-Code Input Bar */}
        {lookupMode === 'BATCH_LIST' && (
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 transition-all">
            {isBatchInputCollapsed ? (
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Batch Q-Codes:
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {parsedCodes.length} Codes Active
                  </span>
                  
                  <div className="hidden sm:flex items-center gap-1 overflow-hidden">
                    {parsedCodes.slice(0, 4).map((c) => (
                      <span key={c} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {c}
                      </span>
                    ))}
                    {parsedCodes.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        +{parsedCodes.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {registeredInBatchCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearRegisteredFromBatch}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Clear Registered ({registeredInBatchCount})
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsBatchInputCollapsed(false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <span>Edit Batch List</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {rawInput && (
                    <button
                      type="button"
                      onClick={() => setRawInput('')}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Clear list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Batch Q-Code Input ({parsedCodes.length} codes)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRawInput(INITIAL_CODES)}
                      className="text-[11px] text-slate-500 hover:text-blue-600"
                    >
                      Reset Samples
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBatchInputCollapsed(true)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-300"
                    >
                      <span>Done</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Paste Q-Codes separated by commas or newlines..."
                  className="w-full p-2 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none resize-y"
                />
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Query by Conditions */}
        <div className="space-y-2.5 pt-1">
          {/* 10 Interlock Filter Pills with proper scroll bounds */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full">
            {[
              { id: 'ALL', label: 'All Interlocks' },
              { id: 'STOP_PO', label: 'Stop PO (Blocked)' },
              { id: 'DISUSE', label: 'Disuse / EOL' },
              { id: 'AGING', label: 'Aging Stock (>180d)' },
              { id: 'NO_PRICE', label: 'No Price (UP004)' },
              { id: 'TRANSFER', label: 'WH2 Transfer Avail' },
              { id: 'WAIT_REPAIR', label: 'Wait-Repair Stock' },
              { id: 'CI', label: 'CI Substitute Mapped' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setInterlockFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                  interlockFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Condition Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Catalog Group (Q4.)
              </label>
              <select
                value={q4Filter}
                onChange={(e) => setQ4Filter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="ALL">All Q4 Groups</option>
                {catalogGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Stock Balance Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="AVAILABLE">Available for Issue (Avail &gt; 0)</option>
                <option value="OUT_OF_STOCK">Out of Stock (Onhand = 0)</option>
                <option value="TRANSFER_AVAIL">WH2 Transferable Stock</option>
                <option value="REPAIR_AVAIL">Workshop Repairable Stock</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Search (Keyword / Maker / Model)
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Code, model, description..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Master Table Displaying Standard Columns, Price & 10 Interlocks (Controlled Non-Overflow Layout) */}
      <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-xs table-auto">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center">#</th>
                <th className="py-3 px-3 w-28">Item Code</th>
                <th className="py-3 px-3 min-w-[220px]">Component & Model</th>
                <th className="py-3 px-3 w-32">Maker & Vendor</th>
                <th className="py-3 px-3 w-28 text-right">Unit Price (SP)</th>
                <th className="py-3 px-3 w-32 text-center">Onhand (T/Al/Av)</th>
                <th className="py-3 px-3 min-w-[200px]">10 Interlock Status</th>
                <th className="py-3 px-3 w-32">Requisition</th>
                <th className="py-3 px-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No components found matching your search criteria.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => {
                  const isExpanded = expandedCode === item.item_code;
                  const isSelected = selectedCodes.has(item.item_code);
                  const registeredReq = registeredReqMap.get(item.item_code);

                  return (
                    <React.Fragment key={item.item_code}>
                      <tr 
                        className={`transition-colors cursor-pointer ${
                          isExpanded 
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-600' 
                            : isSelected
                            ? 'bg-blue-50/40 dark:bg-blue-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                        onClick={() => toggleRowExpansion(item.item_code)}
                      >
                        {/* 0. Row Selection Checkbox */}
                        <td className="py-3 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCode(item.item_code)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* 1. Expand Toggle Button */}
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(item.item_code);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* 2. Item Code */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                              {item.item_code}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(item.item_code);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy code"
                            >
                              {copiedCode === item.item_code ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.status}
                          </span>
                        </td>

                        {/* 3. Component & Model (Combined to save horizontal space) */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-[220px]" title={item.description}>
                            {item.description}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{item.model || 'N/A'}</span>
                            <span>•</span>
                            <span className="truncate max-w-[100px]">{item.catalog_group || 'Q4.General'}</span>
                          </div>
                        </td>

                        {/* 4. Maker & Vendor (Combined Stack) */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]" title={item.maker}>
                            {item.maker || 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={item.vendor_name}>
                            {item.vendor_name || 'N/A'}
                          </div>
                        </td>

                        {/* 5. Unit Price (SP / SPR) */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                            ${item.unit_price_sp.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-blue-600 font-mono font-semibold">
                            {item.unit_price_status_code}
                          </div>
                        </td>

                        {/* 6. Onhand (T/Al/Av) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                            <span title="Total On-hand" className="font-bold text-slate-800 dark:text-slate-200">
                              T:{item.onhand_qty}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span title="Allocated" className="text-amber-600">
                              Al:{item.allocated_qty}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span title="Available" className={`font-bold ${item.available_qty > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              Av:{item.available_qty}
                            </span>
                          </div>
                        </td>

                        {/* 7. 10 Interlocks Status */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 items-center max-w-[220px]">
                            {item.interlock_stop_po && (
                              <Badge variant="danger" size="sm">Stop PO</Badge>
                            )}
                            {item.interlock_disuse && (
                              <Badge variant="danger" size="sm">Disuse</Badge>
                            )}
                            {item.interlock_aging && (
                              <Badge variant="warning" size="sm">Aging {item.aging_days}d</Badge>
                            )}
                            {item.interlock_transfer && (
                              <Badge variant="blue" size="sm">WH2 Transfer</Badge>
                            )}
                            {item.interlock_wait_repair && (
                              <Badge variant="purple" size="sm">Wait-Repair</Badge>
                            )}
                            {item.interlock_ci_flag && (
                              <Badge variant="success" size="sm">CI Part</Badge>
                            )}
                            {!item.interlock_stop_po && !item.interlock_disuse && !item.interlock_aging && !item.interlock_transfer && (
                              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Cleared
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 8. Registration Status */}
                        <td className="py-3 px-3">
                          {registeredReq ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {registeredReq.code}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveView('requisitions');
                                }}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-semibold"
                              >
                                <span>Track SLA</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Ready</span>
                          )}
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleRowExpansion(item.item_code)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                                isExpanded 
                                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'Đóng' : 'Tiến hành đăng ký mua'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Section (Accordion Body): Clean non-overflow container */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="p-0 bg-slate-50/70 dark:bg-slate-950/70 border-b border-blue-200 dark:border-blue-900/60 max-w-full">
                            <div className="p-4 sm:p-5 w-full max-w-full overflow-hidden space-y-4">
                              {/* 1. Tra cứu thông tin cơ bản & Hồ sơ vật tư */}
                              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                      <Info className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                                        <span>1. Tra Cứu Thông Tin Cơ Bản & Hồ Sơ Vật Tư</span>
                                        <span className="font-mono text-[11px] px-2 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                                          {item.item_code}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Dữ liệu kỹ thuật, đơn giá SP/SPR, nhà sản xuất và định mức kho từ hệ thống EMS/Nexacro
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      Nhóm: {item.catalog_group || 'Q4.General'}
                                    </span>
                                  </div>
                                </div>

                                {/* Thông tin chi tiết 4 cột */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Tên Mô Tả & Quy Cách</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2" title={item.description}>
                                      {item.description}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">Model: {item.model || 'N/A'}</div>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Maker & Vendor Cung Cấp</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate" title={item.maker}>
                                      {item.maker || 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1" title={item.vendor_name}>
                                      NCC: {item.vendor_name || 'N/A'}
                                    </div>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Đơn Giá SP & Đơn Vị</span>
                                    <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                                      ${item.unit_price_sp.toFixed(2)} USD
                                      <span className="text-xs font-normal text-slate-500 ml-1">/ {item.uom}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                      SPR: ${item.unit_price_spr.toFixed(2)} • Trạng thái: {item.unit_price_status_code}
                                    </div>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Tồn Kho & Khả Dụng</span>
                                    <div className="flex items-center gap-1.5 font-mono text-xs mt-0.5">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">Tổng: {item.onhand_qty}</span>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-amber-600 font-bold">Giữ: {item.allocated_qty}</span>
                                      <span className="text-slate-300">|</span>
                                      <span className={`font-bold ${item.available_qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        Khả dụng: {item.available_qty}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                                      <span>WH2: {item.transfer_qty} {item.uom}</span>
                                      <span>Sửa chữa: {item.wait_repair_qty} {item.uom}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Code tương tự thay thế & Định mức đóng gói */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Code Tương Tự Thay Thế (EMS)</span>
                                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                                        {item.ci_code || item.eol_replacement_code || item.duplicate_code || 'Chưa có code mapping từ EMS'}
                                      </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      item.ci_code ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {item.ci_code ? 'CI Mapped' : 'Cần đăng ký'}
                                    </span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Định Mức Mua & Đóng Gói (MOQ / SPQ / MPQ)</span>
                                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5 block">
                                        MOQ: {item.min_order_qty || 1} {item.uom} • SPQ: 5 {item.uom} • MPQ: 10 {item.uom}
                                      </span>
                                    </div>
                                    {item.available_qty < 5 && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                        Dưới tồn an toàn!
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 10-Interlock Mini Grid */}
                              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                      10-Interlock Guardrail Audit & Stock Intelligence
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                                      Loaded from System (Nexacro / MES Core)
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-400 font-mono">
                                    {item.item_code} • {item.catalog_group}
                                  </span>
                                </div>

                                {/* 5-column compact grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                                  <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Disuse (EOL)</span>
                                    <span className={`text-[11px] font-bold ${item.interlock_disuse ? 'text-rose-600' : 'text-emerald-600'}`}>
                                      {item.interlock_disuse ? 'DISUSE (Blocked)' : 'Cleared (Active)'}
                                    </span>
                                  </div>

                                  <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">2. Aging Stock</span>
                                    <span className={`text-[11px] font-bold ${item.interlock_aging ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {item.aging_days} Days ({item.interlock_aging ? 'Aging Alert' : 'Normal'})
                                    </span>
                                  </div>

                                  <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">3. Unit Price</span>
                                    <span className="text-[11px] font-bold text-blue-600 font-mono">
                                      ${item.unit_price_sp.toFixed(2)} SP / {item.unit_price_status_code}
                                    </span>
                                  </div>

                                  <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">5. WH2 Transfer</span>
                                    <span className={`text-[11px] font-bold ${item.interlock_transfer ? 'text-blue-600' : 'text-slate-400'}`}>
                                      {item.interlock_transfer ? `${item.transfer_qty} EA Available` : 'No Transfer Stock'}
                                    </span>
                                  </div>

                                  <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">7. Wait-Repair Bay</span>
                                    <span className={`text-[11px] font-bold ${item.interlock_wait_repair ? 'text-purple-600' : 'text-slate-400'}`}>
                                      {item.interlock_wait_repair ? `${item.wait_repair_qty} EA at Workshop` : 'None in Repair'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Purchase Registration Form */}
                              <PurchaseRegistrationForm
                                item={item}
                                onSuccess={() => {
                                  setSuccessToast(`Purchase requisition registered successfully for ${item.item_code}!`);
                                  setExpandedCode(null);
                                  setTimeout(() => setSuccessToast(null), 5000);
                                }}
                                onCancel={() => setExpandedCode(null)}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Floating Multi-Select Bulk Action Bar */}
      {selectedCodes.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 flex items-center gap-4 animate-slideUp">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="font-bold text-xs">
              {selectedCodes.size} item{selectedCodes.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 dark:bg-slate-300"></div>

          <button
            onClick={handleBatchRegister}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Batch Register ({selectedCodes.size})</span>
          </button>

          <button
            onClick={() => {
              const selectedItems = displayedItems.filter(i => selectedCodes.has(i.item_code));
              handleExportCSV(selectedItems);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-xs font-semibold transition-all"
          >
            Export Selected CSV
          </button>

          <button
            onClick={() => setSelectedCodes(new Set())}
            className="text-xs text-slate-400 hover:text-white dark:hover:text-slate-900 underline ml-1"
          >
            Deselect All
          </button>
        </div>
      )}
    </div>
  );
};
