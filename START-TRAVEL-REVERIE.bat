@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.6-route-map-sync"
python -m http.server 8000
pause
