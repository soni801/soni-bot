# As of 08.10.24, canary must be used to enable typeorm support
FROM oven/bun:canary
WORKDIR /data

COPY . .
RUN bun install --production

CMD ["bun", "run", "start"]
