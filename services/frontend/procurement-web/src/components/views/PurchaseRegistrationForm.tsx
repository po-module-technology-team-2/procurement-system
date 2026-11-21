import React, { useState, useEffect, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { NexacroItemInfo, DemandType, Priority, ProcessType, FactoryLineType } from '../../types';
import { 
  AVAILABLE_MACHINES, 
  getUnitsForMachine, 
  getAssembliesForUnit, 
  getEmNo 
} from '../../data/equipmentHierarchy';
import { 
  PlusCircle, 
  CheckCircle2, 
  Layers, 
  Calculator, 
  Wrench, 
  User, 
  FileText, 
  AlertCircle, 
  X, 
  ArrowRight,
  Maximize2,
  DollarSign,
  Tag,
  Cpu,
  ShieldAlert,
  Compass,
  FileCode,
  Sparkles,
  Info,
  Clock,
  Boxes,
  Lock,
  Check,
  AlertTriangle,
  Calendar,
  Package,
  BookmarkCheck,
  Layers3,
  CheckSquare,
  Square,
  Bell
} from 'lucide-react';

interface PurchaseRegistrationFormProps {
  item: NexacroItemInfo;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// 12 Production Lines as specified
const ALL_FACTORY_LINES: FactoryLineType[] = [
  'Line #201', 'Line #202', 'Line #203', 'Line #204', 'Line #205', 
  'Line #206', 'Line #207', 'Line #208', 'Line #209', 'Line #210', 
  'Line #601', 'Line #604'
];

// Production processes strictly abbreviated: POL | TAB | DIP | LT | DB | BD
const PROCESS_ABBREVIATIONS: ProcessType[] = ['POL', 'TAB', 'DIP', 'LT', 'DB', 'BD'];

// Safe math expression evaluator for logic text
function evaluateMathExpression(text: string): number | null {
  try {
    const sanitized = text
      .replace(/[^0-9+\-*/().]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');

    if (!sanitized) return null;

    const tokens = sanitized.split(' ').filter(Boolean);
    const mathExpr = tokens.join('');
    if (!/^[0-9+\-*/().]+$/.test(mathExpr)) return null;

    const result = new Function(`'use strict'; return (${mathExpr})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.max(1, Math.round(result));
    }
  } catch {
    return null;
  }
  return null;
}

export const PurchaseRegistrationForm: React.FC<PurchaseRegistrationFormProps> = ({ 
  item, 
  onSuccess, 
  onCancel 
}) => {
  const { 
    addRequisition, 
    currentTeam, 
    currentRole, 
    currentProcess, 
    currentUser, 
    demandReasons,
    registerEbomLink 
  } = useProcurement();

  // 1. Substitute Part Code (Nếu load từ hệ thống EMS không có => cho phép tự đăng ký code thay thế)
  const hasEmsSubstitute = Boolean(item.ci_code || item.eol_replacement_code || item.duplicate_code);
  const [substituteType, setSubstituteType] = useState<'CI' | 'EOL' | 'DUP' | 'CUSTOM'>(
    item.ci_code ? 'CI' : item.eol_replacement_code ? 'EOL' : 'CUSTOM'
  );
  const [customSubstituteCode, setCustomSubstituteCode] = useState(
    item.ci_code || item.eol_replacement_code || ''
  );
  const [substituteReason, setSubstituteReason] = useState(
    hasEmsSubstitute 
      ? 'Mapped via EMS standardization protocol'
      : 'Registered alternative substitute part due to empty EMS mapping'
  );

  // 2. Part Custom Name & Naming Justification (Hệ thống không có thông tin này)
  const [customPartName, setCustomPartName] = useState(item.description);
  const [namingJustification, setNamingJustification] = useState(
    'Tên part chuẩn hóa theo tài liệu bảo trì và vị trí cơ khí xưởng'
  );

  // 3. Requestor Identity - Tự tạo từ currentUser, KHÔNG CHO NGƯỜI DÙNG NHẬP (Locked Read-only)
  const lockedCreatorId = currentUser.employeeId;
  const lockedCreatorName = currentUser.name;
  const lockedDept = currentUser.teamLabel || 'PO Module Technology Team 2';

  // 4. Process (Viết tắt: POL, TAB, DIP, LT, DB, BD)
  const [processStep, setProcessStep] = useState<ProcessType>(currentProcess || 'DB');

  // 5. Line Selection (Có thể chọn nhiều line: #201 ~ #210, #601, #604)
  const [selectedLines, setSelectedLines] = useState<FactoryLineType[]>(['Line #204']);

  const toggleLine = (line: FactoryLineType) => {
    setSelectedLines(prev => {
      if (prev.includes(line)) {
        if (prev.length === 1) return prev; // Keep at least one line selected
        return prev.filter(l => l !== line);
      } else {
        return [...prev, line];
      }
    });
  };

  const handleSelectAllLines = () => setSelectedLines([...ALL_FACTORY_LINES]);
  const handleResetLines = () => setSelectedLines(['Line #204']);

  // 6. Hierarchy: Machine => Unit => Assembly (Extracted from Data.xlsb Sheet 1)
  const [machineName, setMachineName] = useState<string>(AVAILABLE_MACHINES[0] || 'COF BONDER');
  const availableUnits = useMemo(() => getUnitsForMachine(machineName), [machineName]);
  const [ebomUnitCode, setEbomUnitCode] = useState<string>('MAIN BONDING');
  const availableAssemblies = useMemo(() => getAssembliesForUnit(machineName, ebomUnitCode), [machineName, ebomUnitCode]);
  const [ebomAssemblyCode, setEbomAssemblyCode] = useState<string>('HEAD 1');
  const [ebomEmNo, setEbomEmNo] = useState<string>(() => getEmNo(machineName, 'MAIN BONDING', 'HEAD 1'));
  const [ebomMechanism, setEbomMechanism] = useState('Bonding Head Vacuum Arm Assembly');
  const [ebomPartLevel, setEbomPartLevel] = useState('Level 3 (Component Spare)');
  const [ebomLifespan, setEbomLifespan] = useState('6 months / 50,000 cycles');
  const [ebomDrawingNo, setEbomDrawingNo] = useState(`DWG-${item.model || item.item_code}-V2`);
  const [isEbomRegistered, setIsEbomRegistered] = useState(false);
  const [ebomFeedbackToast, setEbomFeedbackToast] = useState<string | null>(null);

  // Sync unit when machine changes
  useEffect(() => {
    if (availableUnits.length > 0 && !availableUnits.includes(ebomUnitCode)) {
      setEbomUnitCode(availableUnits[0]);
    }
  }, [availableUnits, ebomUnitCode]);

  // Sync assembly when unit changes
  useEffect(() => {
    if (availableAssemblies.length > 0 && !availableAssemblies.includes(ebomAssemblyCode)) {
      setEbomAssemblyCode(availableAssemblies[0]);
    }
  }, [availableAssemblies, ebomAssemblyCode]);

  // Sync EM No dynamically based on Sheet 1 mapping
  useEffect(() => {
    const computedEm = getEmNo(machineName, ebomUnitCode, ebomAssemblyCode);
    setEbomEmNo(computedEm);
  }, [machineName, ebomUnitCode, ebomAssemblyCode]);

  // 7. Packaging & Order Parameters: MOQ, MPQ, SPQ, Safety Stock, Purchase Cycle
  const [moq, setMoq] = useState<number>(item.min_order_qty || 1);
  const [mpq, setMpq] = useState<number>(10);
  const [spq, setSpq] = useState<number>(5);
  const [safetyStock, setSafetyStock] = useState<number>(5);
  const [purchaseCycle, setPurchaseCycle] = useState<string>('NONE');
  const [customCycleDays, setCustomCycleDays] = useState<number>(30);

  // Check if safety stock is breached
  const isSafetyStockBreached = item.available_qty < safetyStock;

  // 8. Demand Classification & SLA Limits (Chỉ ghi lý do viết tắt: BM, MP, Setup, MC, Setup/MC, PD)
  const [demandType, setDemandType] = useState<DemandType>('Setup/MC');
  const [urgencyLevel, setUrgencyLevel] = useState<Priority>('HIGH');

  // Dynamic SLA Preview based on Settings
  const matchedReason = demandReasons.find(r => r.code === demandType);
  const slaHoursPreview = matchedReason ? matchedReason.slaHours : (demandType === 'BM' ? 4 : demandType === 'Setup/MC' ? 12 : demandType === 'PD' ? 24 : 48);

  // 9. Problem Description & Current Line Situation
  const [problemDescription, setProblemDescription] = useState(
    item.interlock_disuse 
      ? 'Manufacturer EOL: Model discontinued by maker. Substitute component required for continuous line run.'
      : item.interlock_stop_po 
      ? 'Stop PO flagged by EMS policy: Special technical clearance requested for new setup conversion.'
      : 'Mechanical wear and optical sensor drift detected during shift equipment inspection.'
  );
  const [currentSituation, setCurrentSituation] = useState(
    item.interlock_stop_po 
      ? 'Line operating at standard speed; peer unit transfer in progress pending logistics confirmation.'
      : 'Production active on line; buffer stock is depleted below safety stock minimum threshold.'
  );

  // 10. Quantity Calculation Logic Formula (Text-to-Quantity)
  const [logicText, setLogicText] = useState('2 machines * 3 heads * 2 shifts');
  const [quantity, setQuantity] = useState<number>(12);

  // Blueprint graphic mode tab
  const [blueprintView, setBlueprintView] = useState<'CAD' | 'SPECS' | 'DIMENSIONS'>('CAD');

  // Dynamic formula recalculation
  useEffect(() => {
    const computed = evaluateMathExpression(logicText);
    if (computed !== null && computed > 0) {
      setQuantity(computed);
    }
  }, [logicText]);

  const getActiveSubstituteCode = (): string => {
    if (substituteType === 'CI') return item.ci_code || customSubstituteCode || item.item_code;
    if (substituteType === 'EOL') return item.eol_replacement_code || customSubstituteCode || item.item_code;
    if (substituteType === 'DUP') return item.duplicate_code || customSubstituteCode || item.item_code;
    return customSubstituteCode || item.item_code;
  };

  const estimatedTotalCost = (item.unit_price_sp * quantity);

  // Handler for EBOM Registration button
  const handleRegisterEbom = () => {
    registerEbomLink(ebomEmNo, item.item_code, {
      machine: machineName,
      unit: ebomUnitCode,
      assembly: ebomAssemblyCode,
      customName: customPartName.trim() || item.description
    });
    setIsEbomRegistered(true);
    setEbomFeedbackToast(`Đã đăng ký và liên kết ${item.item_code} vào EBOM Master (${ebomEmNo}) thành công!`);
    setTimeout(() => setEbomFeedbackToast(null), 4500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subCode = getActiveSubstituteCode();
    const isBlocked = item.interlock_stop_po;

    addRequisition({
      code: item.item_code,
      itemCode: item.item_code,
      title: customPartName.trim() || item.description,
      category: item.catalog_group || 'Spare Parts',
      quantity: Number(quantity) || 1,
      unit: item.uom || 'EA',
      estimatedPrice: item.unit_price_sp || 50.0,
      currency: 'USD',
      status: isBlocked ? 'REJECTED' : 'SUBMITTED',
      priority: (demandType === 'BM' ? 'URGENT' : demandType === 'PD' ? 'HIGH' : urgencyLevel) as Priority,
      department: lockedDept,
      requestorEmployeeId: lockedCreatorId,
      requestorName: lockedCreatorName,
      requestedBy: `${lockedCreatorId} (${lockedCreatorName})`,
      notes: `[Demand: ${demandType}] [Lines: ${selectedLines.join(', ')}] [Machine: ${machineName}] [Formula: ${logicText}] ${problemDescription}`,

      // Extended fields
      customName: customPartName,
      customNameReason: namingJustification,
      substituteCode: subCode,
      substituteType,
      substituteReason,
      processStep,
      machineName,
      machineLine: selectedLines[0] || 'Line #204',
      machineLines: selectedLines,
      ebomUnitCode,
      ebomAssemblyCode,
      ebomMechanism,
      ebomEmNo,
      ebomPartLevel,
      ebomLifespan,
      ebomDrawingNo,
      ebomRegistered: isEbomRegistered,
      
      // Order limits & packaging
      moq,
      mpq,
      spq,
      safetyStock,
      purchaseCycle: purchaseCycle === 'CUSTOM_DAYS' ? `CUSTOM_${customCycleDays}_DAYS` : purchaseCycle,

      demandType,
      urgencyLevel,
      problemDescription,
      currentSituation,
      quantityLogicText: logicText,
    });

    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full overflow-hidden bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/70 rounded-2xl p-5 sm:p-6 shadow-lg space-y-6 animate-fadeIn">
      {/* 1. Header & Requisition Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Đăng Ký Nhu Cầu Mua (Purchase Registration)</span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                {item.item_code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>SLA Phản Hồi: {slaHoursPreview}h</span>
              </span>
              {isEbomRegistered && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>EBOM Linked</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đăng ký thông tin mua vật tư với danh tính tự động khóa, hỗ trợ đa line, MOQ/SPQ/MPQ, chu kỳ mua và liên kết EBOM Master.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* EBOM Success Feedback Alert */}
      {ebomFeedbackToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{ebomFeedbackToast}</span>
          </div>
          <button type="button" onClick={() => setEbomFeedbackToast(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* Safety Stock Breached Warning Banner */}
      {isSafetyStockBreached && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 text-xs animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <div className="font-bold flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wide">⚠️ Cảnh báo tồn an toàn: Yêu cầu tiến hành đăng ký mua ngay</span>
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                Tồn khả dụng: {item.available_qty} {item.uom} &lt; Tồn an toàn: {safetyStock} {item.uom}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              Số lượng tồn kho khả dụng hiện tại đang thấp hơn mức tồn an toàn đăng ký ({safetyStock} {item.uom}). Hệ thống khuyến nghị phê duyệt mua khẩn cấp để đảm bảo ổn định sản xuất.
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full">
        {/* Left Column (5 cols): CAD Blueprint, Code Tương Tự Thay Thế, Financial Summary */}
        <div className="lg:col-span-5 space-y-5 min-w-0">
          {/* A. CAD Blueprint Schematic & Dimensions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <span>Bản Vẽ & Thông Số Kỹ Thuật (CAD)</span>
              </label>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                {(['CAD', 'DIMENSIONS', 'SPECS'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBlueprintView(v)}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${
                      blueprintView === v ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing Display Box */}
            <div className="w-full h-52 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner group">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
              
              {blueprintView === 'CAD' && (
                <>
                  <svg className="w-52 h-32 text-blue-400/80 z-10" viewBox="0 0 160 110" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="15" y="15" width="130" height="80" rx="8" strokeDasharray="4 2" />
                    <circle cx="80" cy="55" r="28" stroke="currentColor" />
                    <circle cx="80" cy="55" r="16" fill="currentColor" fillOpacity="0.2" />
                    <line x1="80" y1="5" x2="80" y2="105" strokeDasharray="2 2" stroke="#38bdf8" />
                    <line x1="5" y1="55" x2="155" y2="55" strokeDasharray="2 2" stroke="#38bdf8" />
                    <rect x="25" y="25" width="22" height="22" rx="4" fill="currentColor" fillOpacity="0.1" />
                    <rect x="113" y="63" width="22" height="22" rx="4" fill="currentColor" fillOpacity="0.1" />
                    <text x="80" y="58" textAnchor="middle" fill="#60a5fa" fontSize="7" fontFamily="monospace">Precision Bore: 7.0mm</text>
                    <text x="36" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">M4 Pitch</text>
                    <text x="124" y="76" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">M4 Pitch</text>
                  </svg>
                  <div className="text-center z-10 mt-1">
                    <span className="font-mono text-xs font-bold text-white block truncate">
                      {item.model || item.item_code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                      Drawing No: {ebomDrawingNo} • Đơn vị: {item.uom}
                    </span>
                  </div>
                </>
              )}

              {blueprintView === 'DIMENSIONS' && (
                <div className="z-10 text-xs text-slate-300 w-full px-4 space-y-1.5 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Outer Envelope:</span>
                    <span className="font-bold text-blue-400">130.0 × 80.0 × 45.0 mm</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Vacuum Bore:</span>
                    <span className="font-bold text-blue-400">Ø 7.00 ± 0.02 mm</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Mounting Pitch:</span>
                    <span className="font-bold text-blue-400">4-M4 × P0.7 (Pitch 35mm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Weight:</span>
                    <span className="font-bold text-slate-200">240g (Alloy 7075)</span>
                  </div>
                </div>
              )}

              {blueprintView === 'SPECS' && (
                <div className="z-10 text-xs text-slate-300 w-full px-4 space-y-1.5 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Catalog Group:</span>
                    <span className="font-bold text-blue-400">{item.catalog_group}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Maker:</span>
                    <span className="font-bold text-slate-200">{item.maker || 'SMC OEM'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Pressure Rating:</span>
                    <span className="font-bold text-blue-400">0.2 - 0.85 MPa (CDA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cleanroom Class:</span>
                    <span className="font-bold text-amber-400">ISO Class 6 Compatible</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* B. Code Tương Tự Có Thể Thay Thế (Hỗ trợ load từ EMS hoặc tự nhập nếu EMS không có) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span>Code Tương Tự Thay Thế (Substitute Part)</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasEmsSubstitute 
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {hasEmsSubstitute ? 'Đã load từ EMS' : 'EMS chưa có dữ liệu'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSubstituteType('CI')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  substituteType === 'CI'
                    ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold">1. CI Code (EMS)</div>
                <div className="font-mono font-bold mt-0.5 truncate">{item.ci_code || 'Không có'}</div>
              </button>

              <button
                type="button"
                onClick={() => setSubstituteType('EOL')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  substituteType === 'EOL'
                    ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold">2. EOL Thay Thế</div>
                <div className="font-mono font-bold mt-0.5 truncate">{item.eol_replacement_code || 'Không có'}</div>
              </button>

              <button
                type="button"
                onClick={() => setSubstituteType('DUP')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  substituteType === 'DUP'
                    ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold">3. Duplicate Code</div>
                <div className="font-mono font-bold mt-0.5 truncate">{item.duplicate_code || 'Không có'}</div>
              </button>

              <button
                type="button"
                onClick={() => setSubstituteType('CUSTOM')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  substituteType === 'CUSTOM'
                    ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold">4. Tự Đăng Ký Code</div>
                <div className="font-mono font-bold mt-0.5 truncate">Nhập thủ công</div>
              </button>
            </div>

            {/* Direct Input for Alternative / Substitute Code if not in EMS or custom */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Mã Code Tương Tự Đăng Ký Thay Thế *
                </label>
                <input
                  type="text"
                  required
                  value={customSubstituteCode}
                  onChange={(e) => setCustomSubstituteCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã code tương tự (ví dụ: QCAB99881)..."
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Lý Do / Căn Cứ Chọn Code Thay Thế
                </label>
                <input
                  type="text"
                  value={substituteReason}
                  onChange={(e) => setSubstituteReason(e.target.value)}
                  placeholder="Cùng thông số điện/cơ khí, lắp đặt tương đương..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* C. Financial Commitment Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Đơn Giá SP (Unit Price):</span>
              <span className="font-mono font-bold">${item.unit_price_sp.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số Lượng Đăng Ký:</span>
              <span className="font-mono font-bold text-blue-600">{quantity} {item.uom}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold">Tổng Dự Toán Đơn Hàng:</span>
              <span className="font-mono font-bold text-base text-emerald-600">
                ${estimatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Identity (Locked), Multi-Line, Process, Hierarchy, EBOM Button, Packaging & Cycles */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* A. Requestor Identity Card - TỰ TẠO KHÔNG CHO NGƯỜI DÙNG NHẬP (Locked to Session) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Requestor Identity (Định Danh Người Yêu Cầu)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Tự động khóa / Không sửa</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">Employee ID</div>
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                  {lockedCreatorId}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">Họ và Tên</div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {lockedCreatorName}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">Bộ Phận / Đội</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={lockedDept}>
                  {lockedDept}
                </div>
              </div>
            </div>
          </div>

          {/* B. Process (Viết tắt) & Multi-Line Selection (Có thể chọn nhiều line) */}
          <div className="space-y-3">
            {/* Process Abbreviation Chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Process (Công đoạn - Viết tắt) *
                </label>
                <span className="text-[10px] text-slate-400">Chọn 1 công đoạn</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PROCESS_ABBREVIATIONS.map((proc) => (
                  <button
                    key={proc}
                    type="button"
                    onClick={() => setProcessStep(proc)}
                    className={`py-2 px-1 text-center font-mono font-bold text-xs rounded-xl border transition-all ${
                      processStep === proc
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {proc}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Line Selection */}
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Factory Lines (Có thể chọn nhiều line) *</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Đã chọn: {selectedLines.length} line
                  </span>
                </label>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllLines}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Chọn tất cả (12 line)
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handleResetLines}
                    className="text-[11px] text-slate-500 hover:underline"
                  >
                    Mặc định (Line #204)
                  </button>
                </div>
              </div>

              {/* 12-Line Toggle Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                {ALL_FACTORY_LINES.map((line) => {
                  const isSelected = selectedLines.includes(line);
                  return (
                    <button
                      key={line}
                      type="button"
                      onClick={() => toggleLine(line)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{line.replace('Line #', '#')}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 font-mono truncate">
                Chuyền áp dụng: {selectedLines.join(', ')}
              </div>
            </div>
          </div>

          {/* C. Equipment Hierarchy & Dedicated Nút "Đăng ký EBOM" */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-indigo-500" />
                <span>Cấu Trúc Thiết Bị & Nút Đăng Ký EBOM</span>
              </span>

              {/* Nút Đăng Ký EBOM */}
              <button
                type="button"
                onClick={handleRegisterEbom}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isEbomRegistered
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
                title="Đăng ký liên kết part code vào sơ đồ EBOM Master"
              >
                {isEbomRegistered ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Đã Đăng Ký EBOM</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Đăng Ký EBOM</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Level 1: Machine */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  1. Machine Name *
                </label>
                <select
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold outline-none text-xs"
                >
                  {AVAILABLE_MACHINES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Level 2: Unit */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  2. Unit Section *
                </label>
                <select
                  value={ebomUnitCode}
                  onChange={(e) => setEbomUnitCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none text-xs"
                >
                  {availableUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Level 3: Assembly */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  3. Assembly Component *
                </label>
                <select
                  value={ebomAssemblyCode}
                  onChange={(e) => setEbomAssemblyCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none text-xs"
                >
                  {availableAssemblies.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  EM Number (14 Chars Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  value={ebomEmNo}
                  onChange={(e) => setEbomEmNo(e.target.value.toUpperCase())}
                  placeholder="HWBMTL21EC0101"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Mechanism Name
                </label>
                <input
                  type="text"
                  value={ebomMechanism}
                  onChange={(e) => setEbomMechanism(e.target.value)}
                  placeholder="e.g. Vacuum Pickup Head Carriage"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* D. Đăng ký thông tin mở rộng: Tên (hệ thống không có thông tin này) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Tên Part Tại Xưởng / Line (Hệ thống chưa có) *
              </label>
              <input
                type="text"
                required
                value={customPartName}
                onChange={(e) => setCustomPartName(e.target.value)}
                placeholder="Nhập tên gọi thực tế tại xưởng..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Căn Cứ Đặt Tên / Naming Justification *
              </label>
              <input
                type="text"
                required
                value={namingJustification}
                onChange={(e) => setNamingJustification(e.target.value)}
                placeholder="Lý do đặt tên theo line/vị trí..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* E. Đăng ký MOQ, SPQ, MPQ, Số Lượng Tồn An Toàn & Chu Kỳ Mua */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <span>Đăng Ký Đóng Gói (MPQ / SPQ), Tồn An Toàn & Chu Kỳ Mua</span>
            </div>

            {/* 4 Quantitative Inputs: MOQ, SPQ, MPQ, Safety Stock */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1" title="Minimum Order Quantity">
                  MOQ (Mua tối thiểu) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={moq}
                  onChange={(e) => setMoq(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1" title="Standard Package Quantity">
                  SPQ (Gói tiêu chuẩn) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={spq}
                  onChange={(e) => setSpq(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1" title="Master Package Quantity">
                  MPQ (Kiện đóng gói) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={mpq}
                  onChange={(e) => setMpq(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block mb-1" title="Mức tồn an toàn tối thiểu cảnh báo mua">
                  Tồn An Toàn (Safety) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Periodic Purchase Cycle Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs items-center">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Đăng Ký Mua Theo Chu Kỳ *
                </label>
                <select
                  value={purchaseCycle}
                  onChange={(e) => setPurchaseCycle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none text-xs"
                >
                  <option value="NONE">Theo phát sinh (On-Demand / Non-periodic)</option>
                  <option value="WEEKLY">Hàng tuần (Weekly)</option>
                  <option value="BIWEEKLY">2 tuần / lần (Bi-weekly)</option>
                  <option value="MONTHLY">Hàng tháng (Monthly)</option>
                  <option value="QUARTERLY">Hàng quý (Quarterly)</option>
                  <option value="CUSTOM_DAYS">Tùy chọn số ngày (Custom Cycle)</option>
                </select>
              </div>

              {purchaseCycle === 'CUSTOM_DAYS' ? (
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Chu kỳ tùy chọn (Số ngày)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customCycleDays}
                    onChange={(e) => setCustomCycleDays(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="30"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs outline-none"
                  />
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  {purchaseCycle === 'NONE' 
                    ? 'Chỉ tạo yêu cầu mua khi phát sinh nhu cầu bảo trì hoặc hỏng hóc đột xuất.'
                    : `Hệ thống sẽ nhắc nhở và tự động lập kế hoạch bổ sung vật tư định kỳ.`}
                </div>
              )}
            </div>
          </div>

          {/* F. Demand Classification (Chỉ ghi lý do viết tắt) & SLA Limits (Chỉ cảnh báo Leader nếu quá hạn) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Demand Classification (Lý do viết tắt) *
              </label>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Max SLA: {slaHoursPreview}h
              </span>
            </div>

            {/* Abbreviation-only Reason Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              {demandReasons.map((t) => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setDemandType(t.code as DemandType)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    demandType === t.code
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                  title={`${t.code}: ${t.label} (${t.slaHours}h SLA)`}
                >
                  <div className="font-mono font-bold text-xs">{t.code}</div>
                  <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                    {t.slaHours}h SLA
                  </div>
                </button>
              ))}
            </div>

            {/* SLA Escalation Callout Notice */}
            <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-start gap-2 text-xs text-purple-900 dark:text-purple-200">
              <Bell className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-bold">Chính sách SLA Limits: </span>
                <span>Hệ thống chỉ gửi thông báo cảnh báo leo thang (Escalation Alert) cho <strong>Part Leader / Team Leader</strong> nếu thời gian xử lý vượt quá hạn định ({slaHoursPreview}h).</span>
              </div>
            </div>
          </div>

          {/* G. Problem & Current Situation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Mô Tả Lỗi / Triệu Chứng Sự Cố *
              </label>
              <textarea
                rows={2}
                required
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Tình Trạng Chuyền & Tồn Buffer *
              </label>
              <textarea
                rows={2}
                required
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none resize-none"
              />
            </div>
          </div>

          {/* H. Quantity Formula Logic */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-950 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Công Thức Tính Số Lượng (Formula Logic)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-3 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                Tính toán: {quantity} {item.uom}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={logicText}
                  onChange={(e) => setLogicText(e.target.value)}
                  placeholder="e.g. 2 machines * 3 heads * 2 shifts"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-center rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* I. Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegisterEbom}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                  isEbomRegistered
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                }`}
              >
                <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isEbomRegistered ? 'Đã liên kết EBOM' : 'Đăng ký EBOM'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Đóng
                </button>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg transition-all"
              >
                <span>Xác Nhận Đăng Ký Mua ({quantity} {item.uom})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
