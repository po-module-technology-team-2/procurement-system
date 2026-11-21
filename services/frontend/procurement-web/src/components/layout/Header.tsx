import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole, TeamType, ProcessType } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Workflow, 
  Sun, 
  Moon, 
  Layers, 
  CheckCircle2, 
  Search,
  Sparkles,
  Database,
  User,
  Clock
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    currentRole, 
    setCurrentRole, 
    currentTeam, 
    setCurrentTeam, 
    currentProcess, 
    setCurrentProcess,
    currentUser,
    teamsList
  } = useProcurement();

  const { theme, toggleTheme } = useTheme();

  const roles: UserRole[] = ['REQUESTOR', 'APPROVER', 'ADMIN', 'BUYER', 'AUDITOR'];
  
  // Specific processes requested: POL | TAB | DIP | LT | DB | BD
  const processes: { code: ProcessType; label: string }[] = [
    { code: 'POL', label: 'POL (Polarizer)' },
    { code: 'TAB', label: 'TAB (Tape Bonding)' },
    { code: 'DIP', label: 'DIP (Package Bonding)' },
    { code: 'LT', label: 'LT (Laser Trimming)' },
    { code: 'DB', label: 'DB (Die Bonding)' },
    { code: 'BD', label: 'BD (Wire Bonding)' },
  ];

  // Dynamically configured teams from Settings
  const teams = teamsList.map(t => ({ code: t.id, label: t.name }));

  const getViewTitle = () => {
    switch (activeView) {
      case 'qcode-lookup':
        return {
          title: 'Q-Code Verification & Interlock Engine',
          subtitle: 'Direct component audit, 10-guardrail verification & purchase requisition'
        };
      case 'em-no':
        return {
          title: 'EM No Master & EBOM Hierarchy Explorer',
          subtitle: 'Shopfloor equipment matrix: Factory, Line, Model, Process, Machine, Unit, Assembly & Element'
        };
      case 'dashboard':
        return {
          title: 'Procurement Intelligence Dashboard',
          subtitle: 'Spending velocity, interlock alerts & SLA response queue'
        };
      case 'requisitions':
        return {
          title: currentRole === 'REQUESTOR' ? 'My Requisitions & SLA Tracker' : 'Reviewer Workbench & SLA Queue',
          subtitle: 'Lifecycle tracking, 4-Option Decision Matrix & response deadlines'
        };
      case 'inventory':
        return {
          title: 'Offline Inventory & Buffer Stock',
          subtitle: 'Local stock balance, allocation status & WH2 transfer availability'
        };
      case 'settings':
        return {
          title: 'System Configuration & Governance',
          subtitle: 'SLA thresholds, interlock rules & offline database sync'
        };
      default:
        return {
          title: 'Procurement Operations',
          subtitle: 'Enterprise materials workflow platform'
        };
    }
  };

  const viewInfo = getViewTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left Side: Current View Title & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {viewInfo.title}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              {viewInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Process, Team, Role & User Persona */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* 1. Process Selector (POL | TAB | DIP | LT | DB | BD) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <Workflow className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Process:</span>
            <select
              value={currentProcess}
              onChange={(e) => setCurrentProcess(e.target.value as ProcessType)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer text-xs"
            >
              {processes.map((p) => (
                <option key={p.code} value={p.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Team Selector (PO Module Technology Team 2) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Team:</span>
            <select
              value={currentTeam}
              onChange={(e) => setCurrentTeam(e.target.value as TeamType)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer text-xs max-w-[200px] truncate"
            >
              {teams.map((t) => (
                <option key={t.code} value={t.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Role Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer text-xs"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
                  {r === 'APPROVER' ? 'APPROVER (LEC)' : r}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Requestor / User Identity Pill (Employee ID + Name) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/70 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="leading-tight">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] flex items-center gap-1">
                <span className="font-mono text-blue-700 dark:text-blue-300 font-extrabold">{currentUser.employeeId}</span>
                <span>•</span>
                <span>{currentUser.name}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentRole === 'REQUESTOR' ? 'Requestor (Line Eng)' : 'LEC Technical Reviewer'}
              </div>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Color Theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
