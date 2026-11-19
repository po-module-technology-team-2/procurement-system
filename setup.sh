#!/usr/bin/env bash
# ==============================================================================
# Ops Platform - Setup Script (Linux / macOS / WSL)
# Automated environment setup for new machines
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "================================================================"
echo "    OPS PLATFORM - AUTOMATED ENVIRONMENT SETUP                 "
echo "================================================================"
echo -e "${NC}"

# 1. Check Node.js and npm
echo -e "${BLUE}[1/5] Checking Node.js and npm...${NC}"
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Node.js is not installed. Please install Node.js 18+.${NC}"
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] npm is not installed.${NC}"
  exit 1
fi
echo -e "  [${GREEN}OK${NC}] Node: $(node -v), npm: $(npm -v)"

# 2. Check Python 3.11+
echo -e "${BLUE}[2/5] Checking Python 3.11+...${NC}"
PYTHON_BIN=""
for py in python3 python python3.12 python3.11; do
  if command -v "$py" >/dev/null 2>&1; then
    VER=$("$py" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || true)
    if [[ "$VER" =~ ^3\.(1[1-9]|[2-9][0-9])$ ]]; then
      PYTHON_BIN="$py"
      break
    fi
  fi
done

if [[ -z "$PYTHON_BIN" ]]; then
  echo -e "${RED}[ERROR] Compatible Python (>= 3.11) not found.${NC}"
  echo "Please install Python 3.11 or Python 3.12."
  exit 1
fi
echo -e "  [${GREEN}OK${NC}] Python interpreter: $($PYTHON_BIN --version) ($PYTHON_BIN)"

# 3. Environment configuration
echo -e "${BLUE}[3/5] Setting up environment configuration...${NC}"
if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
    echo -e "  [${GREEN}OK${NC}] Created .env from .env.example"
  fi
else
  echo -e "  [${GREEN}OK${NC}] .env file already exists."
fi
mkdir -p logs

# 4. Backend services
echo -e "${BLUE}[4/5] Setting up backend virtual environments...${NC}"

# 4.1 EMS Simulation
EMS_DIR="$SCRIPT_DIR/services/backend/ems-simulation"
EMS_VENV="$EMS_DIR/.venv"
echo -e "  -> Setting up services/backend/ems-simulation"
if [[ ! -d "$EMS_VENV" ]]; then
  "$PYTHON_BIN" -m venv "$EMS_VENV"
fi
"$EMS_VENV/bin/python" -m pip install --upgrade pip --quiet
"$EMS_VENV/bin/python" -m pip install --default-timeout=100 -e "$EMS_DIR" --quiet
echo -e "  [${GREEN}OK${NC}] ems-simulation ready"

# 4.2 Opsflow Engine
ENGINE_DIR="$SCRIPT_DIR/services/backend/ops-workflow"
ENGINE_VENV="$ENGINE_DIR/.venv"
echo -e "  -> Setting up services/backend/ops-workflow"
if [[ ! -d "$ENGINE_VENV" ]]; then
  "$PYTHON_BIN" -m venv "$ENGINE_VENV"
fi
"$ENGINE_VENV/bin/python" -m pip install --upgrade pip --quiet
"$ENGINE_VENV/bin/python" -m pip install --default-timeout=100 -e "$ENGINE_DIR" --quiet
echo -e "  [${GREEN}OK${NC}] ops-workflow ready"

# 5. Frontend services
echo -e "${BLUE}[5/5] Installing frontend dependencies...${NC}"
PORTAL_DIR="$SCRIPT_DIR/services/frontend/ops-portal"
echo -e "  -> Setting up services/frontend/ops-portal"
(cd "$PORTAL_DIR" && npm install --no-audit --no-fund)
echo -e "  [${GREEN}OK${NC}] ops-portal ready"

PROC_DIR="$SCRIPT_DIR/services/frontend/procurement-web"
echo -e "  -> Setting up services/frontend/procurement-web"
(cd "$PROC_DIR" && npm install --no-audit --no-fund)
echo -e "  [${GREEN}OK${NC}] procurement-web ready"

chmod +x "$SCRIPT_DIR/start.sh" "$SCRIPT_DIR/setup.sh" 2>/dev/null || true

echo -e "\n${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}             SETUP COMPLETED SUCCESSFULLY!                      ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "To start all 4 services, run:"
echo -e "  ${CYAN}./start.sh${NC}"
echo -e "================================================================\n"
