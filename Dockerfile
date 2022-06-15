# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /data
COPY package*.json ./
RUN npm install
COPY *.js *.json ./
COPY .env .
RUN node deploy
CMD ["node", "."]
