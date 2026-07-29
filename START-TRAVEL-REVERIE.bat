@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/?build=7.6.3-oil-photo-gallery"
python -m http.server 8000
pause
