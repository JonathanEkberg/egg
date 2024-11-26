#!/bin/sh

docker compose kill -f 
docker compose rm -f
docker volume prune -a -f

docker compose up -d database --wait

cd packages/database

# Check if .env file exists
if [ ! -f .env ]; then
  echo "DATABASE_URL=postgres://egg:egg@localhost:5432/egg?schema=public&sslmode=disable" > .env
fi

#pnpm install
pnpm push
pnpm seed

docker compose up -d --build --remove-orphans

