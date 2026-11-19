@echo off
setlocal
chcp 65001 >nul
title Ops Platform - Full Service Runner

echo ================================================================
echo   OPS PLATFORM - KHỞI ĐỘNG HỆ THỐNG
echo ================================================================
echo Đang nạp các dịch vụ trong nền...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Quá trình chạy kết thúc với mã lỗi: %ERRORLEVEL%.
    pause
    exit /b %ERRORLEVEL%
)
