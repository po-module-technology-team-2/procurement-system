import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { RequisitionItem, RequisitionStatus, Priority, DemandType, SlaStatus, ProcessType } from '../../types';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  ArrowRight, 
  Layers, 
  Cpu, 
  AlertCircle, 
  Trash2, 
  Check, 
  HelpCircle,
  TrendingUp,
  Boxes,
  FileText,
  RotateCcw,
  Zap,
  DollarSign,
  Truck,
  Wrench,
  Sparkles,
  ExternalLink,
  Hourglass,
  CheckSquare,
  Square,
  UserCheck,
  Mail,
  Calendar,
  Layers2,
  Workflow
} from 'lucide-react';

export const RequisitionsView: React.FC = () => {
  const { 
    requisitions, 
    updateStatus, 
    addFeedback, 
    deleteRequisition, 
    currentRole, 
    currentTeam,
    currentUser,
    currentProcess,
    lecReviewers,
    personnelList,
    batchAssignReviewer,
    batchSystemRequest,
    batchSendEmail,
    batchAddToMonthlyAppraisal,
    batchUpdateStatus
  } = useProcurement();

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [demandFilter, setDemandFilter] = useState<string>('ALL');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // Perspective Mode:
  // 'ALL' | 'MY_PROCESS' (Engineer Process Tracking) | 'LEC_WORKBENCH' (LEC Batch Workbench) | 'MONTHLY_APPRAISAL' (Monthly Appraisal Committee)
  const [perspectiveMode, setPerspectiveMode] = useState<'ALL' | 'MY_PROCESS' | 'LEC_WORKBENCH' | 'MONTHLY_APPRAISAL'>(
    currentRole === 'APPROVER' || currentRole === 'ADMIN' ? 'LEC_WORKBENCH' : 'MY_PROCESS'
  );

  // Engineer Process Filter
  const [engineerProcess, setEngineerProcess] = useState<ProcessType>(currentProcess || 'DB');

  // Multi-selection state for LEC batch operations
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set());

  // Batch Modals State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignReviewerId, setAssignReviewerId] = useState<string>(lecReviewers[0]?.id || 'lec-1');
  const [batchActionToast, setBatchActionToast] = useState<string | null>(null);

  const showBatchToast = (msg: string) => {
    setBatchActionToast(msg);
    setTimeout(() => setBatchActionToast(null), 4000);
  };

  // Active drawer tab: 'DECISION_MATRIX' | 'DETAILS' | 'DISCUSSION'
  const [activeDrawerTab, setActiveDrawerTab] = useState<'DECISION_MATRIX' | 'DETAILS' | 'DISCUSSION'>('DECISION_MATRIX');

  // Selected Strategy in Decision Matrix
  const [selectedStrategy, setSelectedStrategy] = useState<'PURCHASE_NEW' | 'WH_TRANSFER' | 'WORKSHOP_REPAIR' | 'CI_SUBSTITUTE'>('PURCHASE_NEW');
  const [customApprovedQty, setCustomApprovedQty] = useState<number>(0);

  // Feedback input state
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackAuthorRole, setFeedbackAuthorRole] = useState<'REVIEWER' | 'REQUESTOR'>(
    currentRole === 'APPROVER' || currentRole === 'ADMIN' ? 'REVIEWER' : 'REQUESTOR'
  );

  // Decision note prompt state
  const [actionModal, setActionModal] = useState<{
    type: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null;
    reqId: string | null;
    note: string;
    strategy?: 'PURCHASE_NEW' | 'WH_TRANSFER' | 'WORKSHOP_REPAIR' | 'CI_SUBSTITUTE';
    approvedQty?: number;
    costSaving?: number;
  }>({ type: null, reqId: null, note: '' });

  // Selected Requisition Item
  const selectedReq = requisitions.find((r) => r.id === selectedReqId) || null;

  // Initialize selected qty when selectedReq changes
  React.useEffect(() => {
    if (selectedReq) {
      setCustomApprovedQty(selectedReq.approvedQuantity || selectedReq.quantity);
      setSelectedStrategy(selectedReq.procurementStrategy || 'PURCHASE_NEW');
    }
  }, [selectedReqId, selectedReq?.quantity, selectedReq?.approvedQuantity, selectedReq?.procurementStrategy]);

  // Filter items
  const filteredItems = requisitions.filter((r) => {
    // 1. Perspective Filter
    if (perspectiveMode === 'MY_PROCESS') {
      // Engineer tracking items by manufacturing process
      if (r.processStep !== engineerProcess) return false;
    } else if (perspectiveMode === 'LEC_WORKBENCH') {
      // LEC Queue: focus on active review items or pending items
      const isReviewTarget = r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED' || r.status === 'FEEDBACK_PENDING';
      if (!isReviewTarget) return false;
    } else if (perspectiveMode === 'MONTHLY_APPRAISAL') {
      // Monthly Appraisal Committee agenda
      if (!r.monthlyAppraisal) return false;
    }

    // 2. Search Filter
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      (r.itemCode && r.itemCode.toLowerCase().includes(q)) ||
      (r.customName && r.customName.toLowerCase().includes(q)) ||
      r.department.toLowerCase().includes(q) ||
      r.requestedBy.toLowerCase().includes(q) ||
      (r.machineName && r.machineName.toLowerCase().includes(q)) ||
      (r.assignedReviewer && r.assignedReviewer.toLowerCase().includes(q)) ||
      (r.systemRequestId && r.systemRequestId.toLowerCase().includes(q));
    
    // 3. Status Filter
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'REVIEW_PENDING' ? (r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED' || r.status === 'PENDING') :
      r.status === statusFilter;

    // 4. Demand Type Filter
    const matchesDemand = demandFilter === 'ALL' || r.demandType === demandFilter;

    return matchesSearch && matchesStatus && matchesDemand;
  });

  // Summary Metrics
  const totalCount = requisitions.length;
  const processItemsCount = requisitions.filter(r => r.processStep === engineerProcess).length;
  const underReviewCount = requisitions.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED' || r.status === 'PENDING').length;
  const feedbackNeededCount = requisitions.filter(r => r.status === 'FEEDBACK_PENDING').length;
  const approvedCount = requisitions.filter(r => r.status === 'APPROVED' || r.status === 'ORDERED' || r.status === 'FULFILLED').length;
  const monthlyAppraisalCount = requisitions.filter(r => r.monthlyAppraisal).length;
  const totalSavingsAchieved = requisitions.reduce((acc, curr) => acc + (curr.costSavingUSD || 0), 0);

  // Selection handlers
  const toggleSelectReq = (id: string) => {
    setSelectedReqIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = filteredItems.length > 0 && filteredItems.every(r => selectedReqIds.has(r.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedReqIds(new Set());
    } else {
      setSelectedReqIds(new Set(filteredItems.map(r => r.id)));
    }
  };

  // Batch actions
  const handleBatchAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewer = lecReviewers.find(r => r.id === assignReviewerId) || lecReviewers[0];
    if (!reviewer) return;

    batchAssignReviewer(Array.from(selectedReqIds), reviewer.name, reviewer.employeeId);
    showBatchToast(`Assigned ${selectedReqIds.size} items to ${reviewer.name} (${reviewer.employeeId}) for quotation audit.`);
    setIsAssignModalOpen(false);
    setSelectedReqIds(new Set());
  };

  const handleBatchSystemRequest = () => {
    const ids = Array.from(selectedReqIds);
    batchSystemRequest(ids);
    showBatchToast(`Dispatched ${ids.length} items to factory ERP/EMS system. Tracking IDs generated.`);
    setSelectedReqIds(new Set());
  };

  const handleBatchSendEmail = () => {
    const ids = Array.from(selectedReqIds);
    batchSendEmail(ids, 'Urgent Equipment Procurement Status Update');
    showBatchToast(`Dispatched notification email alerts for ${ids.length} items to line engineers and supervisors.`);
    setSelectedReqIds(new Set());
  };

  const handleBatchAddToMonthlyAppraisal = () => {
    const ids = Array.from(selectedReqIds);
    batchAddToMonthlyAppraisal(ids, '2026-11');
    showBatchToast(`Added ${ids.length} items into the November 2026 Monthly Equipment Committee Appraisal agenda.`);
    setSelectedReqIds(new Set());
  };

  const handleBatchApprove = () => {
    const ids = Array.from(selectedReqIds);
    batchUpdateStatus(ids, 'APPROVED', 'Batch approved under LEC expedited technical clearance.');
    showBatchToast(`Batch approved ${ids.length} requisitions.`);
    setSelectedReqIds(new Set());
  };

  const handleBatchReject = () => {
    const ids = Array.from(selectedReqIds);
    batchUpdateStatus(ids, 'REJECTED', 'Batch rejected by LEC Reviewer.');
    showBatchToast(`Batch rejected ${ids.length} requisitions.`);
    setSelectedReqIds(new Set());
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING':
        return <Badge variant="blue" size="sm">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="purple" size="sm">Under Review</Badge>;
      case 'FEEDBACK_PENDING':
        return <Badge variant="warning" size="sm">Feedback Needed</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'ORDERED':
        return <Badge variant="blue" size="sm">PO Ordered</Badge>;
      case 'FULFILLED':
        return <Badge variant="neutral" size="sm">Fulfilled</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const getDemandBadge = (demand?: DemandType) => {
    switch (demand) {
      case 'BM':
        return <Badge variant="danger" size="sm">BM (Line Stop)</Badge>;
      case 'MC':
        return <Badge variant="warning" size="sm">MC (Model Change)</Badge>;
      case 'Setup':
      case 'Setup/MC':
        return <Badge variant="purple" size="sm">Setup / MC</Badge>;
      case 'PD':
        return <Badge variant="blue" size="sm">PD (Volume)</Badge>;
      case 'MP':
        return <Badge variant="success" size="sm">MP (Periodic)</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{demand || 'Standard'}</Badge>;
    }
  };

  const getSlaBadge = (slaStatus?: SlaStatus, maxHours?: number) => {
    switch (slaStatus) {
      case 'BREACHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>SLA Breached ({maxHours}h max)</span>
          </span>
        );
      case 'NEAR_BREACH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>&lt;2h Remaining</span>
          </span>
        );
      case 'ON_TIME':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>On-Time ({maxHours || 24}h SLA)</span>
          </span>
        );
    }
  };

  const handlePostFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !feedbackText.trim()) return;

    addFeedback(
      selectedReq.id,
      feedbackAuthorRole === 'REVIEWER' ? `${currentUser.name} (LEC)` : `${currentUser.name} (Engineer)`,
      feedbackAuthorRole,
      feedbackText.trim(),
      feedbackAuthorRole === 'REVIEWER' ? 'REQUEST_INFO' : 'PROVIDE_INFO',
      currentUser.employeeId
    );

    setFeedbackText('');
  };

  const handleExecuteDecision = () => {
    if (!actionModal.reqId || !actionModal.type) return;

    const newStatus: RequisitionStatus = 
      actionModal.type === 'APPROVE' ? 'APPROVED' :
      actionModal.type === 'REJECT' ? 'REJECTED' : 'FEEDBACK_PENDING';

    updateStatus(
      actionModal.reqId,
      newStatus,
      actionModal.note || `Decision recorded: ${actionModal.type}`,
      `${currentUser.employeeId} (${currentUser.name})`,
      actionModal.approvedQty,
      actionModal.strategy,
      actionModal.costSaving
    );

    setActionModal({ type: null, reqId: null, note: '' });
  };

  const calcMatrixOptions = (req: RequisitionItem) => {
    const qty = req.quantity;
    const sp = req.estimatedPrice;
    const spr = sp * 0.35;

    return [
      {
        id: 'PURCHASE_NEW' as const,
        name: 'Strategy A: Purchase New PO',
        tag: 'Vendor PO Issuance',
        cost: sp * qty,
        leadTime: '14 - 21 Days',
        availability: 'Standard Supplier Procurement',
        risk: 'High capital outlay & longer delivery lead time',
        badge: 'Contract Standard',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
        savings: 0,
      },
      {
        id: 'WH_TRANSFER' as const,
        name: 'Strategy B: Inter-Plant Transfer',
        tag: 'WH2 Central Surplus Transfer',
        cost: 0,
        leadTime: '24 - 48 Hours',
        availability: 'Surplus verified in Central Plant WH2',
        risk: 'Zero purchase budget commitment. Expedited transport.',
        badge: 'Recommended: $0 PO Cost',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
        savings: sp * qty,
      },
      {
        id: 'WORKSHOP_REPAIR' as const,
        name: 'Strategy C: Workshop Rebuild / Wait-Repair',
        tag: 'Cleanroom Tool Reconditioning',
        cost: spr * qty,
        leadTime: '3 - 5 Days',
        availability: 'Local Wait-Repair Bay stock ready for overhaul',
        risk: '65% Cost reduction vs. new purchase; fast turnaround.',
        badge: '65% Cost Savings',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
        savings: (sp - spr) * qty,
      },
      {
        id: 'CI_SUBSTITUTE' as const,
        name: 'Strategy D: Common CI Substitute',
        tag: 'Factory Buffer Interchangeability',
        cost: 0,
        leadTime: 'Immediate (0h)',
        availability: 'Identical form-fit-function substitute in plant buffer',
        risk: 'Zero cost. Clears line stoppage instantly.',
        badge: 'Immediate Line Recovery',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
        savings: sp * qty,
      }
    ];
  };

  const allProcesses: ProcessType[] = ['POL', 'TAB', 'DIP', 'LT', 'DB', 'BD'];

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* 1. Top Header & Perspective Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Purchase Requisitions Workbench & Progress Tracking
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              {perspectiveMode === 'MY_PROCESS' ? `Process Step (${engineerProcess})` : currentRole === 'REQUESTOR' ? 'Requestor SLA Tracker' : 'LEC Reviewer Console'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              User: {currentUser.employeeId} ({currentUser.name})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track requisition lifecycle progress by process step, enforce max SLA response deadlines, and process batch operations.
          </p>
        </div>

        {/* 4 Perspective Modes */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start lg:self-auto border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {/* Mode 1: Engineer Process Tracking */}
          <button
            onClick={() => setPerspectiveMode('MY_PROCESS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              perspectiveMode === 'MY_PROCESS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Process Progress ({engineerProcess})</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${perspectiveMode === 'MY_PROCESS' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700'}`}>
              {processItemsCount}
            </span>
          </button>

          {/* Mode 2: LEC Reviewer Queue & Batch Processing */}
          <button
            onClick={() => setPerspectiveMode('LEC_WORKBENCH')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              perspectiveMode === 'LEC_WORKBENCH'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LEC Batch Workbench</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${perspectiveMode === 'LEC_WORKBENCH' ? 'bg-purple-500 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}`}>
              {underReviewCount + feedbackNeededCount}
            </span>
          </button>

          {/* Mode 3: Monthly Equipment Appraisal */}
          <button
            onClick={() => setPerspectiveMode('MONTHLY_APPRAISAL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              perspectiveMode === 'MONTHLY_APPRAISAL'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Appraisal</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${perspectiveMode === 'MONTHLY_APPRAISAL' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700'}`}>
              {monthlyAppraisalCount}
            </span>
          </button>

          {/* Mode 4: All Requisitions */}
          <button
            onClick={() => setPerspectiveMode('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              perspectiveMode === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Items ({totalCount})
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {batchActionToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{batchActionToast}</span>
        </div>
      )}

      {/* 2. Process Switcher Toolbar for Engineers when in MY_PROCESS mode */}
      {perspectiveMode === 'MY_PROCESS' && (
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between flex-wrap gap-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Manufacturing Process Filter:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              Select process step to track component items and procurement milestones
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {allProcesses.map(p => (
              <button
                key={p}
                onClick={() => setEngineerProcess(p)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  engineerProcess === p
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Filtered Items</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">{filteredItems.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Under Review (LEC)</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5 font-mono">{underReviewCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Feedback Needed</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">{feedbackNeededCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Monthly Appraisal</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">{monthlyAppraisalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-950/30 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm flex items-center justify-between col-span-2 sm:col-span-4 lg:col-span-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Strategy Savings</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
              ${totalSavingsAchieved.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-emerald-600/80">Saved via WH2 & Repairs</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Search and Multi-Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between w-full max-w-full overflow-hidden">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search requisition, code, machine, employee ID, EMS..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Filters: Demand Type & Status */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Demand:</span>
            <select
              value={demandFilter}
              onChange={(e) => setDemandFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold outline-none"
            >
              <option value="ALL">All Demands</option>
              <option value="BM">BM (Line Stop - 4h SLA)</option>
              <option value="MC">MC (Model Change - 8h SLA)</option>
              <option value="Setup">Setup (12h SLA)</option>
              <option value="Setup/MC">Setup/MC (12h SLA)</option>
              <option value="PD">PD (Production - 24h SLA)</option>
              <option value="MP">MP (Periodic - 48h SLA)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'REVIEW_PENDING', label: `In Review (${underReviewCount})` },
              { id: 'FEEDBACK_PENDING', label: `Feedback Needed (${feedbackNeededCount})` },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'ORDERED', label: 'Ordered' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                  statusFilter === st.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Master Request Progress List Table (With Multi-Select & Batch Tags) */}
      <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs table-auto">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {/* 0. Multi-Select Checkbox */}
                <th className="py-3 px-2.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Select all filtered items for batch processing"
                  />
                </th>
                <th className="py-3 px-3 w-32">Requisition ID</th>
                <th className="py-3 px-3 min-w-[220px]">Component & Specification</th>
                <th className="py-3 px-3 w-40">Requestor (Emp ID & Name)</th>
                <th className="py-3 px-3 w-36">Equipment & Process</th>
                <th className="py-3 px-3 w-36">Demand & Max SLA</th>
                <th className="py-3 px-3 text-center w-20">Quantity</th>
                <th className="py-3 px-3 text-right w-28">Est. Total</th>
                <th className="py-3 px-3 min-w-[160px]">Progress & Batch Tags</th>
                <th className="py-3 px-3 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <FileCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No requisitions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((req) => {
                  const feedbackCount = req.feedbacks?.length || 0;
                  const isSelectedRow = selectedReqId === req.id;
                  const isChecked = selectedReqIds.has(req.id);

                  return (
                    <tr 
                      key={req.id} 
                      className={`transition-colors cursor-pointer ${
                        isSelectedRow 
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-600' 
                          : isChecked
                          ? 'bg-purple-50/40 dark:bg-purple-950/20'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                      onClick={() => setSelectedReqId(req.id)}
                    >
                      {/* 0. Row Checkbox */}
                      <td className="py-3 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectReq(req.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>

                      {/* 1. Requisition ID */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {req.code}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* 2. Component */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-[220px]" title={req.title}>
                          {req.customName || req.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{req.itemCode || req.code}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{req.category}</span>
                        </div>
                      </td>

                      {/* 3. Requestor (Emp ID & Name) */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 font-mono text-[11px] truncate">
                          {req.requestorEmployeeId ? `${req.requestorEmployeeId}` : req.requestedBy.split(' ')[0]}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate font-semibold">
                          {req.requestorName || req.requestedBy}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {req.department}
                        </div>
                      </td>

                      {/* 4. Equipment & Process */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-blue-700 dark:text-blue-300 font-mono text-[11px]">
                          {req.machineLine || 'Line #204'}
                        </div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]" title={req.machineName}>
                          {req.machineName || 'Machine DB-01'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold font-mono">
                          Process: <span className="text-blue-600 dark:text-blue-400">{req.processStep || 'DB'}</span>
                        </div>
                      </td>

                      {/* 5. Demand & SLA */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {getDemandBadge(req.demandType)}
                          <div>
                            {getSlaBadge(req.slaStatus, req.slaMaxHours)}
                          </div>
                        </div>
                      </td>

                      {/* 6. Quantity */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {req.approvedQuantity ? (
                          <div>
                            <span className="text-emerald-600">{req.approvedQuantity}</span>
                            <span className="text-slate-400 text-[10px] block">of {req.quantity}</span>
                          </div>
                        ) : (
                          <span>{req.quantity} {req.unit}</span>
                        )}
                      </td>

                      {/* 7. Estimated Total */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          ${(req.estimatedPrice * (req.approvedQuantity || req.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          @ ${req.estimatedPrice.toFixed(2)}/u
                        </div>
                      </td>

                      {/* 8. Progress Status & Batch Tags */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div>{getStatusBadge(req.status)}</div>

                          {/* Dynamic Batch Action Badges */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {req.monthlyAppraisal && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>Monthly: {req.monthlyAppraisalMonth || 'Nov 2026'}</span>
                              </span>
                            )}

                            {req.systemRequested && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                <Zap className="w-2.5 h-2.5" />
                                <span>{req.systemRequestId}</span>
                              </span>
                            )}

                            {req.emailNotified && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <Mail className="w-2.5 h-2.5" />
                                <span>Mail Sent</span>
                              </span>
                            )}

                            {req.assignedReviewer && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                <UserCheck className="w-2.5 h-2.5" />
                                <span>Quote: {req.assignedReviewer}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReqId(req.id);
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-600 hover:text-blue-600 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* 6. FLOATING MULTI-SELECT BATCH ACTION BAR FOR LEC                          */}
      {/* -------------------------------------------------------------------------- */}
      {selectedReqIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 flex items-center gap-3 animate-slideUp flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="font-bold text-xs">
              {selectedReqIds.size} item{selectedReqIds.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 dark:bg-slate-300 hidden sm:block"></div>

          {/* Action 1: Assign Reviewer & Request Quotation */}
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            title="Assign reviewer and request supplier quotation"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. Quotation & Reviewer</span>
          </button>

          {/* Action 2: ERP System Request */}
          <button
            onClick={handleBatchSystemRequest}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            title="Dispatch batch request to ERP / EMS simulation"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. System Request</span>
          </button>

          {/* Action 3: Send Email Alerts */}
          <button
            onClick={handleBatchSendEmail}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            title="Send notification email alerts to requestors and line supervisors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>3. Send Mail Alert</span>
          </button>

          {/* Action 4: Monthly Appraisal */}
          <button
            onClick={handleBatchAddToMonthlyAppraisal}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            title="Add selected items to the Monthly Equipment Committee agenda"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>4. Monthly Appraisal</span>
          </button>

          {/* Action 5: Batch Quick Approve */}
          <button
            onClick={handleBatchApprove}
            className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 text-xs font-bold transition-all text-emerald-400 dark:text-emerald-700 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Quick Decision</span>
          </button>

          {/* Deselect All */}
          <button
            onClick={() => setSelectedReqIds(new Set())}
            className="text-xs text-slate-400 hover:text-white dark:hover:text-slate-900 underline ml-1"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* MODAL: ASSIGN REVIEWER & QUOTATION SPECIALIST                              */}
      {/* -------------------------------------------------------------------------- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <span>Assign Reviewer & Request Quotation ({selectedReqIds.size} items)</span>
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchAssignSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                Designate an LEC Reviewer or Quotation Specialist to appraise unit pricing, allocate buffer stock, and negotiate terms:
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Select LEC Reviewer / Quotation Specialist *
                </label>
                <select
                  value={assignReviewerId}
                  onChange={(e) => setAssignReviewerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold outline-none"
                >
                  {lecReviewers.map((rev) => (
                    <option key={rev.id} value={rev.id}>
                      {rev.name} ({rev.employeeId}) — {rev.title} [Limit: ${rev.approvalLimitUSD.toLocaleString()}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] space-y-1 text-purple-900 dark:text-purple-200">
                <div className="font-bold">Automated Routing Protocol:</div>
                <ul className="list-disc list-inside space-y-0.5 text-purple-800 dark:text-purple-300">
                  <li>Quotation status advances to: <strong>IN_PROGRESS</strong>.</li>
                  <li>Attaches Assigned Reviewer metadata tag to each targeted requisition.</li>
                  <li>Generates audit feedback timestamp and dispatches notification.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20"
                >
                  Confirm Assignment ({selectedReqIds.size})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* 7. BOTTOM DRAWER: DETAILS & 4-OPTION DECISION MATRIX                       */}
      {/* -------------------------------------------------------------------------- */}
      {selectedReq && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-fadeIn space-y-0">
          {/* Drawer Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                {selectedReq.code}
              </span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {selectedReq.customName || selectedReq.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                {selectedReq.quantity} {selectedReq.unit}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setActiveDrawerTab('DECISION_MATRIX')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeDrawerTab === 'DECISION_MATRIX'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  4-Option Decision Matrix
                </button>
                <button
                  onClick={() => setActiveDrawerTab('DETAILS')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeDrawerTab === 'DETAILS'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Full Technical Details
                </button>
                <button
                  onClick={() => setActiveDrawerTab('DISCUSSION')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeDrawerTab === 'DISCUSSION'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Feedback Thread ({selectedReq.feedbacks?.length || 0})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReqId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-5">
            {/* TAB 1: 4-Option Decision Matrix */}
            {activeDrawerTab === 'DECISION_MATRIX' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {calcMatrixOptions(selectedReq).map((opt) => {
                    const isSelected = selectedStrategy === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedStrategy(opt.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>

                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{opt.name}</div>
                          <div className="text-[10px] text-slate-400">{opt.tag}</div>
                        </div>

                        <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Total Outlay:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              ${opt.cost.toFixed(2)} USD
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Lead Time:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{opt.leadTime}</span>
                          </div>
                          {opt.savings > 0 && (
                            <div className="flex items-center justify-between text-emerald-600 font-bold">
                              <span>Budget Saved:</span>
                              <span className="font-mono">+${opt.savings.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 pt-1">{opt.risk}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Partial Quantity Allocation Input */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Partial Quantity Approval Tool:
                    </span>
                    <span className="text-slate-500">
                      Requested: <strong className="font-mono">{selectedReq.quantity} {selectedReq.unit}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Approved Allocation:</span>
                    <input
                      type="number"
                      min={1}
                      max={selectedReq.quantity}
                      value={customApprovedQty}
                      onChange={(e) => setCustomApprovedQty(Math.min(selectedReq.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 px-2.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none text-blue-600"
                    />
                    <span className="text-slate-500 font-mono">{selectedReq.unit}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Full Technical Details */}
            {activeDrawerTab === 'DETAILS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Requestor Identity Card */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                  <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Requestor Identity (Line Creator)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Employee ID (Emp ID):</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                        {selectedReq.requestorEmployeeId || selectedReq.requestedBy.split(' ')[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Requestor Name:</span>
                      <span className="font-bold">{selectedReq.requestorName || selectedReq.requestedBy}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dept: <strong>{selectedReq.department}</strong>
                  </div>
                </div>

                {/* Equipment Hierarchy */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Layers2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Hierarchy: Machine &rarr; Unit &rarr; Assembly</span>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <div>1. Machine: <strong>{selectedReq.machineName || 'Machine DB-01'}</strong> ({selectedReq.machineLine || 'Line #204'})</div>
                    <div>2. Unit: <strong className="font-mono">{selectedReq.ebomUnitCode || 'UNT-OPT-01'}</strong></div>
                    <div>3. Assembly: <strong className="font-mono">{selectedReq.ebomAssemblyCode || 'ASM-DB-001'}</strong></div>
                    <div>EM Number (14 Chars): <strong className="font-mono text-blue-600">{selectedReq.ebomEmNo || 'HWBMTL21EC0101'}</strong></div>
                  </div>
                </div>

                {/* Quantity Logic & Problem */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-purple-600" />
                    <span>Quantity Logic & Problem</span>
                  </div>
                  <div className="text-[11px] space-y-1">
                    <div>Formula: <strong className="font-mono text-purple-600">{selectedReq.quantityLogicText || 'Standard single replacement'}</strong></div>
                    <div>Problem: <span className="text-slate-600 dark:text-slate-300">{selectedReq.problemDescription || 'Normal wear during production'}</span></div>
                    <div>Situation: <span className="text-slate-600 dark:text-slate-300">{selectedReq.currentSituation || 'Running normally'}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Feedback Discussion Thread */}
            {activeDrawerTab === 'DISCUSSION' && (
              <div className="space-y-3">
                {selectedReq.reviewDecisionNotes && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Reviewer Formal Decision Notes:</span>
                    </div>
                    <p className="mt-1">{selectedReq.reviewDecisionNotes}</p>
                  </div>
                )}

                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {(!selectedReq.feedbacks || selectedReq.feedbacks.length === 0) ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No feedback comments yet.
                    </div>
                  ) : (
                    selectedReq.feedbacks.map((fb) => (
                      <div 
                        key={fb.id} 
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          fb.role === 'REVIEWER'
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 ml-3'
                            : 'bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 mr-3'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            {fb.employeeId ? `[${fb.employeeId}] ` : ''}{fb.author} ({fb.role})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{fb.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostFeedback} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <textarea
                    rows={2}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter technical message or clarification..."
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Post Message
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setActionModal({ type: 'REJECT', reqId: selectedReq.id, note: '' })}
              className="px-3 py-1.5 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Reject
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActionModal({ type: 'REQUEST_INFO', reqId: selectedReq.id, note: 'Requesting technical clarification regarding buffer and transfer.' })}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50"
              >
                Request Info
              </button>

              <button
                type="button"
                onClick={() => {
                  const opts = calcMatrixOptions(selectedReq);
                  const picked = opts.find(o => o.id === selectedStrategy);
                  const savings = picked ? picked.savings : 0;

                  setActionModal({ 
                    type: 'APPROVE', 
                    reqId: selectedReq.id, 
                    note: `Approved via ${selectedStrategy} (Qty: ${customApprovedQty}). Cost savings: $${savings.toFixed(2)}.`,
                    strategy: selectedStrategy,
                    approvedQty: customApprovedQty,
                    costSaving: savings
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Approve with Strategy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {actionModal.type && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-scaleUp">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Confirm Decision: {actionModal.type}</span>
            </h4>

            {actionModal.type === 'APPROVE' && actionModal.strategy && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div>Strategy: <strong className="font-mono text-emerald-700 dark:text-emerald-300">{actionModal.strategy}</strong></div>
                <div>Approved Quantity: <strong>{actionModal.approvedQty} units</strong></div>
                {actionModal.costSaving !== undefined && actionModal.costSaving > 0 && (
                  <div>Budget Saved: <strong className="text-emerald-600 font-mono">${actionModal.costSaving.toFixed(2)} USD</strong></div>
                )}
              </div>
            )}

            <textarea
              rows={3}
              value={actionModal.note}
              onChange={(e) => setActionModal(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Enter audit decision remarks..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModal({ type: null, reqId: null, note: '' })}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDecision}
                className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm {actionModal.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
