@echo off
title KisanSetu Server (http://localhost:3000)
cd /d "%~dp0"
echo ========================================================
echo   Starting KisanSetu Server at http://localhost:3000
echo   Keep this window open while using the application.
echo ========================================================
node ./node_modules/next/dist/bin/next dev
pause
