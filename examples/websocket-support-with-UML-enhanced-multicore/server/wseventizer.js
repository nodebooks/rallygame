var crypto = require('crypto');
var config = require('./config');

function wseventizer(server, cluster) {

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

    // Pass websocket to master
    process.send('websocket', socket);
  });
}

wseventizer.prototype.broadcast = function(message) {
  this.clients.forEach(function(socket) {
    if(socket.connected) {
      socket.send(decodeMessage(message));
    }
  });
};

/* encode/decode websocket data */
/* Good source: http://stackoverflow.com/questions/8125507/how-can-i-send-and-receive-websocket-messages-on-the-server-side */

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

function decodeMessage (data) {
  var output = "";

  if(data[0] != 129) {
    console.log("Not a Text Frame - skipped opcode 0x" + (data[0] & 15).toString(16));
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
    console.log("payload:", output);
  }
  return output;
}

module.exports = wseventizer;