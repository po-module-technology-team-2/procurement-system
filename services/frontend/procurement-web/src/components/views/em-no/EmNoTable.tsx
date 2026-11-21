import React from 'react';
import { EmNoRecord } from '../../../types';
import { getEquipmentStatusBadge } from '../../../utils/emNoHelper';
import { Copy, Check, Eye, Edit2, Trash2, Wrench, Tag, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';

interface EmNoTableProps {
  filteredRecords: EmNoRecord[];
  paginatedRecords: EmNoRecord[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  copiedCode: string | null;
  onCopy: (text: string) => void;
  onOpenDetail: (record: EmNoRecord) => void;
  onOpenEdit: (record: EmNoRecord) => void;
  onDelete: (id: string, emNo: string) => void;
  onOpenQuickReq: (record: EmNoRecord) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const EmNoTable: React.FC<EmNoTableProps> = ({
  filteredRecords,
  paginatedRecords,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  copiedCode,
  onCopy,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onOpenQuickReq,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Table Header Bar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Matched Equipment Records:
          </span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {filteredRecords.length.toLocaleString()}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="ml-2 text-rose-500 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-xs table-auto">
          <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-44">EM No (14 Chars)</th>
              <th className="py-3 px-3 w-32">Factory & Line</th>
              <th className="py-3 px-3 w-48">Model Product</th>
              <th className="py-3 px-3 w-40">Process & Machine</th>
              <th className="py-3 px-3 min-w-[180px]">Unit & Assembly</th>
              <th className="py-3 px-3 min-w-[220px]">Element (Sub-Component)</th>
              <th className="py-3 px-3 w-28">Maker</th>
              <th className="py-3 px-3 w-28">Status</th>
              <th className="py-3 px-3 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Cpu className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <span className="font-semibold">No equipment records match current filter criteria.</span>
                    <span className="text-[11px] text-slate-500">Try loosening your search terms or resetting filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => onOpenDetail(item)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer tracking-tight"
                          title="Click to view full 14-char syntax breakdown"
                        >
                          {item.emNo}
                        </span>
                        <button
                          type="button"
                          onClick={() => onCopy(item.emNo)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="Copy EM No"
                        >
                          {copiedCode === item.emNo ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        Floor {item.floor || '2'} | {item.shop || 'Shop B'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 block w-fit">
                        {item.line}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {item.factoryId} (Hai Phong)
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[190px]" title={item.modelProduct}>
                        {item.modelProduct}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.process}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]" title={item.machine}>
                          {item.machine}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[180px]" title={item.unit}>
                        {item.unit}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[180px]" title={item.assembly}>
                        ↳ {item.assembly}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[220px]" title={item.element}>
                          {item.element}
                        </span>
                      </div>
                      {item.associatedQCodes && item.associatedQCodes.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Tag className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            {item.associatedQCodes.join(', ')}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {item.maker || 'LG PRI'}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEquipmentStatusBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenQuickReq(item)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Directly launch Requisition for this equipment"
                        >
                          <span>Request</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDetail(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                          title="View full specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                          title="Edit EM No"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(item.id, item.emNo)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          title="Delete EM No"
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

      {/* Pagination Bar */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 font-semibold text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
