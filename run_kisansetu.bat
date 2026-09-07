@echo off
title KisanSetu Server (SIH 26132)
echo ====================================================
echo   KisanSetu - Market Linkages and Price Discovery
echo ====================================================
echo Starting KisanSetu web server...
cd /d %~dp0

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

npm start
pause
