import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  ArrowUpDown, 
  Layers, 
  Truck, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Filter,
  DollarSign
} from 'lucide-react';

interface StockItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  department: string;
  inStock: number;
  allocated: number;
  available: number;
  safetyStock: number;
  unit: string;
  unitPriceUSD: number;
  location: string;
  waitRepairQty: number;
  transferAvailableQty: number;
  status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
}

const mockInventory: StockItem[] = [
  {
    id: 'inv-1',
    partNumber: 'QCAC13053',
    name: 'Precision PU Hose 6mm/4mm Blue (TU0604BU3-100)',
    category: 'Hose/Tube',
    department: 'PO_MODULE_1',
    inStock: 12,
    allocated: 4,
    available: 8,
    safetyStock: 10,
    unit: 'REEL',
    unitPriceUSD: 115.2,
    location: 'Warehouse A - Rack 04',
    waitRepairQty: 0,
    transferAvailableQty: 15,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-2',
    partNumber: 'QCAD17426',
    name: 'High-Torque Servomotor Main Axis (HG-SR102)',
    category: 'Drive Systems',
    department: 'TAB_DIP',
    inStock: 2,
    allocated: 2,
    available: 0,
    safetyStock: 4,
    unit: 'EA',
    unitPriceUSD: 380.0,
    location: 'Cleanroom Storage A - Bin 12',
    waitRepairQty: 1,
    transferAvailableQty: 0,
    status: 'CRITICAL',
  },
  {
    id: 'inv-3',
    partNumber: 'Q00001',
    name: 'Pneumatic Compact Cylinder 25mm Stroke (CDQ2B25-20DZ)',
    category: 'Pneumatics',
    department: 'PO_MODULE_1',
    inStock: 32,
    allocated: 6,
    available: 26,
    safetyStock: 15,
    unit: 'EA',
    unitPriceUSD: 45.0,
    location: 'Maintenance Bay 2 - Shelf B',
    waitRepairQty: 4,
    transferAvailableQty: 8,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-4',
    partNumber: 'Q00002',
    name: 'Vacuum Silicone Suction Cup 20mm (ZP3-T20UM-A5)',
    category: 'Robot Parts',
    department: 'LAMI_LASER',
    inStock: 8,
    allocated: 5,
    available: 3,
    safetyStock: 12,
    unit: 'EA',
    unitPriceUSD: 18.5,
    location: 'Tool Crib Cleanroom - Drawer 03',
    waitRepairQty: 0,
    transferAvailableQty: 24,
    status: 'LOW',
  },
  {
    id: 'inv-5',
    partNumber: 'QCAC13055',
    name: 'Anti-Static ESD Conductive Air Line Tube 8mm',
    category: 'Hose/Tube',
    department: 'CP_SG',
    inStock: 14,
    allocated: 2,
    available: 12,
    safetyStock: 8,
    unit: 'REEL',
    unitPriceUSD: 85.0,
    location: 'Warehouse B - Rack 09',
    waitRepairQty: 0,
    transferAvailableQty: 4,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-6',
    partNumber: 'QCBC04912',
    name: 'Industrial High-Resolution CCD Alignment Camera 5MP',
    category: 'Vision Systems',
    department: 'PO_MODULE_1',
    inStock: 1,
    allocated: 1,
    available: 0,
    safetyStock: 2,
    unit: 'EA',
    unitPriceUSD: 1250.0,
    location: 'Cleanroom Optics Vault - Bin 01',
    waitRepairQty: 1,
    transferAvailableQty: 0,
    status: 'CRITICAL',
  },
  {
    id: 'inv-7',
    partNumber: 'QCBD09123',
    name: 'Linear Guide Rail Carriage Motion Block 15mm (HGH15CA)',
    category: 'Mechanical Drive',
    department: 'TAB_DIP',
    inStock: 5,
    allocated: 3,
    available: 2,
    safetyStock: 6,
    unit: 'EA',
    unitPriceUSD: 92.0,
    location: 'Maintenance Bay 1 - Shelf E',
    waitRepairQty: 2,
    transferAvailableQty: 12,
    status: 'LOW',
  },
  {
    id: 'inv-8',
    partNumber: 'QCEE01928',
    name: 'High-Flow Argon Shield Gas Solenoid Valve 24V DC',
    category: 'Pneumatics & Gas',
    department: 'LAMI_LASER',
    inStock: 18,
    allocated: 0,
    available: 18,
    safetyStock: 6,
    unit: 'EA',
    unitPriceUSD: 64.0,
    location: 'Warehouse A - Rack 02',
    waitRepairQty: 0,
    transferAvailableQty: 0,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-9',
    partNumber: 'QCFF05121',
    name: 'Diode Pumped Solid State Laser Diode 532nm Green',
    category: 'Laser & Optics',
    department: 'LAMI_LASER',
    inStock: 2,
    allocated: 1,
    available: 1,
    safetyStock: 3,
    unit: 'EA',
    unitPriceUSD: 620.0,
    location: 'Cleanroom Laser Bay 3 - Safe 02',
    waitRepairQty: 1,
    transferAvailableQty: 0,
    status: 'LOW',
  },
  {
    id: 'inv-10',
    partNumber: 'QCAC23740',
    name: 'PTFE Anti-Corrosion Chemical Fluid Line (SA-2203001)',
    category: 'Hose/Tube',
    department: 'CP_SG',
    inStock: 25,
    allocated: 5,
    available: 20,
    safetyStock: 10,
    unit: 'EA',
    unitPriceUSD: 35.0,
    location: 'Chemical Storage Tool Crib - Bin 08',
    waitRepairQty: 0,
    transferAvailableQty: 6,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-11',
    partNumber: 'Q00003',
    name: 'Ultra-Pure Nitrogen Membrane Filter Cartridge 0.01um',
    category: 'Filtration & Fluids',
    department: 'CP_SG',
    inStock: 45,
    allocated: 10,
    available: 35,
    safetyStock: 20,
    unit: 'EA',
    unitPriceUSD: 32.0,
    location: 'Warehouse B - Rack 14',
    waitRepairQty: 0,
    transferAvailableQty: 30,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-12',
    partNumber: 'Q-OPT-4820',
    name: 'Keyence Optical Laser Micro-Edge Sensor (GV-H45)',
    category: 'Sensors & Automation',
    department: 'PO_MODULE_1',
    inStock: 28,
    allocated: 8,
    available: 20,
    safetyStock: 10,
    unit: 'EA',
    unitPriceUSD: 245.0,
    location: 'Warehouse B - Rack 04',
    waitRepairQty: 3,
    transferAvailableQty: 10,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-13',
    partNumber: 'Q-ELC-1044',
    name: 'Omron 24V DC 10A Industrial Power Supply (S8VK-G24024)',
    category: 'Electrical',
    department: 'PO_MODULE_1',
    inStock: 15,
    allocated: 3,
    available: 12,
    safetyStock: 6,
    unit: 'EA',
    unitPriceUSD: 140.0,
    location: 'Warehouse A - Rack 12',
    waitRepairQty: 0,
    transferAvailableQty: 5,
    status: 'OPTIMAL',
  },
  {
    id: 'inv-14',
    partNumber: 'Q-ROB-8831',
    name: 'Hirata SCARA 4-Axis Robot Harmonic Drive Gearbox',
    category: 'Robot Parts',
    department: 'TAB_DIP',
    inStock: 1,
    allocated: 1,
    available: 0,
    safetyStock: 2,
    unit: 'SET',
    unitPriceUSD: 1850.0,
    location: 'Cleanroom Storage B - Shelf 01',
    waitRepairQty: 1,
    transferAvailableQty: 0,
    status: 'CRITICAL',
  }
];

