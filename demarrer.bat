@echo off
setlocal

echo ============================================
echo   Demarrage de ATTENDPRO
echo ============================================

echo.
echo [1/3] Demarrage de MySQL (XAMPP)...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo       MySQL est deja demarre.
) else (
    start "" "C:\xampp\mysql_start.bat"
    timeout /t 5 /nobreak >NUL
)

echo.
echo [2/3] Demarrage du serveur backend (port 4000)...
start "ATTENDPRO - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo.
echo [3/3] Demarrage du serveur frontend (port 5173)...
start "ATTENDPRO - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Attente du demarrage des serveurs...
timeout /t 8 /nobreak >NUL

echo.
echo Ouverture du site dans le navigateur...
start "" "http://localhost:5173"

echo.
echo ============================================
echo   ATTENDPRO est lance !
echo   Deux fenetres noires (backend/frontend)
echo   doivent rester ouvertes pendant l'utilisation.
echo   Fermez-les (ou cette fenetre) pour arreter.
echo ============================================
echo.
pause
