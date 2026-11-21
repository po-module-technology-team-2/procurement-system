import React, { Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Lazy-loaded Views for High-Performance Code Splitting & Token Efficiency
const QCodeLookupView = React.lazy(() => import('./components/views/QCodeLookupView').then(m => ({ default: m.QCodeLookupView })));
const EmNoMasterView = React.lazy(() => import('./components/views/EmNoMasterView').then(m => ({ default: m.EmNoMasterView })));
const DashboardView = React.lazy(() => import('./components/views/DashboardView').then(m => ({ default: m.DashboardView })));
const RequisitionsView = React.lazy(() => import('./components/views/RequisitionsView').then(m => ({ default: m.RequisitionsView })));
const InventoryView = React.lazy(() => import('./components/views/InventoryView').then(m => ({ default: m.InventoryView })));
const SettingsView = React.lazy(() => import('./components/views/SettingsView').then(m => ({ default: m.SettingsView })));

const ViewSkeleton: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 animate-fadeIn">
    <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
      Loading view module...
    </span>
  </div>
);

const MainContent: React.FC = () => {
  const { activeView } = useProcurement();

  return (
    <Suspense fallback={<ViewSkeleton />}>
      {activeView === 'qcode-lookup' && <QCodeLookupView />}
      {activeView === 'em-no' && <EmNoMasterView />}
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'requisitions' && <RequisitionsView />}
      {activeView === 'inventory' && <InventoryView />}
      {activeView === 'settings' && <SettingsView />}
    </Suspense>
  );
};

const AppShell: React.FC = () => {
  const { isSidebarCollapsed } = useProcurement();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex">
      {/* Enterprise Clean Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-[1750px] w-full mx-auto animate-fadeIn">
          <MainContent />
        </main>

        {/* Clean Minimalist Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm py-3 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Procurement Operations</span>
            <span>—</span>
            <span>Batch Q-Code Verification & Interlock Engine</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              100% Offline Static Bundle
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Nexacro Dataset Synced (69 Items)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ProcurementProvider>
        <AppShell />
      </ProcurementProvider>
    </ThemeProvider>
  );
}

export default App;
