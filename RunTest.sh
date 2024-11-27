#!/bin/sh

# Email tests
cd apps/email
go test

# Website tests
cd ../../apps/website
pnpm test