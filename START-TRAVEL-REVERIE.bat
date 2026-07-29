@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.5-map-zoom"
python -m http.server 8000
pause
