<#
==============================================================================
 Ops Platform - Unified Runner (Windows / PowerShell)
 Khởi động và giám sát đồng thời toàn bộ 4 dịch vụ:
   1. EMS Simulation Server   (Cổng 9000)
   2. Opsflow Core Engine API (Cổng 8000)
   3. Opsflow Console Portal  (Cổng 5174)
   4. Procurement Web UI      (Cổng 5173)
==============================================================================
#>

[CmdletBinding()]
param(
    [switch]$Docker,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Xử lý chế độ Docker Compose
if ($Docker) {
    Write-Host "==> Đang khởi chạy hệ thống bằng Docker Compose..." -ForegroundColor Cyan
    docker compose up --build
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "  ___             _____ _                 " -ForegroundColor Cyan
Write-Host " / _ \ _ __  ___ |  ___| | _____      __ " -ForegroundColor Cyan
Write-Host "| | | | '_ \/ __|| |_  | |/ _ \ \ /\ / / " -ForegroundColor Cyan
Write-Host "| |_| | |_) \__ \|  _| | | (_) \ V  V /  " -ForegroundColor Cyan
Write-Host " \___/| .__/|___/|_|   |_|\___/ \_/\_/   " -ForegroundColor Cyan
Write-Host "      |_|                                " -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor White
Write-Host "       OPS PLATFORM - KHỞI ĐỘNG 4 DỊCH VỤ TOÀN DỰ ÁN          " -ForegroundColor White
Write-Host "================================================================" -ForegroundColor White

# 1. Tự động thêm đường dẫn Node.js nếu chưa có trong PATH
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs",
    "$env:APPDATA\npm"
)
foreach ($np in $nodePaths) {
    if ((Test-Path $np) -and ($env:Path -notlike "*$np*")) {
        $env:Path = "$np;$env:Path"
    }
}

# 2. Đọc cấu hình từ file .env nếu có
$envFile = Join-Path $ScriptDir ".env"
if (Test-Path $envFile) {
    Write-Host "[INFO] Đang nạp cấu hình từ .env..." -ForegroundColor DarkGray
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and ($line -match "^(?<key>[A-Za-z_][A-Za-z0-9_]*)=(?<val>.*)$")) {
            $key = $Matches.key
            $val = $Matches.val.Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($key, $val, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

$emsPort = if ($env:EMS_SIM_PORT) { $env:EMS_SIM_PORT } else { "9000" }
$enginePort = if ($env:OPSFLOW_PORT) { $env:OPSFLOW_PORT } else { "8000" }
$portalPort = if ($env:OPS_PORTAL_PORT) { $env:OPS_PORTAL_PORT } else { "5174" }
$procPort = if ($env:PROCUREMENT_WEB_PORT) { $env:PROCUREMENT_WEB_PORT } else { "5173" }

# Đường dẫn các dịch vụ
$emsDir = Join-Path $ScriptDir "services\backend\ems-simulation"
$emsVenvPy = Join-Path $emsDir ".venv\Scripts\python.exe"

$engineDir = Join-Path $ScriptDir "services\backend\ops-workflow"
$engineVenvPy = Join-Path $engineDir ".venv\Scripts\python.exe"

$portalDir = Join-Path $ScriptDir "services\frontend\ops-portal"
$procDir = Join-Path $ScriptDir "services\frontend\procurement-web"

# 3. Kiểm tra xem đã chạy setup chưa, nếu chưa thì tự động chạy setup.ps1
$needSetup = $false
if (-not (Test-Path $emsVenvPy) -or -not (Test-Path $engineVenvPy)) { $needSetup = $true }
if (-not (Test-Path (Join-Path $portalDir "node_modules"))) { $needSetup = $true }
if (-not (Test-Path (Join-Path $procDir "node_modules"))) { $needSetup = $true }

if ($needSetup) {
    Write-Host "`n[CẢNH BÁO] Phát hiện môi trường chưa được cài đặt đầy đủ." -ForegroundColor Yellow
    Write-Host "-> Đang tự động kích hoạt script setup.ps1..." -ForegroundColor Cyan
    & (Join-Path $ScriptDir "setup.ps1")
    Write-Host ""
}

# Đảm bảo thư mục logs tồn tại
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" -Force | Out-Null }

# 4. Hàm dọn dẹp các tiến trình đang chiếm cổng trước khi chạy
function Free-Port([int]$port) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($conn in $conns) {
                Write-Host "  [+] Giải phóng cổng $port (PID $($conn.OwningProcess))..." -ForegroundColor DarkGray
                taskkill /PID $conn.OwningProcess /T /F 2>&1 | Out-Null
            }
        }
    } catch {}
}

