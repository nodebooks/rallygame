"use strict";
var WebSocket = require('ws');
var cluster = require('cluster');
var os = require('os');

var openSockets = 300;  // How many sockets to open per core
var sockets = [];

var msgs = [JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }),
            JSON.stringify({ message: 'chat', content: "Moro kaikille!" }),
            JSON.stringify({ message: 'playerinput', username: 'jaakko', direction: 'general' }),
            JSON.stringify({ message: 'newplayer', username: 'jaakko', password: 'test1234' })];

if(cluster.isMaster) {
  for(var x=0; x<3; x++){
    cluster.fork();
  }
}
else {
  setInterval(function() {
    if(sockets.length < openSockets) {
      var ws = new WebSocket('ws://127.0.0.1:8080');

      ws.on('open', function open() {
        ws.send(JSON.stringify({ message: 'newplayer', username: 'jaakko', password: 'test1234' }));
        //ws.send(JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }));
        this.open = true;
        sockets.push(ws);
        var tmo = setInterval(function() {
          //ws.send(msgs[Math.round(Math.random()*(msgs.length-1))]);
          ws.send(msgs[1]);
        }, 15);

      });

      ws.on('message', function(data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        //console.log("received %s", data);
        //console.log("flags:", flags);
        if(JSON.parse(data).message == 'chat') {
        }
        else {
          //console.log("some crap", data);
        }
      });

      ws.on('end', function() {
        this.open = false;
        this.end();
      });

      ws.on('error', function(err) {
        this.open = false;
      });
    }
  }, 200);
}


/*
function crashboom() {
  var tmo = setInterval(function() {
    sockets.forEach(function(ws) {
      if(ws.open === true) {
        //console.log(msgs[Math.round((Math.random())*2)]);
        setTimeout(function() {
          ws.send(msgs[Math.round((Math.random())*2)]);
        }, 0);
      }
    });
  }, 50);
}
*/

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
