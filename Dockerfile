FROM oven/bun:1.1.6

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./

RUN bun install --production

COPY index.js ./index.js

ENV NODE_ENV=production

CMD ["bun", "index.js"]