export const InventoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPTIMAL' | 'LOW' | 'CRITICAL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(mockInventory.map(i => i.category)))];

  const filteredItems = mockInventory.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.partNumber.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate Key Inventory Metrics
  const totalStockCount = mockInventory.reduce((acc, curr) => acc + curr.inStock, 0);
  const totalValuationUSD = mockInventory.reduce((acc, curr) => acc + (curr.inStock * curr.unitPriceUSD), 0);
  const lowCount = mockInventory.filter(i => i.status === 'LOW').length;
  const criticalCount = mockInventory.filter(i => i.status === 'CRITICAL').length;
  const waitRepairTotal = mockInventory.reduce((acc, curr) => acc + curr.waitRepairQty, 0);
  const transferAvailableTotal = mockInventory.reduce((acc, curr) => acc + curr.transferAvailableQty, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Plant Inventory & Buffer Stock</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Real-Time Stock Audit
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor shopfloor stock levels, inter-plant transfer availability (WH2), and workshop repair reconditioning pipelines.
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Valuation</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
              ${totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{totalStockCount} units on floor</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Transferable (WH2)</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {transferAvailableTotal} EA
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">$0 PO Strategy Ready</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">In Wait-Repair Bay</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5 font-mono">
              {waitRepairTotal} EA
            </div>
            <div className="text-[10px] text-purple-600/80 mt-0.5">SPR Price Rebuild</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Reorder Warning</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
              {lowCount} Items
            </div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Below Safety Stock</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Critical Shortage</div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 font-mono">
              {criticalCount} Items
            </div>
            <div className="text-[10px] text-rose-600/80 mt-0.5">Zero Buffer on Line</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search and Multi-Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search part #, name, location, department..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL' as const, label: 'All Stock' },
              { id: 'OPTIMAL' as const, label: 'Optimal' },
              { id: 'LOW' as const, label: 'Low Stock' },
              { id: 'CRITICAL' as const, label: 'Critical' },
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

      {/* 4. Master Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 min-w-[120px]">Part Number</th>
                <th className="py-3.5 px-4 min-w-[240px]">Item Description & Specs</th>
                <th className="py-3.5 px-4 min-w-[120px]">Category & Dept</th>
                <th className="py-3.5 px-4 text-center min-w-[150px]">Onhand Breakdown</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Safety Stock</th>
                <th className="py-3.5 px-4 text-right min-w-[100px]">Unit Price</th>
                <th className="py-3.5 px-4 min-w-[160px]">Storage Location</th>
                <th className="py-3.5 px-4 min-w-[140px]">Transfer / Repair</th>
                <th className="py-3.5 px-4 min-w-[100px]">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Part Number */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                      {item.partNumber}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1" title={item.name}>
                      {item.name}
                    </div>
                  </td>

                  {/* Category & Dept */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {item.category}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.department}
                    </div>
                  </td>

                  {/* Onhand Breakdown (Total / Alloc / Avail) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                      <span className="font-bold text-slate-900 dark:text-slate-100" title="Total Onhand">
                        {item.inStock}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">/</span>
                      <span className="text-amber-600 font-semibold" title="Allocated">
                        {item.allocated}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">/</span>
                      <span className="text-emerald-600 font-bold" title="Available">
                        {item.available} {item.unit}
                      </span>
                    </div>
                    <div className="text-[9px] text-center text-slate-400 mt-0.5">
                      (Total / Alloc / Avail)
                    </div>
                  </td>

                  {/* Safety Stock */}
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {item.safetyStock} {item.unit}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${item.unitPriceUSD.toFixed(2)}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {item.location}
                  </td>

                  {/* Transfer / Repair */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-[10px]">
                      {item.transferAvailableQty > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Truck className="w-3 h-3" />
                          <span>WH2: {item.transferAvailableQty} EA</span>
                        </div>
                      ) : (
                        <div className="text-slate-400">No WH2 transfer</div>
                      )}

                      {item.waitRepairQty > 0 && (
                        <div className="flex items-center gap-1 text-purple-600 font-semibold">
                          <Wrench className="w-3 h-3" />
                          <span>Repair: {item.waitRepairQty} EA</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {item.status === 'OPTIMAL' && <Badge variant="success" size="sm">Optimal</Badge>}
                    {item.status === 'LOW' && <Badge variant="warning" size="sm">Low Stock</Badge>}
                    {item.status === 'CRITICAL' && <Badge variant="danger" size="sm">Critical</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
