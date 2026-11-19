@echo off
setlocal
title Ops Platform - Setup

echo ================================================================
echo   OPS PLATFORM - AUTOMATED SETUP
echo ================================================================
echo Starting PowerShell setup script with ExecutionPolicy Bypass...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*
set ERR=%ERRORLEVEL%
if %ERR% NEQ 0 (
    echo.
    echo [ERROR] Setup failed with exit code: %ERR%
    pause
    exit /b %ERR%
)

echo.
echo Press any key to exit this window or run start.bat to launch...
pause >nul
