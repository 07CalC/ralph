
FROM oven/bun:1.1.6

WORKDIR /app

COPY package.json bun.lockb tsconfig.json ./

RUN bun install --production

COPY src ./src

ENV NODE_ENV=production

CMD ["bun", "src/index.js"]
