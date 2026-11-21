import React from 'react';
import { Upload, X } from 'lucide-react';

interface EmNoImportModalProps {
  isOpen: boolean;
  rawCsvText: string;
  setRawCsvText: (text: string) => void;
  importFeedback: string | null;
  onClose: () => void;
  onParseCsv: () => void;
}

export const EmNoImportModal: React.FC<EmNoImportModalProps> = ({
  isOpen,
  rawCsvText,
  setRawCsvText,
  importFeedback,
  onClose,
  onParseCsv,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Import EM No Master Records from CSV
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Paste CSV data with columns in order:
          <br />
          <code className="text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
            Factory, Line, EM No, Model Product, Process, Machine, Unit, Assembly, Element, Maker
          </code>
        </p>

        <textarea
          rows={8}
          value={rawCsvText}
          onChange={(e) => setRawCsvText(e.target.value)}
          placeholder={`"HW","Line #201","HWBMTL21101101","Apple Watch Ultra 2","POL","CLEAN","LOADING","BUFFER STAGE 1-1","Porous Ceramic Vacuum Chuck","YTS"`}
          className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
        />

        {importFeedback && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold">
            {importFeedback}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onParseCsv}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            Parse & Import
          </button>
        </div>
      </div>
    </div>
  );
};
