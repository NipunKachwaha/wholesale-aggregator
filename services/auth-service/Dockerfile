# ── Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install

# Config aur Source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npx tsc

# ── Production Stage
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001

COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]