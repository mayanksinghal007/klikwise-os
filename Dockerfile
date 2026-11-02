FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3300

# Copy application source & configs
COPY package.json ./
COPY config ./config
COPY src ./src
COPY public ./public
COPY prisma ./prisma
COPY tests ./tests

EXPOSE 3300

# Run internal verification test before launching server
RUN node tests/systemTest.js

CMD ["node", "src/server.js"]

