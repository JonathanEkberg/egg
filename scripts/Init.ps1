# Exit on error
$ErrorActionPreference = "Stop"

docker compose kill
docker compose rm -f
docker volume prune -a -f

docker compose up -d database --wait

Set-Location "packages/database"

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Remove-Item -Force .env -ErrorAction SilentlyContinue
    Set-Content -Path ".env" -Value "DATABASE_URL=postgres://egg:egg@localhost:5432/egg?schema=public&sslmode=disable"
}

# pnpm install
pnpm push
pnpm seed

docker compose up -d --build --remove-orphans
docker compose logs -f