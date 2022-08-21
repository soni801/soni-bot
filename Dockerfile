# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /data
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN rm .env.*.local
RUN pnpm run build
CMD ["pnpm", "run", "start"]
