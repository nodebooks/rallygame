FROM mhart/alpine-node:latest

COPY ./src /app

WORKDIR /app

RUN npm install

EXPOSE 5000

CMD ["node", "chat.js"]


