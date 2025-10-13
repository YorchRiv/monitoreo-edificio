@echo off
REM --------------------------------------------
REM Script para iniciar Backend y Frontend
REM --------------------------------------------

REM Abrir backend en nueva ventana de PowerShell
start powershell -NoExit -Command "cd 'C:\Users\Robert\Documents\GitHub\Analisis de Sistemas 2 Edificio\parquet-backend'; npm run start:dev"

REM Abrir frontend en nueva ventana de PowerShell
start powershell -NoExit -Command "cd 'C:\Users\Robert\Documents\GitHub\Analisis de Sistemas 2 Edificio\parquet-frontend'; ng serve -o"

echo 🚀 Backend y Frontend iniciados
pause
