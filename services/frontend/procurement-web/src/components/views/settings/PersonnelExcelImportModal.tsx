import React from 'react';
import { FileSpreadsheet, X, AlertTriangle, ArrowRight } from 'lucide-react';

interface PersonnelExcelImportModalProps {
  isOpen: boolean;
  rawText: string;
  setRawText: (text: string) => void;
  parseError: string | null;
  onClose: () => void;
  onImport: () => void;
}

export const PersonnelExcelImportModal: React.FC<PersonnelExcelImportModalProps> = ({
  isOpen,
  rawText,
  setRawText,
  parseError,
  onClose,
  onImport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Import Personnel Roster from Excel / Spreadsheet</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Copy rows directly from your Excel sheet (`employeeName`, `employeeNo`, `department`, `Process`, `Team`, `role`) and paste below. Tab-delimited (from Excel) and comma-delimited (CSV) are automatically supported.
          </p>

          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Cao Van Tan\tVH149218\tNY SW PO M Technology DB/BD Part\tcaovantan@lgdisplay.com\t0395384045\tEngineer\tPOL\tPO Module Technology Team 2\nHoang Duc Hao\tVH074302\tNY SW PO M Technology DB/BD Part\thoangduchao71@lgdisplay.com\t0357632255\tSenior Engineer\tPOL\tPO Module Technology Team 2`}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] outline-none"
          />

          {parseError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400">
              Duplicates by Employee ID will be automatically skipped.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>Parse & Import Roster</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