Write-Host "[INFO] Kiểm tra và dọn dẹp các cổng dịch vụ..." -ForegroundColor DarkGray
Free-Port $emsPort
Free-Port $enginePort
Free-Port $portalPort
Free-Port $procPort

# Danh sách chứa các tiến trình đang chạy để dọn dẹp khi thoát
$script:RunningProcesses = @()

function Stop-AllServices {
    Write-Host "`n"
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "    Đang dừng toàn bộ các dịch vụ hệ thống gracefully...        " -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    foreach ($proc in $script:RunningProcesses) {
        if ($proc -and -not $proc.HasExited) {
            try {
                taskkill /PID $proc.Id /T /F 2>&1 | Out-Null
            } catch {}
        }
    }
    
    Free-Port $emsPort
    Free-Port $enginePort
    Free-Port $portalPort
    Free-Port $procPort

    Write-Host "Toàn bộ dịch vụ đã được dừng sạch sẽ." -ForegroundColor Green
}

try {
    # 5. Khởi động [1/4] EMS Simulation
    Write-Host "`n[1/4] Khởi động EMS Simulation Server (Cổng $emsPort)..." -ForegroundColor Cyan
    $env:EMS_SIM_DATABASE_URL = "sqlite+aiosqlite:///$($ScriptDir.Replace('\', '/'))/ems_simulation.db"
    $emsLog = Join-Path $ScriptDir "logs\ems-simulation.log"
    $pEms = Start-Process -FilePath $emsVenvPy `
        -ArgumentList "-m ems_sim.cli start --host 0.0.0.0 --port $emsPort" `
        -WorkingDirectory $emsDir `
        -RedirectStandardOutput $emsLog `
        -RedirectStandardError (Join-Path $ScriptDir "logs\ems-simulation-err.log") `
        -PassThru -NoNewWindow
    $script:RunningProcesses += $pEms

    # 6. Khởi động [2/4] Opsflow Core Engine API
    Write-Host "[2/4] Khởi động Opsflow Core Engine API (Cổng $enginePort)..." -ForegroundColor Cyan
    $env:DATABASE_URL = "sqlite+aiosqlite:///$($ScriptDir.Replace('\', '/'))/opsflow.db"
    $env:WORKFLOWS_DIR = Join-Path $engineDir "workflows"
    $engineLog = Join-Path $ScriptDir "logs\opsflow.log"
    $pEngine = Start-Process -FilePath $engineVenvPy `
        -ArgumentList "-m opsflow.cli api --host 0.0.0.0 --port $enginePort --dev" `
        -WorkingDirectory $engineDir `
        -RedirectStandardOutput $engineLog `
        -RedirectStandardError (Join-Path $ScriptDir "logs\opsflow-err.log") `
        -PassThru -NoNewWindow
    $script:RunningProcesses += $pEngine

    # 7. Khởi động [3/4] Ops-Portal Console UI
    Write-Host "[3/4] Khởi động Opsflow Console Portal UI (Cổng $portalPort)..." -ForegroundColor Cyan
    $portalLog = Join-Path $ScriptDir "logs\ops-portal.log"
    $pPortal = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev -- --host 0.0.0.0 --port $portalPort" `
        -WorkingDirectory $portalDir `
        -RedirectStandardOutput $portalLog `
        -RedirectStandardError (Join-Path $ScriptDir "logs\ops-portal-err.log") `
        -PassThru -NoNewWindow
    $script:RunningProcesses += $pPortal

    # 8. Khởi động [4/4] Procurement Web UI
    Write-Host "[4/4] Khởi động Procurement Web UI (Cổng $procPort)..." -ForegroundColor Cyan
    $procLog = Join-Path $ScriptDir "logs\procurement-web.log"
    $pProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev -- --host 0.0.0.0 --port $procPort" `
        -WorkingDirectory $procDir `
        -RedirectStandardOutput $procLog `
        -RedirectStandardError (Join-Path $ScriptDir "logs\procurement-web-err.log") `
        -PassThru -NoNewWindow
    $script:RunningProcesses += $pProc

    # 9. Health Checks (Kiểm tra song song để tối ưu tốc độ phản hồi)
    Write-Host "`n[INFO] Đang kiểm tra tình trạng kết nối (Health Check)..." -ForegroundColor Yellow

    $targets = @{
        "ems" = @{ "Name" = "EMS Simulation (Port $emsPort)"; "Url" = "http://localhost:$emsPort/health" }
        "engine" = @{ "Name" = "Opsflow Core API (Port $enginePort)"; "Url" = "http://localhost:$enginePort/health" }
        "portal" = @{ "Name" = "Ops Portal UI (Port $portalPort)"; "Url" = "http://localhost:$portalPort" }
        "proc" = @{ "Name" = "Procurement Web UI (Port $procPort)"; "Url" = "http://localhost:$procPort" }
    }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $pending = @($targets.Keys)
    $maxSeconds = 25

    while ($pending.Count -gt 0 -and $sw.Elapsed.TotalSeconds -lt $maxSeconds) {
        $toRemove = @()
        foreach ($key in $pending) {
            $t = $targets[$key]
            try {
                $res = Invoke-WebRequest -Uri $t.Url -Method Get -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
                if ($res -and $res.StatusCode -eq 200) {
                    Write-Host "  [OK] $($t.Name) đã sẵn sàng ($([math]::Round($sw.Elapsed.TotalSeconds, 1))s)!" -ForegroundColor Green
                    $toRemove += $key
                }
            } catch {}
        }
        if ($toRemove.Count -gt 0) {
            $pending = @($pending | Where-Object { $_ -notin $toRemove })
        }
        if ($pending.Count -gt 0) {
            Start-Sleep -Milliseconds 600
        }
    }

    if ($pending.Count -gt 0) {
        foreach ($key in $pending) {
            Write-Host "  [!] CẢNH BÁO: $($targets[$key].Name) chưa phản hồi tại $($targets[$key].Url) (Kiểm tra logs)." -ForegroundColor Yellow
        }
    }

    # 10. Dashboard hiển thị đường link
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "      TẤT CẢ 4 DỊCH VỤ ĐÃ ĐƯỢC KHỞI ĐỘNG THÀNH CÔNG!           " -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  * Opsflow Web Portal : http://localhost:$portalPort" -ForegroundColor Cyan
    Write-Host "  * Procurement Web UI : http://localhost:$procPort" -ForegroundColor Cyan
    Write-Host "  * Opsflow Core Engine: http://localhost:$enginePort" -ForegroundColor Cyan
    Write-Host "    -> API Docs (Swagger): http://localhost:$enginePort/api/v1/docs" -ForegroundColor DarkCyan
    Write-Host "  * EMS Simulation     : http://localhost:$emsPort" -ForegroundColor Cyan
    Write-Host "    -> Health Check    : http://localhost:$emsPort/health" -ForegroundColor DarkCyan
    Write-Host "----------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Nhật ký (Logs) được ghi trực tiếp vào:" -ForegroundColor Yellow
    Write-Host "    - logs/ems-simulation.log" -ForegroundColor DarkGray
    Write-Host "    - logs/opsflow.log" -ForegroundColor DarkGray
    Write-Host "    - logs/ops-portal.log" -ForegroundColor DarkGray
    Write-Host "    - logs/procurement-web.log" -ForegroundColor DarkGray
    Write-Host "----------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  >> Nhấn [Ctrl + C] tại cửa sổ này để dừng đồng thời 4 dịch vụ <<" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""

    # Mở trình duyệt mặc định nếu không có flag -NoBrowser
    if (-not $NoBrowser) {
        Start-Process "http://localhost:$portalPort"
    }

    # Giữ tiến trình chạy cho đến khi nhận tín hiệu dừng
    while ($true) {
        Start-Sleep -Seconds 2
        # Kiểm tra nếu có tiến trình nào bị thoát bất ngờ
        if ($pEms.HasExited) { Write-Host "[CẢNH BÁO] EMS Simulation đã dừng." -ForegroundColor Red; break }
        if ($pEngine.HasExited) { Write-Host "[CẢNH BÁO] Opsflow Engine đã dừng." -ForegroundColor Red; break }
    }
}
finally {
    Stop-AllServices
}
