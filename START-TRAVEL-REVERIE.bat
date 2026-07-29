@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.4.2-route-pins"
python -m http.server 8000
pause
