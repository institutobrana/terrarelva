@echo off
setlocal

set "ROOT=D:\TERRA RELVA APP"
set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend-react"

echo ==========================================
echo Terra Relva - Inicializacao oficial
echo ==========================================
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:8080
echo Rede:     http://IP_DA_MAQUINA:8080
echo ==========================================
echo.

start "Terra Relva Backend" cmd /k "cd /d %BACKEND_DIR% && npm.cmd run dev"
start "Terra Relva Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm.cmd run dev -- --host 0.0.0.0 --port 8080"

echo Janelas iniciadas.
echo Acesse localmente em http://localhost:8080
echo Ou pela rede em http://IP_DA_MAQUINA:8080
echo.

endlocal
