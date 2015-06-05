/* Simple HTTP server with */
/* public REST interface */
var express = require('express');
var http = require('http');
var config = require('./server/config');

var app = express();

var port = config.serverport;
var host = config.serverip;

// Configure HTTP server routes
var router = require('./server/routes');
app.use('/', router);

// Setup cluster
var cluster = require('cluster');

// Setup cluster before forking, change setup per worker, if necessary

if(cluster.isMaster) {

  console.log("Master here...");

  var workers = [];

  // Helper function for spawning worker at index 'i'.
  var spawn = function(i) {
    console.log("spawning", i);
    workers[i] = cluster.fork();
  };

  // Spawn workers.
  for (var i = 0; i < config.cpus; i++) {
    spawn(i);
  }

  // Handle some events
  cluster.on('exit', function(worker, code, signal) {
    console.log("Worker", worker.id, "went home.");
  });

  cluster.on('fork', function(worker) {
    //console.log("Worker", worker.id, "is forked.");
  });

  cluster.on('online', function(worker) {
    console.log("Worker", worker.id, "is online.");
    var tmo = setTimeout(function() {
      worker.send("Nice to meet you worker " + worker.id);
    }, 1000);
  });

  cluster.on('listening', function(worker, address) {
    console.log("A worker is now connected to http://" + host + ":" + port);
  });

  console.log("server running @ http://" + host + ":" + port);
}
else {
  // Create server application
  var server = http.createServer(app).listen(port);

  // Bind specific HTTP server and websocket events (handshake)
  var websocket = require('./server/websocket')(server, cluster);

  // Allow public files 
  app.use(express.static(__dirname + '/server/public'));
}