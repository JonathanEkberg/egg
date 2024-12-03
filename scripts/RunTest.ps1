# Exit on error
$ErrorActionPreference = "Stop"

# Email tests
Set-Location "apps/email"
go test

# Website tests
Set-Location "../../apps/website"
pnpm test