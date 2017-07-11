const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const uuid = require('uuid4')

const WebSocket = require('ws');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  let callbacks = {};

  var tmo = setInterval(function() {
    console.log("amount of uuid's: ", Object.keys(callbacks).length);
  }, 5000);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  cluster.on('message', (worker, message, handle) => {
    if (arguments.length === 2) {
      handle = message;
      message = worker;
      worker = undefined;
    }
    if(callbacks.hasOwnProperty(message.uuid)) {
      let msg = callbacks[message.uuid];
      //console.log("uuid:", message.uuid, "found: ", msg.message);
      msg.socket.send(JSON.stringify(msg.message));
      delete callbacks[message.uuid]
    }
  });

  const wss = new WebSocket.Server({ port: 8000 });
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        for(const worker in cluster.workers) {
          message = JSON.parse(message);
          message.uuid = uuid();
          callbacks[message.uuid] = {"message":message, "socket": ws};
          cluster.workers[worker].send(message);
          break;
        }
    });
  });

} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  process.on('message', (message, handle) => {
    //console.log("worker", cluster.worker.id, "received message", message, "with handle", handle);
    cluster.worker.send(message);
  });
  console.log(`Worker ${process.pid} started`);
}