var express = require('express');
var crypto = require('crypto');
var http = require('http');
var app = express();

var port = 8000;
var host = "127.0.0.1";

app.all('*', function(request, response, next) {
  //console.log("middleware hit", req);
  next();
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

var server = http.createServer(app).listen(port);

server.on('connection', function(socket) {
  console.log("some connection");
});

server.on('connect', function(request, socket, head) {
  console.log("something connected");
});

server.on('request', function (request, response) { 
  console.log("server request", request.headers);
    //console.log("server request", request);
    //console.log("server response", response);
    response.writeContinue();

  });

server.on('checkContinue', function (request, response) { 
  console.log("server checkContinue");
  //console.log("server request", request);
  //console.log("server response", response);
  response.writeContinue();
});

server.on('close', function () { 
  console.log("connection closed");
});

server.on('upgrade', function(request, socket, head){
  // The client handshake, all the necessary params
  // should be checked, but coders are lazy by nature
  // so we (you) just print them

  console.log('upgrade: ' + request.method, request.url, "HTTP", request.httpVersion);
  //console.log(req.headers);

  // Build a handshake response according to the Spec.
  var magicstring = request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  var accepthash = new Buffer(crypto.createHash('sha1').update(magicstring).digest('base64'));

  //console.log("magicstring:", magicstring);

  socket.write("HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    "Sec-Websocket-Accept:" + accepthash + "\r\n" +
    "Origin: http://"+host+"\r\n" +
    "\r\n");

  // Bind 'data' event so we can communicate with the socket
  socket.on('data', function(chunk) {
    /* Received data will be echoed back to sender */

    console.log("chunk length:", chunk.length);
    var respMessage = decodeMessage(chunk);
    respMessage.type = "response";
    socket.write(encodeMessage(respMessage));
  });

  socket.on('end', function() {
      console.log("connection closed");
  });
});


server.listen(port, host);

/* encode/decode websocket data */
/* Good source: http://stackoverflow.com/questions/8125507/how-can-i-send-and-receive-websocket-messages-on-the-server-side 
*/    

function encodeMessage(data){

    var message = new Array();

    /* Write header */
    message[0] = 129;

    var len = data.length;

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

  /* Follow the spec RFC 6455, chapter "Base Framing Protocol" */
  /*
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+

   FIN:  1 bit

      Indicates that this is the final fragment in a message.  The first
      fragment MAY also be the final fragment.
  */
    var output = "";

    if(data[0] != 129) {
      switch(data[0] & 15) {
        case 0:
          console.log("continuation frame - not supported yet");
          break;
/*
        case 1:
          console.log("Text frame");
        break;
*/
        case 2:
          console.log("binary frame - not supported yet");
          break;

        case 8:
          console.log("connection close frame - not supported yet");
          break;

        case 9:
          console.log("connection close frame - not supported yet");
          break;

        case 10:
          console.log("connection close frame - not supported yet");
          break;

        default:
          console.log("unindetified frame - not supported yet");
          break;
      }
      console.log("not a data frame - skipped opcode 0x" + data[0] & 15);
      console.log("skipped message:", data);
    }
    else {
      console.log("FIN:", (data[0] & 128) ? '1':'0');
      console.log("RSV1:", data[0] & 64 ? '1':'0');
      console.log("RSV2:", data[0] & 32 ? '1':'0');
      console.log("RSV3:", data[0] & 16 ? '1':'0');
      // Currently defined opcodes for control frames
      // include 0x8 (Close), 0x9 (Ping), and 0xA (Pong)
      console.log("OPCODE:", data[0] & 15);
      console.log("PAYLOAD LEN:", data[1] & 127);
    
      var datalength = data[1] & 127;
      var indexFirstMask = 2;
      if (datalength == 126) {
          indexFirstMask = 4;
      } else if (datalength == 127) {
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

/* just to make sure that the magic algorithm is by the book (RFC 6455) */

function testAlgorithm() {
  var testhash = 'dGhlIHNhbXBsZSBub25jZQ==258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  if('s3pPLMBiTxaQ9kYGzzhZRbK+xOo=' == new Buffer(crypto.createHash('sha1').update(testhash).digest("base64"))) {
    console.log("testhash success");
  }
  else {
    console.log("testhash fails - something is wrong");
    process.exit(1);
  }
}

testAlgorithm();

console.log("server running @ http://" + host + ":" + port);