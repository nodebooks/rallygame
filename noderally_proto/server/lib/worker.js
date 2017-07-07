"use strict";

var cluster = require('cluster');
var net = require('net');
var fs = require('fs');
var http = require('http');
var db = require('./db');
var socket = require('./socket');
var config = require('../config/worker');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end("Rally server up and running at http://" + 
           config.http.address + ":" + config.http.port);
});

var ws = new socket(server);
server.listen(config.http.port, config.http.address, ws);

console.log("server listening", config.http.address + ":" + config.http.port);

process.title = config.process.title;

process.on('message', function(message, handle) {
  switch(message.message) {
    case 'chat':
      ws.broadcast(message);
      break;
    case 'race':
      console.log("race request got on worker");
      break;
    default:
      console.log("default branch");
      break;
  }
});
