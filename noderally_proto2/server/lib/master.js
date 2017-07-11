// Create master process and share the
// server handles between workers

"use strict";

const WebSocket = require('ws');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const eventizer = require("./eventizer");
const uuid = require('uuid4');

if (cluster.isMaster) {

  let clients = {};

  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    var worker = cluster.fork();
  }

  cluster.on('online', (worker, code, signal) => {
    console.log(`new worker ${worker.id} online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.id} died`);
  });

  cluster.on('message', (worker, message, handle) => {
    if (arguments.length === 2) {
      handle = message;
      message = worker;
      worker = undefined;
    }
    //console.log("master got reply:", message, "from worker", worker.id, "from handle", handle);
    eventizer.reply(message);
  });

  // Start websocket server on master only
  const wss = new WebSocket.Server({ port: 8000 });

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      //console.log('received: %s', message);
      message = JSON.parse(message);
      message.uuid = uuid();

      eventizer.push(message, ws, function(response) {
        if(ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(response));
        }
      });
    });
  });

} else {
  process.on('message', function(message, handle, callback) {
    // Pass messages to eventizer and wait for response
    eventizer.push(message, handle, function(message) {
      // Pass response to master process
      process.send(message);
    });
  });

  var db = require('./db');
  console.log(`Worker ${cluster.worker.id} started`);
}

/*
var cluster = require('cluster');
var config = require('../config/master');
var eventizer = require('./eventizer');

var fs = require('fs');
var net = require('net');

process.title = config.process.title;

// Setup cluster
cluster.setupMaster({
  exec: config.worker.file,
  silent: false // Let workers use std[in/out/err]
});

// Create Lobby
var Lobby = require("../game/lobby");
var lobby = new Lobby();

// Spawn workers.
for (var i = 0; i < config.cpus; i++) {
  cluster.fork();
}

// Listen for worker events
// and fork() a new process on exit
cluster.on('exit', function(worker, code, signal) {
  console.log('worker %d died (%s). restarting...', 
    worker.id, signal || code); 
  cluster.fork();
});

cluster.on('disconnect', function(worker) {
  console.log('The worker #%s has disconnected', worker.id);
});

cluster.on('fork', function(worker) {
  console.log("Worker", worker.id, "is forked");
});

cluster.on('online', function(worker) {
  console.log("Worker %s is online", worker.id);
});

cluster.on('listening', function(worker, address) {
  console.log("worker%s is listening %s:%s", 
    worker.id, address.address, address.port);
});

cluster.on('message', (worker, message, handle) => {
  if (arguments.length === 2) {
    handle = message;
    message = worker;
    worker = undefined;
  }
  //console.log("worker", worker.id, "received message", message, "with handle", handle);
});
*/
/*
Object.keys(cluster.workers).forEach(function(id) {
  cluster.workers[id].on('message', function(message, socket) {
    if(undefined !== message.message) {
      switch (message.message) {
        case 'chat':
          lobby.broadcast(message);
          break;
        case 'race':
          console.log("race request handled on master");
          break;
        default:
          console.log("default branch");
          break;
      }
    }
  });
});*/
