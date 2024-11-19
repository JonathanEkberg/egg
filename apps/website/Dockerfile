FROM node:22.11.0-alpine3.20 AS base 
ENV NEXT_TELEMETRY_DISABLED=1

################################

FROM base AS base-dev 
ENV TURBO_TELEMETRY_DISABLED=1
RUN npm install --global turbo@2.2.3 pnpm@9.12.0

################################

FROM base-dev AS pruner 
WORKDIR /app

COPY . .
RUN turbo prune --scope=@egg/website --docker

################################

FROM base-dev AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/turbo.json ./turbo.json
COPY --from=pruner /app/out/full/ .

ENV DATABASE_URL=postgres://egg:egg@localhost:5432/egg?schema=public&sslmode=disable
RUN turbo run build --env-mode loose --filter=@egg/website -- --no-lint

RUN tree apps/website/.next/standalone
RUN ls -lah apps/website/.next

################################

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/apps/website/.next/standalone .
COPY --from=builder /app/apps/website/.next/static apps/website/.next/static
COPY --from=builder /app/apps/website/public apps/website/public

CMD ["node", "apps/website/server.js"]