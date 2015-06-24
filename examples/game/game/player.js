"use strict";

//var lobby = require('./lobby');
// A new Player object is generated when a websocket connects
// The Player is then connected to the Lobby

function Player(socket) {

  bindSocketEvents(socket);

  function bindSocketEvents(socket) {
    // Bind socket 'data' event
    // This data is received from the client
    // application. Handle with care.
    socket.on('data', function(chunk) {
      // Echo messages back atm.
      this.write(encodeMessage(decodeMessage(chunk)));
    });

    socket.on('end', function() {
      //this.connected = false;
      //console.log("socket end");
      // Release/Close socket for sure
      this.end();
    });

    socket.on('close', function() {
      //this.connected = false;
      //console.log("socket closed");
    });

    socket.on('error', function() {
      //this.connected = false;
      console.log("socket error");
    });
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
}

module.exports = Player;