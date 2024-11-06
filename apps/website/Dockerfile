FROM node:alpine as base


ARG MODEL_PATH

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
RUN apk add --no-cache libc6-compat

#################################

FROM base as builder
WORKDIR /app
RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

#################################
FROM base as runner
WORKDIR /app

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js", "-p", "3000"]
