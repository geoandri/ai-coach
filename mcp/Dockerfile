# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Build context is the repo root so docs/personas/ is accessible.
FROM node:20-alpine AS builder
WORKDIR /app
COPY mcp/package*.json ./
RUN npm ci
COPY mcp/tsconfig.json ./
COPY mcp/src/ src/
RUN npm run build

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY mcp/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist dist/
# Persona markdown files are served as MCP prompts at runtime
COPY docs/personas/ personas/
RUN chown -R appuser:appgroup /app
USER appuser
ENV PORT=3001
EXPOSE 3001
ENTRYPOINT ["node", "dist/index.js"]
