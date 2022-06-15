# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /data
COPY package*.json ./
RUN npm install
COPY src ./
COPY .env .
RUN npm run deploy
RUN npm run build
CMD ["npm", "run", "start"]
