#!/bin/sh

pnpm docker

cd packages/database


# Check if .env file exists
if [ ! -f .env ]; then
  echo "DATABASE_URL=postgres://egg:egg@localhost:5432/egg?schema=public&sslmode=disable" > .env
fi

#pnpm install
pnpm push
pnpm seed

