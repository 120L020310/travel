@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=6.4-compact-journal-theme-sync"
python -m http.server 8000
pause
