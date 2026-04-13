# ── Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies install
COPY package*.json ./
RUN npm install --only=production

# Source copy
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm install typescript -g
RUN tsc

# ── Production Stage
FROM node:20-alpine AS production

WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001

# Production deps only
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Built files copy
COPY --from=builder /app/dist ./dist

# User switch
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]