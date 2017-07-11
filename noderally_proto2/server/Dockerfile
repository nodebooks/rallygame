FROM mhart/alpine-node:latest

COPY . /app/

WORKDIR /app

RUN npm install 

EXPOSE 8000

CMD ["node", "server.js"]
