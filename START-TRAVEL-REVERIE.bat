@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.2.1-route-edit"
python -m http.server 8000
pause
