const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', function connection(ws) {
  console.log("connection created");
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});