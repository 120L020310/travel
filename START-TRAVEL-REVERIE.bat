@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.6.2-watercolor-route-layer-fix"
python -m http.server 8000
pause
