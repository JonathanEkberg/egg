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
- [/] Windows (no init script unless you have GitBash shell)

## Install and run

### Requirements

- In order to run the service locally you need to have [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) installed.
- You must also have [Node.js](https://nodejs.org/en/download/package-manager) installed as well as the [pnpm](https://pnpm.io/) package manager.
This is only used to push the database schema, run tests as well as running the database schema.
Tested on Node.js v20.14.0 and pnpm v9.12.3.
- In order to run tests for the email client you must have [Go](https://go.dev/doc/install) installed (tested on 1.23.3).

### Run

From your shell on Linux or MacOS run the command:

```sh
sh ./scripts/Init.sh
```

or on Windows run:

```sh
.\scripts\Init.bat  # Batch

# or 

.\scripts\Init.ps1  # PowerShell
```

if the command doesn't work for whatever reason you can just run the same commands as the script does manually.

### Tests

From your shell run the command:

```sh
sh ./scripts/RunTest.sh
```

or on Windows run:

```sh
.\scripts\RunTest.bat  # Batch

# or 

.\scripts\RunTest.ps1  # PowerShell
```

if the command doesn't work for whatever reason you can just run the same commands as the script does manually.

### Demo

1. Visit http://localhost:8080/.

2. Click the sign up button to create an account.