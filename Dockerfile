# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /data
COPY package.json .
RUN yarn install
COPY src ./
COPY .env .
COPY tsconfig.json .
RUN yarn run build
RUN yarn run deploy
CMD ["yarn", "run", "start"]
