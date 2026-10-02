@echo off
TITLE University Research Opportunity Portal Server
echo ====================================================
echo Starting University Research Opportunity Portal...
echo ====================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"
)

where mysql >nul 2>nul
if %errorlevel% neq 0 (
    set "PATH=C:\Program Files\MariaDB 13.0\bin;%PATH%"
)

echo Initializing database schema if needed...
node scripts/init-db.js

echo Starting web server on http://localhost:5000...
node server.js
pause
