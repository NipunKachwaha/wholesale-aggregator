FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm install typescript -g && tsc

# ── Production
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001

COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Upload folder banao
RUN mkdir -p uploads && chown nodejs:nodejs uploads

USER nodejs

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "dist/index.js"]