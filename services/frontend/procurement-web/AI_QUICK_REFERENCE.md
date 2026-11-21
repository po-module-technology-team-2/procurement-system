# AI & DEVELOPER FAST ARCHITECTURE INDEX (`procurement-web`)
> **DO NOT DELETE OR OVERWRITE WITH CODE.**  
> **Purpose**: This file is a high-density, authoritative navigation index designed so that **AI agents and developers DO NOT need to read the entire codebase** before taking action. Read only the single file mapped to your task.

---

## ⚡ 1. FAST ROUTING: "If you need to change X, ONLY read Y"

| Task / Domain | Target File to Read & Edit | Types File | Size / Chunks |
|---|---|---|---|
| **EM No / Equipment Master** | `src/components/views/em-no/` (`EmNoTable.tsx`, `EmNoTree.tsx`, `EmNoModal.tsx`) | `src/types/equipment.ts` | ~60 kB chunk |
| **EM No 14-char Syntax & Generator** | `src/utils/emNoHelper.ts` (`generateEmNo`, `decodeEmNoSyntax`) | `src/types/equipment.ts` | Pure utility (<80 lines) |
| **Personnel Roster (VH / Employees)** | `src/components/views/settings/PersonnelTab.tsx` + `PersonnelModal.tsx` | `src/types/personnel.ts` | Isolated sub-component |
| **Excel / CSV Import for Personnel** | `src/components/views/settings/PersonnelExcelImportModal.tsx` | `src/types/personnel.ts` | Isolated modal |
| **SLA Deadlines, Countdown & Alarms** | `src/utils/slaCalculator.ts` (`calculateSla`) + `settings/SlaPolicyTab.tsx` | `src/types/requisition.ts` | Pure utility (<50 lines) |
| **Demand Reasons (BM, MP, Setup, MC)** | `src/components/views/settings/DemandReasonsTab.tsx` + `DemandReasonModal.tsx` | `src/types/requisition.ts` | Isolated sub-component |
| **Factory Teams & Lines** | `src/components/views/settings/TeamsTab.tsx` | `src/types/personnel.ts` | Isolated sub-component |
| **Q-Code Part Lookup & 10 Interlocks** | `src/components/views/QCodeLookupView.tsx` | `src/types/nexacro.ts` | 136 kB chunk |
| **Purchase Registration Form & Formula**| `src/components/views/PurchaseRegistrationForm.tsx` + `src/utils/mathEvaluator.ts` | `src/types/requisition.ts` | Form component |
| **Requisition Tracker & Reviewer Queue**| `src/components/views/RequisitionsView.tsx` | `src/types/requisition.ts` | 44 kB chunk |
| **Inventory & Buffer Stock** | `src/components/views/InventoryView.tsx` | `src/types/nexacro.ts` | 15 kB chunk |
| **Global State & Persistence** | `src/context/ProcurementContext.tsx` | `src/types/index.ts` | Context store |
| **Top Header & Role/Team Switcher** | `src/components/layout/Header.tsx` | `src/types/navigation.ts` | Layout component |
| **Left Sidebar & View Tabs** | `src/components/layout/Sidebar.tsx` | `src/types/navigation.ts` | Layout component |
| **Lazy Loading & App Shell** | `src/App.tsx` | `src/types/navigation.ts` | Router / Shell |

---

## 🏗️ 2. Modular Directory Structure

