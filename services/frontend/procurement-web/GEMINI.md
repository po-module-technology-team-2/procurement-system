# PROCUREMENT-WEB: ENTERPRISE SYSTEM CACHE & ARCHITECTURE RULES
> **Auto-loaded by Antigravity on every turn. DO NOT DELETE.**

---

## 1. Quick Environment & Execution Rules
* **Project**: `procurement-web` (React 18 + Vite + TypeScript + Tailwind CSS)
* **Path**: `D:\Projects\Work\ops-workflow\services\frontend\procurement-web`
* **Dev Server**: Vite active on `http://localhost:5173/` (Port `5173`)
* **Shell Command Prefix**: In Windows PowerShell, Node.js is located at `C:\Program Files\nodejs`. Always prefix shell commands with:
  `cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && cd /d D:\Projects\Work\ops-workflow\services\frontend\procurement-web && <command>"`
* **Language Constraints**:
  - `src/` (Code, UI labels, tooltips, mock data, comments): **STRICTLY 100% ENGLISH** (0 Vietnamese characters allowed).
  - Conversations with the user: **Vietnamese**.
  - Architecture & reference docs: **English or Vietnamese**.
* **Offline Requirement**: 100% static bundle; zero external CDN calls or external auth dependencies.

---

## 2. Standard Factory Topology & Domain Taxonomy
* **Processes (6 Core Stages)**:
  `POL` (Polarizer Attachment) | `TAB` (Tape Automated Bonding) | `DIP` (Package Bonding) | `LT` (Laser Trimming & Lamination) | `DB` (Die Bonding) | `BD` (Wire/Ball Bonding)
* **Factory Lines (12 Lines)**:
  `Line #201`, `Line #202`, `Line #203`, `Line #204`, `Line #205`, `Line #206`, `Line #207`, `Line #208`, `Line #209`, `Line #210`, `Line #601`, `Line #604`
* **Equipment Hierarchy (Strict Order)**:
  $$\text{Machine Name \& Line} \;\Longrightarrow\; \text{Unit Code \& Name} \;\Longrightarrow\; \text{Assembly Code \& Name}$$
  * Accompanied by **14-character EM Number** (e.g., `HWBMTL21EC0101`).
* **Factory Teams**:
  - Primary Team: `PO Module Technology Team 2` (Key: `PO_MODULE_2`, Cleanroom B L3)
  - Other Teams: `PO_MODULE_1`, `TAB_DIP`, `LAMI_LASER`, `CP_SG`

---

## 3. SLA Maximum Response Deadlines & Configurable Reasons (Settings Portal)
* **Ma trận thời hạn phản hồi SLA & Lý do**:
  - `BM` (Breakdown Maintenance / Line Stoppage): **4 Hours Max** (Critical countdown)
  - `Setup/MC` (Machine Conversion / Tooling): **12 Hours Max**
  - `PD` (Production Volume Surge Buffer): **24 Hours Max**
  - `MP` (Periodic PM Overhaul): **48 Hours Max**
  - Custom reasons supported via Settings (`SettingsView.tsx` Tab 1).
* **Trạng thái vi phạm SLA**:
  - `ON_TIME`: Safe window
  - `NEAR_BREACH`: < 2 Hours remaining (Yellow warning)
  - `BREACHED`: Overdue (< 0 Hours, Red alert with elapsed hour counter)
* **Persistence Keys in `localStorage`**:
  - `ops_procurement_demand_reasons`
  - `ops_procurement_teams_list`
  - `ops_procurement_lec_reviewers`
  - `ops_procurement_active_reviewer_id`
  - `ops_procurement_policy_settings`

---

## 4. Role Personas & Identity Binding
* **REQUESTOR (Shopfloor Line Engineer)**:
  - Identity: `EMP-882104` — **David Kim** | Team: `PO Module Technology Team 2`
  - Core Views: `QCodeLookupView` (Verify parts, 10 interlocks, accordion registration) & `RequisitionsView` (Track SLA).
* **APPROVER / LEC (Line Equipment Controller & Technical Reviewer)**:
  - Active Reviewer: `EMP-771022` — **Sarah Jenkins** (Chief LEC Technical Reviewer, $25,000 USD limit)
  - Reviewer Pool: `EMP-660193` (Marcus Vance), `EMP-552910` (Kenji Sato), `EMP-441829` (Elena Rostova)
  - Core Views: `RequisitionsView` (4-Option Decision Matrix: Purchase New, WH2 Transfer, Workshop Repair, CI Substitute; partial quantity approvals; feedback loop).

---

## 5. Component Index & Responsibilities
* `src/types/index.ts`: Core type definitions (`DemandReasonConfig`, `TeamConfig`, `LecReviewerConfig`, `PolicySettings`, `RequisitionItem`, `SlaStatus`).
* `src/context/ProcurementContext.tsx`: Central state, dynamic SLA calculator (`calculateSla`), localStorage sync, role/team/process switcher.
* `src/components/views/QCodeLookupView.tsx`: Batch Q-Code parser, non-overflow responsive table (`min-w-[1020px]`), 10-guardrail badges, accordion form embedding.
* `src/components/views/PurchaseRegistrationForm.tsx`: Component registration form, CAD blueprint viewer, text formula to quantity calculator (`evaluateMathExpression`), dynamic SLA preview.
* `src/components/views/RequisitionsView.tsx`: Progress tracker, live SLA countdown, 4-Option Decision Matrix drawer, 2-way real-time feedback thread.
* `src/components/views/SettingsView.tsx`: 5 governance tabs (SLA & Reasons, Factory Teams, LEC Reviewers, 10-Interlocks, Identity simulation).
* `src/components/layout/Header.tsx` & `Sidebar.tsx`: Navigation bar with role-adaptive views and employee badge.
