@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.4-trip-scrollers"
python -m http.server 8000
pause
