@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.7.0-photo-wall-carousel"
python -m http.server 8000
pause
