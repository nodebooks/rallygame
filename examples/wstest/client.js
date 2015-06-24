"use strict";
var WebSocket = require('ws');
var cluster = require('cluster');

var sockets = [];

if(cluster.isMaster) {
  for(var x=0; x<2; x++){
    cluster.fork();
  }
}
else {
  setInterval(function() {
    var ws = new WebSocket('ws://192.168.43.251:8080');

    ws.on('open', function open() {
      ws.send(JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }));
      this.open = true;
      sockets.push(ws);
    });

    ws.on('message', function(data, flags) {
      // flags.binary will be set if a binary data is received.
      // flags.masked will be set if the data was masked.
      console.log("received %s", data);
      //console.log("flags:", flags);
    });

    ws.on('end', function() {
      this.open = false;
      sockets.splice(this.id, 1);
      this.end();
    });

    ws.on('error', function(err) {
      this.open = false;
      sockets.splice(this.id, 1);
    });

    if(sockets.length == 100) {
      clearInterval(this);
      setTimeout(crashboom, 1000);
    }
  }, 50);
}

var count = 1;
function crashboom() {
  var tmo = setInterval(function() {
    sockets.forEach(function(ws) {
      if(ws.open == true) {
        ws.send(JSON.stringify({ message: 'chat', content: "Moro kaikille!" }));
      }
    });
    /*
    if(--count == 0) {
      clearInterval(this);
    }*/
  }, 15);
}




/*var http = require('http');
var cluster = require('cluster');
var cpus = require('os').cpus().length;

var ee = new (require('events').EventEmitter)();

process.title = 'nodewstest';

var str = {
  type:     "login",
  username: "jvanhalen",
  password: "¿hello world?"
};

var options = {
  port: 8080,
  hostname: '127.0.0.1',
  headers: {
    'Connection': 'Upgrade',
    'Upgrade': 'websocket'
  }
};

if(cluster.isMaster) {
  for(var x=0; x<cpus; x++) {
    console.log("forking")
    cluster.fork();
  }
}
else {
  ee.on('send', send);

  function send() {
    var req = http.request(options);
    req.end();

    req.on('upgrade', function(res, socket, upgradeHead) {
      //console.log('got upgraded!');
      socket.write(JSON.stringify(str));
      socket.end();

      socket.on('error', function() {
        console.log('error');
      });

      socket.on('end', function() {
        //console.log('end');
      });

      socket.on('close', function() {
        //console.log('close');
      });
      
      socket.on('data', function(chunk) {
        //console.log(chunk);
      });
    });
    var tmo = setTimeout(function() {
      ee.emit('send');
    }, 1000);
  }

  send();
}
*/