@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.8.1-photo-cover-context-menu"
python -m http.server 8000
pause
