FROM node:22.11.0-alpine3.20 AS base 

################################

FROM base AS base-dev 
ENV TURBO_TELEMETRY_DISABLED=1
RUN npm install --global turbo@2.2.3 pnpm@9.12.0 @vercel/ncc@0.38.2

################################

FROM base-dev AS pruner 
WORKDIR /app

COPY . .
RUN turbo prune --scope=@egg/email --docker

################################

FROM base-dev AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/turbo.json ./turbo.json
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@egg/email

RUN ncc build /app/apps/email/dist/main.mjs --out /app/out --no-cache

################################

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/out /app
CMD ["node", "/app/index.mjs"]