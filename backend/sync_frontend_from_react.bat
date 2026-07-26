@echo off
setlocal
set REACT_DIR=C:\Users\brueg\Desktop\projects\jobradar-weiterbildung-website
set ADMIN_DIR=C:\Users\brueg\Desktop\projects\JobRadar_Weiterbildung_Admin

echo [JobRadar] Building React frontend...
cd /d "%REACT_DIR%" || exit /b 1
call npm run typecheck || exit /b 1
call npm run build || exit /b 1

echo [JobRadar] Copying dist to FastAPI frontend_dist...
if not exist "%ADMIN_DIR%\frontend_dist" mkdir "%ADMIN_DIR%\frontend_dist"
robocopy "%REACT_DIR%\dist" "%ADMIN_DIR%\frontend_dist" /MIR
if %ERRORLEVEL% LEQ 3 (
  echo [JobRadar] Frontend sync complete.
  exit /b 0
)
exit /b %ERRORLEVEL%
