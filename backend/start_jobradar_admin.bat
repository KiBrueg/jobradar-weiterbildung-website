@echo off
cd /d "%~dp0"
title JobRadar Admin Server
echo.
echo ========================================
echo  JobRadar Admin
echo ========================================
echo.
echo Local browser URL: http://127.0.0.1:8787
echo Tunnel/Docker reachable server bind: 0.0.0.0:8787
echo If using ngrok/localtunnel, keep this window open.
echo.
start "" http://127.0.0.1:8787
echo Starting JobRadar Admin on 0.0.0.0:8787...
echo.
python -m uvicorn app:app --host 0.0.0.0 --port 8787
echo.
echo Server stopped or port is already in use.
echo If port is already in use, open: http://127.0.0.1:8787
pause
