// Create master process and share the
// server handles between workers

"use strict";

var cluster = require('cluster');
var config = require('../config/master');
var fs = require('fs');
var net = require('net');

process.title = config.process.title;

var eventCount = 0;

// Setup cluster
cluster.setupMaster({
  exec: config.worker.file,
  silent: false // Let workers use std[in/out/err]
});

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
  //console.log("Worker", worker.id, "is forked");
});

cluster.on('online', function(worker) {
  console.log("Worker %s is online", worker.id);
});

cluster.on('listening', function(worker, address) {
  console.log("worker%s is listening %s:%s", 
    worker.id, address.address, address.port);
});

Object.keys(cluster.workers).forEach(function(id) {
  cluster.workers[id].on('message', function(message, socket) {
    if(undefined !== message.message) {
      switch (message.message) {
        case 'chat':
          //broadcast(message);
          break;
        default:
          console.log("default branch");
          break;
      }
    }
    if(message === 'eventCount') {
      eventCount++;
    }
  });
});

function broadcast(message) {
  for (var id in cluster.workers) {
    cluster.workers[id].send(message);
  }
}

var time = 0;
var prevEventCount = 0;

var inter = setInterval(function() {
  console.log("events per second: %s", (eventCount-prevEventCount));
  prevEventCount = eventCount;
}, 1000);

/*
function startSocketServers() {
  var path = config.sockets.master;

  console.log("setup socket for", path);
  fs.stat(path, function(err) {
    if (!err) fs.unlinkSync(path);
      var socketServer = net.createServer(function(socket) {
        socket.on('data', function(data) {
      });
    });
    socketServer.listen(path);
  });
}

var tmo = setTimeout(function() {
  console.log("disconnecting one worker");
  Object.keys(cluster.workers).forEach(function(id) {
    if(id==1)
      cluster.workers[id].kill();
  });
}, 3000)
*/