# PROJECT_CONTEXT.md — Agent & Developer Quick Reference

> **Purpose**: This file provides an immediate, dense architectural and structural summary of `ops-platform`.
> AI agents and developers should read this single file first to understand project boundaries, ports, schemas, and flows without reading individual source files.

---

## 1. Monorepo Map & Responsibilities

```
ops-platform/
├── .env.example                               # Platform-wide environment template
├── docker-compose.yml                         # Unified multi-service runner
├── start.sh                                   # Local development runner
└── services/
    ├── backend/
    │   ├── ops-workflow/                      # Port 8000 (Python FastAPI, SQLAlchemy, APScheduler)
    │   └── ems-simulation/                    # Port 9000 (Python FastAPI, SQLite, Nexacro XML Mock)
    └── frontend/
        ├── ops-portal/                        # Port 5174 (React 18 + Vite + Tailwind, Operator Console)
        └── procurement-web/                   # Port 5173 (React 18 + Vite + Tailwind, Requisition & EBOM)
```

| Service | Port | Tech Stack | Entry Point | Key Responsibility |
|---|---|---|---|---|
| `backend/ops-workflow` | `8000` | Python 3.11, FastAPI, SQLAlchemy | `src/opsflow/cli.py`, `src/opsflow/api/main.py` | DAG Workflow Engine, EMS Connector, Read-Models, REST API |
| `backend/ems-simulation` | `9000` | Python 3.11, FastAPI, Uvicorn | `src/ems_sim/cli.py`, `src/ems_sim/server/app.py` | Nexacro XML/SSV simulator, equipment/inventory/WIP catalog |
| `frontend/ops-portal` | `5174` | React 18, Vite, Tailwind CSS | `src/main.tsx`, `src/App.tsx` | Operational Telemetry, DAG Visualizer, Run Replayer, DB View |
| `frontend/procurement-web` | `5173` | React 18, Vite, Tailwind CSS | `src/main.tsx`, `src/App.tsx` | 7-Role Procurement Workspace, EBOM Explorer, Cost Overcodes |

---

## 2. Ports & Network Interfaces

| Source | Target | Protocol | Default URL | Description |
|---|---|---|---|---|
| Browser / UI | `ops-portal` | HTTP | `http://localhost:5174` | Operator Dashboard |
| Browser / UI | `procurement-web` | HTTP | `http://localhost:5173` | Procurement Portal |
| `ops-portal` | `ops-workflow` | REST / JSON | `/api/v1` (proxy `http://localhost:8000`) | Trigger runs, fetch logs, inspect DAG |
| `ops-workflow` | `ems-simulation` | Nexacro XML | `http://localhost:9000` | Legacy EMS XML Session & RPC (`.lgdn`, `.do`) |
| External / Alert | `ops-workflow` | Webhook | Outbound HMAC-signed | Event notifications on workflow status changes |

---

## 3. Core Engine Invariants (`ops-workflow`)

1. **Connector Isolation**: `core/` contains generic DAG logic; system-specific code lives strictly in `connectors/` (e.g. `connectors/nexacro/`).
2. **Normalized Data Contract**: All connectors return a standardized payload `{ dataset_id: [...rows] }`.
3. **Execution Pipeline**: `Parser` ➔ `Validator` ➔ `DAG Executor` ➔ `Storage Repository` ➔ `Read Models` ➔ `Webhook Publisher`.
4. **Step Types**: `call` (HTTP/EMS connector), `transform` (expressions/JMESPath), `foreach` (batch iteration), `join` (merge datasets), `approval` (human gate), `db_upsert` (write to read-model tables).

---

## 4. Key Configuration & Environment Variables

| Variable | Default | Service | Description |
|---|---|---|---|
| `OPSFLOW_PORT` | `8000` | `ops-workflow` | Engine REST API port |
| `EMS_SIM_PORT` | `9000` | `ems-simulation` | Simulator HTTP/XML port |
| `OPS_PORTAL_PORT` | `5174` | `ops-portal` | Console portal port |
| `PROCUREMENT_WEB_PORT` | `5173` | `procurement-web` | Procurement web port |
| `OPSFLOW_API_KEY` | `test_api_key` | `ops-workflow` / portal | X-API-Key authentication |
| `EMS_USERNAME` | `658359` | `ops-workflow` | Nexacro login username |
| `EMS_PASSWORD` | `mock_ems_password_sec2026` | `ops-workflow` | Nexacro login password |

---

## 5. Development Shortcuts

- **Start all via Docker**: `docker compose up -d`
- **Start all natively**: `./start.sh`
- **Run Backend Tests**: `cd services/backend/ops-workflow && pytest`
- **Run Simulator Tests**: `cd services/backend/ems-simulation && pytest`
