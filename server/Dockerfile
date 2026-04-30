FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./

RUN npm ci --only=production

COPY src/ ./src/
COPY migrations/ ./migrations/
COPY shared/ ./shared/
COPY index.js ./

RUN mkdir -p /app/data

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_DATA_DIR=/app/data

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "index.js"]