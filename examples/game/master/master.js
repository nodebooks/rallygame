"use strict";

var cluster = require('cluster');
var config = require('../config');

function Master() {
  console.log("Starting up server processes");
  process.title = config.mastername;
  this.workers = [];
  this.connections = 0;
}

Master.prototype.start = function() {
  var self = this;

  console.log("starting master...");

  // Setup cluster
  cluster.setupMaster({
    exec: './worker/worker.js',
    silent: false // Let workers use stdout
  });

  var spawn = function(i) {
    //console.log("spawning", i);
    self.workers[i] = cluster.fork();
  };

  // Spawn workers.
  for (var i = 0; i < config.cpus; i++) {
    spawn(i);
  }

  // Listen for worker events
 // Handle some events
  cluster.on('exit', function(worker, code, signal) {
    console.log("Worker", worker.id, "went home:", code, signal);
  });

  cluster.on('fork', function(worker) {
    //console.log("Worker", worker.id, "is forked");
  });


  cluster.on('online', function(worker) {
    console.log("Worker", worker.id, "is online");
  });

  cluster.on('listening', function(worker, address) {
    if(address.address) {
      console.log("Worker", worker.id, "is now listening socket", address.address);
    }
    else {
      console.log("Worker", worker.id, "is now listening port", address.port);
    }
  });
/*
  Object.keys(cluster.workers).forEach(function(id) {
    cluster.workers[id].on('message', function(message, socket) {
      if(socket && message==='socket') {
        self.connections += 1;
        var newPlayer = new player(socket);
      }
    });
  });
*/

};
module.exports = Master;