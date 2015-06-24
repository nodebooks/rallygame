"use strict";

var crypto = require('crypto');
var cluster = require('cluster');

var config = require('../config/worker');
var eventizer = require('./eventizer');

var connections = 0;
var packets = 0;

var Websocket = function(server) {

  var _sockets = [];
  var _socketId = 0;

  server.on('upgrade', function(request, socket, head){

    // Build a handshake response according the Spec.
    var magicstring = request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    var accepthash = new Buffer(crypto.createHash('sha1').update(magicstring).digest('base64'));

    // Send update response to the client
    socket.write("HTTP/1.1 101 Switching Protocols\r\n" +
                 "Upgrade: websocket\r\n" +
                 "Connection: Upgrade\r\n" +
                 "Sec-Websocket-Accept:" + accepthash + "\r\n" +
                 "Origin: http://" + config.serverip + "\r\n" +
                 "\r\n");

    // Add some nice functions
    socket.encodeMessage = encodeMessage;
    socket.decodeMessage = decodeMessage;
    addSocket(socket);

    socket.on('data', function(chunk) {
      // Terminate websocket protocol
      var msg = decodeMessage(chunk);
      // Pre-check if message is JSON string
      msg = preCheckMessage(msg);

      if(msg) {
        // Valid JSON received: pass data to upper layer
        eventizer.push(msg, this);
      }
      else {
        // Bogus data from client, close socket
        socket.write(encodeMessage(JSON.stringify({message: "error", reason: "bogus data"})));
        socket.end();
      }
      process.send('message');
    });

    socket.on('error', function() {
      console.log("socket %s error", socket.id);
      removeSocket(socket);
    });

    socket.on('end', function() {
      removeSocket(socket);
    });
  });

  function addSocket(socket) {
    socket.id = _socketId;
    _socketId += 1;
    _sockets[socket.id] = socket;
  }

  function removeSocket(socket) {
    console.log("worker%s is removing socket %s", cluster.worker.id, socket.id);
    delete _sockets[socket.id];
  }

  function preCheckMessage(message) {
      try {
        var object = JSON.parse(message);
        //console.log("valid JSON", object);
        return object;
      }
      catch(e) {
        return undefined;
      }
  }

  function encodeMessage (data){
    var len = data.length;
    var message = [];
    // Set header to text frame
    message[0] = 129;
    // Calculate payload data length and format message accordingly
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
    // Create a buffer object 
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

  function decodeMessage (data) {
    var output = "";
    if(data[0] != 129) {
      //console.log("Not a Text Frame - skipped opcode 0x" + (data[0] & 15).toString(16));
      //console.log("skipped message:", data);
    }
    else {
      var datalength = data[1] & 127;
      var indexFirstMask = 2;
      if (datalength == 126) {
        indexFirstMask = 4;
      } 
      else if (datalength == 127) {
        indexFirstMask = 10;
      }
      var masks = data.slice(indexFirstMask,indexFirstMask + 4);
      var i = indexFirstMask + 4;
      var index = 0;
      while (i < data.length) {
        output += String.fromCharCode(data[i++] ^ masks[index++ % 4]);
      }
      //console.log("payload:", output);
    }
    return output;
  }

  function broadcast(message) {
    /*
    for (var id in _sockets) {
      _sockets[id].write(encodeMessage(JSON.stringify(message)));
    }
    */
  }

  return {
    broadcast: broadcast
  }
};

module.exports = Websocket;
