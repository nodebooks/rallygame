FROM mhart/alpine-node:latest

COPY ./src /app

WORKDIR /app

RUN npm install

EXPOSE 8000

CMD ["node", "lobby.js"]


