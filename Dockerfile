# Multi-stage build for linux/arm64. Production runtime: node dist/index.js
# (express server serving the built SPA from dist/public + tRPC API).
# The server bundle keeps packages external, so the runtime image reuses the
# full node_modules from the build stage (vite is imported unconditionally).

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
