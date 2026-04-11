@echo off
echo ============================================
echo   GameDesk POS - Setup Script
echo ============================================
echo.
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended: LTS version (v20 or higher)
    echo.
    echo After installing, run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Starting development server...
echo   Open: http://localhost:5173
echo ============================================
echo.
npm run dev
pause
