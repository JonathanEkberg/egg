@echo off
setlocal enabledelayedexpansion

:: Exit on error
if %errorlevel% neq 0 exit /b %errorlevel%

docker compose kill
docker compose rm -f
docker volume prune -a -f

docker compose up -d database --wait

cd packages\database

:: Check if .env file exists
if not exist .env (
    echo DATABASE_URL=postgres://egg:egg@localhost:5432/egg?schema=public&sslmode=disable > .env
)

:: pnpm install
pnpm push
pnpm seed

docker compose up -d --build --remove-orphans
docker compose logs -f