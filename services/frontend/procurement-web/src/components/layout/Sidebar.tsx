import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useTheme } from '../../context/ThemeContext';
import { NavView } from '../../types';
import { 
  Search, 
  LayoutDashboard, 
  FileCheck, 
  Package, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Layers,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowUpRight,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed,
    currentRole,
    currentTeam,
    currentUser,
    requisitions
  } = useProcurement();

  const { theme, toggleTheme } = useTheme();

  // Count requests needing review or feedback
  const pendingReviewCount = requisitions.filter(
    (r) => r.status === 'UNDER_REVIEW' || r.status === 'FEEDBACK_PENDING' || r.status === 'SUBMITTED' || r.status === 'PENDING'
  ).length;

  const isReviewerRole = currentRole === 'APPROVER' || currentRole === 'ADMIN' || currentRole === 'AUDITOR';

  const coreNavItems: { id: NavView; label: string; badge?: number; badgeColor?: string; icon: React.ReactNode }[] = [
    { 
      id: 'qcode-lookup', 
      label: isReviewerRole ? 'Q-Code Guardrail Audit' : 'Q-Code Part Lookup', 
      icon: <Search className="w-4 h-4" /> 
    },
    { 
      id: 'em-no', 
      label: 'EM No Master & EBOM', 
      icon: <Cpu className="w-4 h-4" /> 
    },
    { 
      id: 'requisitions', 
      label: isReviewerRole ? 'Reviewer Workbench (LEC)' : 'My Requests & Tracker', 
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      icon: <FileCheck className="w-4 h-4" /> 
    },
    { 
      id: 'dashboard', 
      label: 'Procurement Dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
  ];

  const secondaryNavItems: { id: NavView; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'inventory', 
      label: 'Inventory & Stock', 
      icon: <Package className="w-4 h-4" /> 
    },
    { 
      id: 'settings', 
      label: 'Settings & Policy', 
      icon: <Settings className="w-4 h-4" /> 
    },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 select-none shadow-sm ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. Header & Brand Block */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight block truncate">
                  Procurement Web
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block tracking-wider truncate">
                  OpsFlow Enterprise
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            aria-label="Toggle Sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. Navigation Menu */}
        <div className="p-3 space-y-4 mt-1 overflow-y-auto">
          {/* Section 1: Core Operations */}
          <div>
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                Operations & Review
              </div>
            )}
            <nav className="space-y-1">
              {coreNavItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isActive ? 'bg-white text-blue-600' : item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {isSidebarCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: Inventory & Governance */}
          <div>
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                Inventory & Settings
              </div>
            )}
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* 3. Footer with Role / Team Status & Theme Switcher */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* User Context Info Card */}
        {!isSidebarCollapsed && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Role</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </div>
            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5 truncate flex items-center gap-1">
              <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">{currentUser.employeeId}</span>
              <span>•</span>
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {currentUser.teamLabel || 'PO Module Technology Team 2'}
            </div>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
          {!isSidebarCollapsed && (
            <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
