<!-- <div style="display:flex;align-items: center; margin-bottom: 2rem; flex-wrap: wrap; justify-content: center;"> -->

<p align="center">
    <img src="./icon.png" alt="egg" width="200" height="213"  />
</p>

<p align="center">
    <h1 align="center">Egg Store</h1>
</p>

**Supported platforms via Docker:**

- [x] Linux
- [x] Mac OS
- [x] Windows

## Install and run

### Requirements

- In order to run the service locally you need to have [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) installed (tested on Docker version 27.3.1, build ce12230).
- You must also have [Node.js](https://nodejs.org/en/download/package-manager) installed as well as the [pnpm](https://pnpm.io/) package manager.
This is only used to push the database schema, run tests as well as running the database schema.
Tested on Node.js v20.14.0 and pnpm v9.12.3.
- In order to run tests for the email client you must have [Go](https://go.dev/doc/install) installed (tested on 1.23.3).

### Run

From your shell run the following commands in order:

```sh
# Install dependencies
pnpm install

# Kill all the egg stores containers
docker compose kill
# Delete all the killed containers
docker compose rm -f

# Start and wait for database service to be healthy
docker compose up -d database --wait

# Change to packages/database directory
cd packages/database

# Push the database schema
pnpm push
# Seed database with some egg products
pnpm seed

# Change to project root directory
cd ../../

# Build and start containers for the services
docker compose up -d --build --remove-orphans
# View and follow logs of all services
docker compose logs -f
```

---
#### Web GUI for database

If you want to get a GUI for the database tables, columns and rows run this command:
```sh
cd packages/database
pnpm studio
```

and open https://local.drizzle.studio/

---
#### Clear database

If you're having problems and want to clear the database data you can run this command:
```sh
# This command will delete the database but also remove ALL other unused volumes from previous containers.
# If you don't want that run 'docker volume ls' and delete the volume for the database service.
# Should be called 'egg_database' or similar. Otherwise it should be the last created volume.
docker volume prune -a -f
```

### Demo

1. Visit http://localhost:8080/.

2. Click the sign up button to create an account.

### Tests

From your shell run the command:

```sh
cd apps/email
go test

cd ../../apps/website
pnpm test
```