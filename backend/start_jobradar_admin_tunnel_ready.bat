@echo off
cd /d "%~dp0"
title JobRadar Admin Tunnel Ready
echo JobRadar Admin will listen on all interfaces: 0.0.0.0:8787
echo Local page: http://127.0.0.1:8787
echo Use ngrok/localtunnel in another window if n8n is on VPS.
start "" http://127.0.0.1:8787
python -m uvicorn app:app --host 0.0.0.0 --port 8787
pause
