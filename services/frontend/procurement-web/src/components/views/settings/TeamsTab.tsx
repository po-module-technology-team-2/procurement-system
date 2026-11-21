import React from 'react';
import { TeamConfig, TeamType } from '../../../types';
import { Building2 } from 'lucide-react';

interface TeamsTabProps {
  teamsList: TeamConfig[];
  currentTeam: TeamType;
  setCurrentTeam: (team: TeamType) => void;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({
  teamsList,
  currentTeam,
  setCurrentTeam,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Factory Teams & Engineering Responsibilities</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure departmental assignments, designated team leads, assigned process stages, and line coverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Active Operating Team:</span>
            <select
              value={currentTeam}
              onChange={(e) => setCurrentTeam(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 outline-none"
            >
              {teamsList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamsList.map((team) => {
            const isSelectedTeam = currentTeam === team.id;
            return (
              <div
                key={team.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isSelectedTeam
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelectedTeam ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{team.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{team.code}</div>
                    </div>
                  </div>

                  {isSelectedTeam ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      Current Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentTeam(team.id as any)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      Select Team
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Engineer</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{team.leadName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{team.leadEmployeeId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Cleanroom Location</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">{team.location}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Processes:</span>
                    {team.assignedProcesses.map((p) => (
                      <span key={p} className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Line Coverage:</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      {team.assignedLines.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
