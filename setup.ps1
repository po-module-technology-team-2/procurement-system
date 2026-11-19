<#
==============================================================================
 Ops Platform - Setup Script (Windows / PowerShell)
 Tự động thiết lập môi trường hoàn chỉnh cho máy mới:
   1. Kiểm tra Python (>=3.11), Node.js (>=18), Git
   2. Khởi tạo file .env từ .env.example
   3. Cài đặt Python virtualenv & dependencies cho cả 2 backend
   4. Cài đặt npm dependencies cho cả 2 frontend
   5. Chuẩn bị thư mục logs và kiểm tra sẵn sàng
==============================================================================
#>

[CmdletBinding()]
param(
    [switch]$SkipNpm,
    [switch]$SkipPython,
    [switch]$ForceReinstall
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "     OPS PLATFORM - HỆ THỐNG CÀI ĐẶT TỰ ĐỘNG CHO MÁY MỚI        " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Thư mục dự án: $ScriptDir" -ForegroundColor DarkGray
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Phát hiện đường dẫn Node.js & npm
# ------------------------------------------------------------------------------
Write-Host "[1/5] Kiểm tra môi trường Node.js & npm..." -ForegroundColor Yellow

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

$nodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1
$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1

if (-not $nodeCmd) {
    Write-Host "  [!] CẢNH BÁO: Không tìm thấy node.exe trong PATH." -ForegroundColor Red
    Write-Host "      Vui lòng cài đặt Node.js LTS (>= 18) từ: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$nodeVer = & $nodeCmd -v
Write-Host "  [OK] Node.js: $nodeVer ($nodeCmd)" -ForegroundColor Green
if ($npmCmd) {
    $npmVer = & $npmCmd -v
    Write-Host "  [OK] npm:     v$npmVer ($npmCmd)" -ForegroundColor Green
} else {
    Write-Host "  [!] CẢNH BÁO: Không tìm thấy npm.cmd." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# 2. Phát hiện phiên bản Python tương thích (Khuyến nghị 3.11 - 3.13)
# ------------------------------------------------------------------------------
Write-Host "`n[2/5] Kiểm tra môi trường Python..." -ForegroundColor Yellow

$pythonCmd = $null
$pythonBaseArgs = @()

# Kiểm tra qua py launcher
$pyLauncher = Get-Command py.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1
if ($pyLauncher) {
    $availPy = & $pyLauncher --list 2>&1 | Out-String
    if ($availPy -match "-3\.12") {
        $pythonCmd = $pyLauncher
        $pythonBaseArgs = @("-3.12")
    } elseif ($availPy -match "-3\.11") {
        $pythonCmd = $pyLauncher
        $pythonBaseArgs = @("-3.11")
    } elseif ($availPy -match "-3\.13") {
        $pythonCmd = $pyLauncher
        $pythonBaseArgs = @("-3.13")
    }
}

# Kiểm tra thư mục mặc định nếu chưa phát hiện phiên bản ưu tiên
if (-not $pythonCmd) {
    $candidates = @(
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311\python.exe",
        "C:\Program Files\Python312\python.exe",
        "C:\Program Files\Python311\python.exe"
    )
    foreach ($cand in $candidates) {
        if (Test-Path $cand) {
            $pythonCmd = $cand
            $pythonBaseArgs = @()
            break
        }
    }
}

# Kiểm tra python trực tiếp trong PATH
if (-not $pythonCmd) {
    $directPy = Get-Command python.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1
    if ($directPy) {
        $pythonCmd = $directPy
        $pythonBaseArgs = @()
    }
}

if (-not $pythonCmd) {
    Write-Host "  [!] Không tìm thấy Python 3.11 hoặc 3.12 trên hệ thống!" -ForegroundColor Red
    $installer = Get-ChildItem -Path "D:\Installers\Packages\Dev\Python 3.12*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($installer) {
        Write-Host "  [+] Phát hiện bộ cài offline tại: $($installer.FullName)" -ForegroundColor Cyan
        Write-Host "  [+] Đang tự động cài đặt Python 3.12..." -ForegroundColor Cyan
        Start-Process -FilePath $installer.FullName -ArgumentList "/quiet InstallAllUsers=0 PrependPath=1 Include_test=0" -Wait
        $pyTarget = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe"
        if (Test-Path $pyTarget) {
            Write-Host "  [OK] Cài đặt Python 3.12 thành công!" -ForegroundColor Green
            $pythonCmd = $pyTarget
            $pythonBaseArgs = @()
        }
    }
}

if (-not $pythonCmd) {
    Write-Host "  [ERROR] Vui lòng cài đặt Python (3.11 hoặc 3.12) để tiếp tục." -ForegroundColor Red
    exit 1
}

$pyVer = & $pythonCmd @pythonBaseArgs --version 2>&1
Write-Host "  [OK] Trình thông dịch Python sử dụng: $pyVer ($pythonCmd $($pythonBaseArgs -join ' '))" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 3. Tạo file cấu hình .env nếu chưa có
# ------------------------------------------------------------------------------
Write-Host "`n[3/5] Kiểm tra cấu hình môi trường (.env)..." -ForegroundColor Yellow

$envFile = Join-Path $ScriptDir ".env"
$envExample = Join-Path $ScriptDir ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "  [OK] Đã tạo file .env từ template .env.example" -ForegroundColor Green
    } else {
        Write-Host "  [!] CẢNH BÁO: Không tìm thấy file .env.example để tạo .env!" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [OK] File .env đã tồn tại sẵn." -ForegroundColor Green
}

if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    Write-Host "  [OK] Đã tạo thư mục logs/" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 4. Cài đặt Backend Services (Python Virtual Environments)
# ------------------------------------------------------------------------------
if (-not $SkipPython) {
    Write-Host "`n[4/5] Thiết lập môi trường ảo và gói Backend..." -ForegroundColor Yellow

    # 4.1 EMS Simulation
    $emsDir = Join-Path $ScriptDir "services\backend\ems-simulation"
    $emsVenv = Join-Path $emsDir ".venv"
    Write-Host "  -> Cấu hình: services/backend/ems-simulation" -ForegroundColor Cyan

    if ($ForceReinstall -and (Test-Path $emsVenv)) {
        Remove-Item -Recurse -Force $emsVenv
    }

    if (-not (Test-Path $emsVenv)) {
        Write-Host "     Tạo virtualenv tại $emsVenv..." -ForegroundColor DarkGray
        & $pythonCmd @pythonBaseArgs -m venv $emsVenv
    }

    $emsPy = Join-Path $emsVenv "Scripts\python.exe"
    Write-Host "     Cập nhật pip & cài đặt ems-simulation..." -ForegroundColor DarkGray
    & $emsPy -m pip install --upgrade pip --quiet
    & $emsPy -m pip install --default-timeout=100 -e $emsDir --quiet
    Write-Host "  [OK] ems-simulation sẵn sàng!" -ForegroundColor Green

    # 4.2 Opsflow Engine
    $engineDir = Join-Path $ScriptDir "services\backend\ops-workflow"
    $engineVenv = Join-Path $engineDir ".venv"
    Write-Host "  -> Cấu hình: services/backend/ops-workflow" -ForegroundColor Cyan

    if ($ForceReinstall -and (Test-Path $engineVenv)) {
        Remove-Item -Recurse -Force $engineVenv
    }

    if (-not (Test-Path $engineVenv)) {
        Write-Host "     Tạo virtualenv tại $engineVenv..." -ForegroundColor DarkGray
        & $pythonCmd @pythonBaseArgs -m venv $engineVenv
    }

    $enginePy = Join-Path $engineVenv "Scripts\python.exe"
    Write-Host "     Cập nhật pip & cài đặt ops-workflow..." -ForegroundColor DarkGray
    & $enginePy -m pip install --upgrade pip --quiet
    & $enginePy -m pip install --default-timeout=100 -e $engineDir --quiet
    Write-Host "  [OK] ops-workflow sẵn sàng!" -ForegroundColor Green
} else {
    Write-Host "`n[4/5] Bỏ qua cài đặt Backend (--SkipPython)." -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# 5. Cài đặt Frontend Services (npm dependencies)
# ------------------------------------------------------------------------------
if (-not $SkipNpm) {
    Write-Host "`n[5/5] Cài đặt dependencies cho Frontend..." -ForegroundColor Yellow

    # 5.1 Ops Portal
    $portalDir = Join-Path $ScriptDir "services\frontend\ops-portal"
    $portalModules = Join-Path $portalDir "node_modules"
    Write-Host "  -> Cài đặt: services/frontend/ops-portal" -ForegroundColor Cyan
    if ($ForceReinstall -or (-not (Test-Path $portalModules))) {
        Push-Location $portalDir
        & $npmCmd install --no-audit --no-fund
        Pop-Location
    }
    Write-Host "  [OK] ops-portal sẵn sàng!" -ForegroundColor Green

    # 5.2 Procurement Web
    $procDir = Join-Path $ScriptDir "services\frontend\procurement-web"
    $procModules = Join-Path $procDir "node_modules"
    Write-Host "  -> Cài đặt: services/frontend/procurement-web" -ForegroundColor Cyan
    if ($ForceReinstall -or (-not (Test-Path $procModules))) {
        Push-Location $procDir
        & $npmCmd install --no-audit --no-fund
        Pop-Location
    }
    Write-Host "  [OK] procurement-web sẵn sàng!" -ForegroundColor Green
} else {
    Write-Host "`n[5/5] Bỏ qua cài đặt Frontend (--SkipNpm)." -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# Hoàn tất
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "            QUÁ TRÌNH THIẾT LẬP HOÀN TẤT THÀNH CÔNG!            " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "Để khởi chạy toàn bộ 4 dịch vụ của hệ thống:" -ForegroundColor White
Write-Host "  Cách 1: Nhấp đúp chuột vào file: start.bat" -ForegroundColor Cyan
Write-Host "  Cách 2: Mở PowerShell và gõ:     .\start.ps1" -ForegroundColor Cyan
Write-Host "  Cách 3 (Linux / macOS / WSL):    ./start.sh" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
