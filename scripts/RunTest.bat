@echo off
setlocal enabledelayedexpansion

:: Exit on error
if %errorlevel% neq 0 exit /b %errorlevel%

:: Email tests
cd apps\email
go test
if %errorlevel% neq 0 exit /b %errorlevel%

:: Website tests
cd ..\..\apps\website
pnpm test
if %errorlevel% neq 0 exit /b %errorlevel%