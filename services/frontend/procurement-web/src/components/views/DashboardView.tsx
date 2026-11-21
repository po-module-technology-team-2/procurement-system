import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { NewRequisitionModal } from '../modals/NewRequisitionModal';
import { DemandType } from '../../types';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Plus, 
  Search, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Truck,
  Wrench,
  ShieldCheck,
  Layers,
  Activity
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { requisitions, setActiveView, updateStatus } = useProcurement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Stats Calculations
  const totalCount = requisitions.length;
  const inReviewCount = requisitions.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED').length;
  const feedbackNeededCount = requisitions.filter(r => r.status === 'FEEDBACK_PENDING').length;
  const approvedCount = requisitions.filter(r => r.status === 'APPROVED' || r.status === 'ORDERED' || r.status === 'FULFILLED').length;
  const totalCommitUSD = requisitions.reduce((sum, r) => sum + (r.estimatedPrice * (r.approvedQuantity || r.quantity)), 0);
  const totalSavingsUSD = requisitions.reduce((sum, r) => sum + (r.costSavingUSD || 0), 0);

  // Demand Type Breakdown
  const demandStats: Record<DemandType, { count: number; spend: number }> = {
    'Setup/MC': { count: 0, spend: 0 },
    'PD': { count: 0, spend: 0 },
    'BM': { count: 0, spend: 0 },
    'MP': { count: 0, spend: 0 },
  };

  requisitions.forEach(r => {
    const dType = r.demandType || 'PD';
    if (demandStats[dType]) {
      demandStats[dType].count += 1;
      demandStats[dType].spend += r.estimatedPrice * (r.approvedQuantity || r.quantity);
    }
  });

  // Filtered recent items
  const filteredRequisitions = requisitions.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.itemCode && r.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customName && r.customName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'ORDERED':
        return <Badge variant="blue" size="sm">Ordered</Badge>;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return <Badge variant="purple" size="sm">In Review</Badge>;
      case 'FEEDBACK_PENDING':
        return <Badge variant="warning" size="sm">Feedback Needed</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'FULFILLED':
        return <Badge variant="neutral" size="sm">Fulfilled</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger" size="sm">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="blue" size="sm">Medium</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Procurement Command Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Live Operations
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time material requisitions, LEC interlock approvals, and cost-avoidance metrics across factory lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('qcode-lookup')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Q-Code Guardrail Lookup</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Requisitions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Requisitions
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{totalCount}</span>
            <span className="text-xs text-slate-500">items</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-500" />
            <span>Across 4 factory divisions</span>
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              In Review (LEC)
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 font-mono">{inReviewCount}</span>
            <span className="text-xs text-purple-500 font-medium">Awaiting Audit</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Technical guardrail verification
          </p>
        </div>

        {/* Feedback Needed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Feedback Needed
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono">{feedbackNeededCount}</span>
            <span className="text-xs text-amber-500 font-medium">Action Pending</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Reviewer-requestor thread open
          </p>
        </div>

        {/* Approved & In Pipeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Approved / Ordered
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">{approvedCount}</span>
            <span className="text-xs text-emerald-500 font-medium">Authorized</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            PO released / in delivery
          </p>
        </div>

        {/* Total Cost Savings */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Cost Avoidance
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              ${totalSavingsUSD.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            Saved via WH2 & Repairs
          </p>
        </div>
      </div>

      {/* Demand Classification Spend Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'Setup/MC' as const, label: 'Setup / MC (Conversion)', desc: 'Tooling & head calibration', color: 'border-purple-200 bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300' },
          { key: 'PD' as const, label: 'PD (Production Demand)', desc: 'High-runner buffer refill', color: 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
          { key: 'BM' as const, label: 'BM (Breakdown Line Stop)', desc: 'Emergency failure recovery', color: 'border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300' },
          { key: 'MP' as const, label: 'MP (Periodic Overhaul)', desc: 'Scheduled maintenance PM', color: 'border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' },
        ].map((d) => (
          <div key={d.key} className={`p-3.5 rounded-xl border ${d.color}`}>
            <div className="text-xs font-bold">{d.label}</div>
            <div className="text-[10px] opacity-70">{d.desc}</div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-mono font-bold">
                ${demandStats[d.key].spend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
              <span className="font-bold px-1.5 py-0.2 rounded bg-white/70 dark:bg-black/30 text-[10px]">
                {demandStats[d.key].count} Req
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requisitions Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Requisitions & Review Pipeline
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Direct access to live equipment requests and review actions
            </p>
          </div>

          {/* Search bar & Navigate button */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requisitions..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={() => setActiveView('requisitions')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shrink-0 shadow-sm transition-colors"
            >
              <span>Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Component & Custom Specification</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Est. Total</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredRequisitions.slice(0, 6).map((req) => (
                <tr 
                  key={req.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {req.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {req.customName || req.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {req.itemCode || req.category}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[10px] text-blue-600">{req.demandType || 'Standard'}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {req.quantity} {req.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${(req.estimatedPrice * req.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>{req.department}</div>
                    <div className="text-slate-400 text-[10px]">{req.requestedBy.split(' ')[0]}</div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveView('requisitions')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Requisition Modal */}
      <NewRequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
