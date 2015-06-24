"use strict";

var crypto = require('crypto');
var config = require('../../config');
var player = require('../../game/player');
var connections = 0;
function Websocket(server) {

  server.on('connection', function(socket) {
    //console.log("client connected: core", cluster.worker.id);
  });

  server.on('request', function(request, response) {
    //console.log("request URL:", request.originalUrl, "("+cluster.worker.id+")");
  });

  server.on('upgrade', function(request, socket, head){
    //console.log("connection upgrade on core", cluster.worker.id);

    // Build a handshake response according to the Spec.
    var magicstring = request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    var accepthash = new Buffer(crypto.createHash('sha1').update(magicstring).digest('base64'));

    // Send update response to the client
    socket.write("HTTP/1.1 101 Switching Protocols\r\n" +
                 "Upgrade: websocket\r\n" +
                 "Connection: Upgrade\r\n" +
                 "Sec-Websocket-Accept:" + accepthash + "\r\n" +
                 "Origin: http://" + config.serverip + "\r\n" +
                 "\r\n");

    // Create Player object and pass socket handle to it
    connections++
    var newPlayer = new player(socket);

    // Or pass socket handle to master process
    //process.send('socket', socket);

  });
}

var interval = setInterval(function() {
  console.log("worker%s has %s connections", require('cluster').worker.id, connections);
}, 4000)
module.exports = Websocket;