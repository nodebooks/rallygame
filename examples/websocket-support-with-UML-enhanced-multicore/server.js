/* Simple HTTP server with */
/* public REST interface */
var express = require('express');
var http = require('http');
var config = require('./server/config');
var lobby = require('./game/lobby');

var lob;

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

  lob = new lobby();

  var workers = [];
  var clients = [];

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
    console.log("Worker", worker.id, "is now listening http://" + address.address + ":" + address.port, "(addressType " + address.addressType +")");
  });

  Object.keys(cluster.workers).forEach(function(id) {
    cluster.workers[id].on('message', function(message, socket) {
      //console.log("master received", message, "from worker", cluster.workers[id].id);

      switch(message) {
        case "websocket":
          //console.log(socket);
          socket.connected = true;
          clients.push(socket);
          socket.write(encodeMessage("hello new client"));
          /*
          clients.forEach(function(ws){
            if (ws.connected) {
              var data = encodeMessage("a new client joined");
              ws.write(data); 
            }
            else {
              //console.log("websocket already destroyed, clear it from the array");
            }
          });
    */
          
          // Handle socket events (just a dirty hack at this moment)
          socket.on('end', function() {
            this.connected = false;
            //console.log("socket disconnected");
          });

          socket.on('close', function() {
            //console.log(this);
            this.connected = false;
            //console.log("socket closed");
          });

          socket.on('error', function() {
            //console.log(this);
            this.connected = false;
            //console.log("socket error");
          });
        break;
        default:
          // Broadcast message
          console.log("default branch reached");
          clients.forEach(function(ws) {
            ws.write(encodeMessage(message));
          });
        break;
      }
    });
  });

  console.log("server running @ http://" + host + ":" + port);
}
else {
  // Create server application
  var server = http.createServer(app).listen(port);

  // Bind specific HTTP server and websocket events (handshake)
  var websocket = require('./server/wseventizer')(server, cluster);

  // Allow public files 
  app.use(express.static(__dirname + '/server/public'));

  process.on('message', function(message, socket) {
    console.log(cluster.worker.id, "received message", message);
    /*
    if(message.broadcast) {
      //console.log(self);
      socket.write("asdf");
    }*/
  });
}

function encodeMessage(data){

  var len = data.length;
  var message = [];

  /* Set header to text frame */
  message[0] = 129;

  /* Calculate payload data length and format message accordingly */
  if(len <= 125) {
    message[1] = len;
  }
  else if (len >= 126 && len < 65535) {
    message[1] = 126; 
    message[2] = (len >> 8) & 255;
    message[3] = len & 255;
  }
  else {
    message[1] = 127;
    for(var x=1; x<=8;x++) {
      message[x] = (len >> 64 - x*8) & 255;
    }
  }

  /* Create a buffer object */
  var buffer = new Buffer(message.length + data.length);

  // Copy header 
  for (var i = 0; i < message.length; i++){
    buffer[i] = message[i];
  }

  // Copy payload data
  for (var j=0; j<len; j++) {
    buffer[i+j] = data.charCodeAt(j);
  }

  return buffer;
}