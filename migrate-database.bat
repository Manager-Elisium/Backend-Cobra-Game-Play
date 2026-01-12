@echo off
echo ========================================
echo AWS Database Migration Script
echo ========================================
echo.

REM Check if pg module is installed
echo Checking dependencies...
call npm list pg >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing pg module...
    call npm install pg
    echo.
)

echo Running database migration...
echo.
node run-migration.js

echo.
echo ========================================
pause