```
services/frontend/procurement-web/src/
├── types/                           # 100% Domain-Separated Type System
│   ├── index.ts                     # Re-exports all domains (100% backward compatible)
│   ├── navigation.ts                # NavView, UserRole, UserProfile
│   ├── equipment.ts                 # EmNoRecord, EquipmentStatus, ProcessType, FactoryLineType
│   ├── requisition.ts               # RequisitionItem, RequisitionStatus, Priority, SlaStatus
│   ├── personnel.ts                 # PersonnelMember, PersonnelRole, TeamConfig, LecReviewerConfig
│   └── nexacro.ts                   # NexacroItemInfo, PriceStatusDefinition, InventoryItem
│
├── utils/                           # Pure, Testable Business Utilities (Zero UI Dependencies)
│   ├── slaCalculator.ts             # calculateSla, SLA_HOURS_MAP
│   ├── mathEvaluator.ts             # evaluateMathExpression (text-to-quantity logic)
│   └── emNoHelper.ts                # generateEmNo, decodeEmNoSyntax, badge helpers
│
├── components/
│   ├── common/                      # Reusable atom components (Badge.tsx)
│   ├── layout/                      # Header.tsx, Sidebar.tsx
│   ├── modals/                      # NewRequisitionModal.tsx
│   └── views/                       # Lazy-Loaded Page Views (React.lazy)
│       ├── DashboardView.tsx        # KPI Executive overview
│       ├── InventoryView.tsx        # WH & Buffer stock levels
│       ├── QCodeLookupView.tsx      # Part search & 10-guardrail verification
│       ├── PurchaseRegistrationForm.tsx # Requisition form with CAD schematic
│       ├── RequisitionsView.tsx     # Requisition tracking & 4-Option Decision Matrix
│       │
│       ├── em-no/                   # Modular EM No Master & EBOM Feature
│       │   ├── EmNoStatsHeader.tsx  # KPI cards
│       │   ├── EmNoFilterBar.tsx    # Multi-level cascading filter toolbar
│       │   ├── EmNoTable.tsx        # Enterprise Data Grid with pagination
│       │   ├── EmNoTree.tsx         # EBOM hierarchical tree explorer + detail card
│       │   ├── EmNoDrawer.tsx       # 14-char syntax breakdown inspection sheet
│       │   ├── EmNoModal.tsx        # Add/Edit EM No with 14-char auto generator
│       │   ├── EmNoQuickReqModal.tsx# 1-click requisition launcher from machine
│       │   └── EmNoImportModal.tsx  # CSV/Excel bulk import modal
│       │
│       └── settings/                # Modular System Governance Feature
│           ├── PersonnelTab.tsx     # Personnel roster data grid
│           ├── PersonnelModal.tsx   # Add/Edit employee modal
│           ├── PersonnelExcelImportModal.tsx # Paste from Excel sheet parser
│           ├── DemandReasonsTab.tsx # Custom purchase reason CRUD
│           ├── DemandReasonModal.tsx# Add custom reason modal
│           ├── SlaPolicyTab.tsx     # SLA limits, escalation targets, alarms
│           └── TeamsTab.tsx         # Factory teams & line assignments
│
├── context/
│   ├── ProcurementContext.tsx       # Domain state store with localStorage sync
│   └── ThemeContext.tsx             # Light / Dark theme store
│
├── data/                            # Static Datasets (Extracted from Data.xlsb)
│   ├── emNoMasterData.ts            # Normalized 300+ balanced EM No records
│   ├── equipmentHierarchy.ts        # Machine -> Unit -> Assembly mapping
│   ├── nexacroItems.ts              # 69 Nexacro catalog items with 10 interlocks
│   └── personnelData.ts             # Authentic LG Display personnel roster
│
├── App.tsx                          # AppShell with React.lazy() & Suspense
├── index.css                        # Tailwind directives
└── main.tsx                         # React entry point
```

---

## 📐 3. Core Business Invariants & Data Formats

### A. EM No Record Syntax (14 Characters)
$$\underbrace{\text{HW}}_{1\text{--}2:\text{Factory}} + \underbrace{\text{B}}_{3:\text{Shop}} + \underbrace{\text{MTL}}_{4\text{--}6:\text{Process}} + \underbrace{\text{2}}_{7:\text{Floor}} + \underbrace{\text{1}}_{8:\text{Line (Hex)}} + \underbrace{\text{10}}_{9\text{--}10:\text{Machine}} + \underbrace{\text{11}}_{11\text{--}12:\text{Unit}} + \underbrace{\text{01}}_{13\text{--}14:\text{Assembly/Seq}}$$
* **Factory**: `HW` (Hai Phong Smart Watch Plant)
* **Lines**: `1` through `9`, `A` (Line #201 – Line #210, Line #601, Line #604)
* **Processes**: `POL`, `TAB`, `DIP`, `LT`, `DB`, `BD`

### B. SLA Deadlines
* `BM` (Breakdown Maintenance): **4 Hours** (Critical alert)
* `MC` / `Setup`: **8 – 12 Hours**
* `PD` (Production Demand): **24 Hours**
* `MP` (Periodic PM Overhaul): **48 Hours**

---

## 🛠️ 4. Build & Development Verification
* **Build Command**: `cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && cd /d D:\Projects\Work\ops-workflow\services\frontend\procurement-web && npm.cmd run build"`
* **Code Splitting**: All views are split into isolated chunks `< 200 kB`.
* **Zero Bundle Warnings**: `vite.config.ts` has configured `manualChunks` for `vendor`, `icons`, and view routes.
