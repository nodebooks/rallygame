
var cluster = require('cluster');
var net = require('net');
var fs = require('fs');
var http = require('http');
var ws = require('./socket');
var db = require('./db')

var config = require('../config/worker');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end("Rally server up and running at http://" + config.http.address + ":" + config.http.port);
});

server.listen(config.http.port, config.http.address, ws(server));

process.title = config.process.title;

process.on('message', function(message, handle) {
  switch(message.name) {
    case 'connectSocket':
      break;
    default:
      console.log("default branch");
      break;
  }
});

/*
function createWorkerServer() {
  var path = config.sockets.worker;
  // Create socket server per worker
  fs.stat(path, function(err) {
    if (!err) fs.unlinkSync(path);
      var socketServer = net.createServer(function(socket) {
        socket.on('data', function(data) {
      });
      socket.on('close', function(had_error) {
        console.log("worker%s: lost one client", cluster.worker.id);
      });
    });
    socketServer.listen(path);
  });
}

function connectMaster() {
  var path = config.sockets.master;
  var client = net.createConnection(path);
  client.on('connect', function() {
  });
  client.on('data', function(data) {
  });
}

function connectWorker(id) {
  var path = "/tmp/evworker" + id + ".sock";

  var client = net.createConnection(path);
  sockets[id] = client;

  client.on('connect', function() {
    client.write("moi from worker" + cluster.worker.id);
  });
  client.on('data', function(data) {
  });
  client.on('close', function() {
    console.log("worker%s: %s closed", cluster.worker.id, path);
    delete sockets[id];
  });
}

var interval = setInterval(function() {

},7000);
*/