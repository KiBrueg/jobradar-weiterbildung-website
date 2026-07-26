@echo off
setlocal
cd /d C:\Users\brueg\Desktop\projects\JobRadar_Weiterbildung_Admin

echo JobRadar Weiterbildung MVP
echo.
echo Public site bleibt erreichbar. Admin/API/Downloads werden geschuetzt, wenn ein Passwort gesetzt ist.
echo Benutzername: admin
echo.
set /p JOBRADAR_ADMIN_PASSWORD=Admin-Passwort eingeben (leer = nur lokaler Dev ohne Schutz): 
set JOBRADAR_ADMIN_USER=admin

echo.
echo Starte JobRadar unter http://127.0.0.1:8787
echo Admin: http://127.0.0.1:8787/admin
echo Zum Beenden dieses Fenster schliessen oder STRG+C druecken.
echo.
python -m uvicorn app:app --host 127.0.0.1 --port 8787
pause
