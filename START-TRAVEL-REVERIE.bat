@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.2-modular-routes"
python -m http.server 8000
pause
