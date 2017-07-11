FROM mhart/alpine-node:latest

ENV mongodb mongodb
COPY . /app/

WORKDIR /app

RUN npm install 

EXPOSE 8000

CMD ["node", "server.js"]
