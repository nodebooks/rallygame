"use strict";

var express = require('express');
var net = require('net');
var http = require('http');
var config = require('../config');
var cluster = require('cluster');

var app = express();

var port = config.serverport;
var host = config.serverip;

// Configure process title
process.title = config.workernameprefix + cluster.worker.id;

// Configure HTTP server routes
var router = require('./http/routes');
app.use('/', router);

// Create HTTP server application
var server = http.createServer(app).listen(port);

// Bind HTTP upgrade for websocket (handshake)
var websocket = require('./http/websocket')(server);

// Allow public files 
//app.use(express.static(__dirname + 'server/webserver/public'));

// Create socket server

(function() {
  var fs = require('fs');
  var net = require('net');
  var path = config.sockets.worker + cluster.worker.id + '.sock';

  console.log("setup socket server for", path);
  fs.stat(path, function(err) {
      if (!err) fs.unlinkSync(path);
    var socketServer = net.createServer(function(socket) {
      socket.on('data', function(data) {
        console.log("worker", cluster.worker.id, "received data", data.toString('utf8'));
      });
    });
    socketServer.listen(path);
  });
})();


// Listen sockets
/*
(function() {

  for(var x=1; x<=config.cpus; x++) {
    var path = config.sockets.worker + cluster.worker.id + '.sock';
    if(x !== cluster.worker.id) {
      var client = net.createConnection(path);
      client.on("connect", function() {
        console.log("client", cluster.worker.id, "connected", path);
      });

      client.on("data", function(data) {
        console.log("client", cluster.worker.id, "received", data.toString('utf8'));
      });
    }
  }
})();
*/