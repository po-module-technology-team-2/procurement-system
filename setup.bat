@echo off
setlocal
chcp 65001 >nul
title Ops Platform - Automatic Setup

echo ================================================================
echo   OPS PLATFORM - CÀI ĐẶT TỰ ĐỘNG
echo ================================================================
echo Đang chạy script cấu hình PowerShell...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Quá trình cài đặt gặp lỗi (Mã lỗi: %ERRORLEVEL%).
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này hoặc chạy start.bat để bắt đầu...
pause >nul
