@echo off
chcp 65001 >nul
cd /d "%~dp0dist"
py -3 --version >nul 2>&1
if not errorlevel 1 goto use_py
python --version >nul 2>&1
if not errorlevel 1 goto use_python
echo Python 3 is required. You can also use VS Code Live Server.
pause
exit /b 1
:use_py
start "" http://127.0.0.1:8000
py -3 -m http.server 8000 --bind 127.0.0.1
goto finish
:use_python
start "" http://127.0.0.1:8000
python -m http.server 8000 --bind 127.0.0.1
:finish
pause
