@echo off
title KisanSetu Production Server (http://localhost:3000)
cd /d "%~dp0"
echo ========================================================
echo   Starting KisanSetu Production Server at http://localhost:3000
echo   Keep this window open while using the application.
echo ========================================================
node ./node_modules/next/dist/bin/next start
pause
