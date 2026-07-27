@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.3-route-scroll"
python -m http.server 8000
pause
