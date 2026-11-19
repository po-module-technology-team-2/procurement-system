@echo off
setlocal
title Ops Platform - Full Service Runner

echo ================================================================
echo   OPS PLATFORM - LAUNCHING ALL SERVICES
echo ================================================================
echo Starting PowerShell runner script with ExecutionPolicy Bypass...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
set ERR=%ERRORLEVEL%
if %ERR% NEQ 0 (
    echo.
    echo [ERROR] Runner stopped with exit code: %ERR%
    pause
    exit /b %ERR%
)
