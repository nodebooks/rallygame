// Create master process and share the
// server handles between workers

"use strict";

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
          console.log("chatmessage")
          broadcast(message);
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
});

function broadcast(message) {
  for (var id in cluster.workers) {
    cluster.workers[id].send(message);
  }
}
