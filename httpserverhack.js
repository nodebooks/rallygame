var http = require('http');
var crypto = require('crypto');
var server = http.createServer();

var port = 8000;
var host = "127.0.0.1";

server.on('connection', function(socket) {
    console.log("some connection");
});

server.on('connect', function(request, socket, head) {
    console.log("something connected");
});

server.on('request', function (request, response) { 
    console.log("server request", request.headers);
    response.writeContinue();
});

server.on('checkContinue', function (request, response) { 
    console.log("server checkContinue");
    response.writeContinue();
});

server.on('close', function () { 
    console.log("connection closed");
});

server.on('upgrade', function(req, socket, head){
    // The client handshake, all the necessary params
    // should be checked, but coders are lazy by nature
    // so we (you) just print them
    console.log(req.method, req.url, "HTTP", req.httpVersion);
    console.log(req.headers);

    // Build a handshake response according to the Spec.
    var magicstring = req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    var accepthash = new Buffer(crypto.createHash('sha1').update(magicstring).digest('base64'));

    //console.log("magicstring:", magicstring);

    socket.write("HTTP/1.1 101 Switching Protocols\r\n"
        + "Upgrade: websocket\r\n"
        + "Connection: Upgrade\r\n"
        + "Sec-Websocket-Accept:" + accepthash + "\r\n"
        + "Origin: http://"+host+"\r\n"
        + "\r\n");

    socket.on('data', function(data, start, end){
      console.log("data:", data)
    });
});

server.listen(port, host);

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
