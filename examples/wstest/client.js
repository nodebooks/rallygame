"use strict";
var WebSocket = require('ws');
var cluster = require('cluster');
var os = require('os');

var openSockets = 350;  // How many sockets to open per core

var msgs = [JSON.stringify({ message: 'newplayer', username: 'jaakko', password: 'test1234' }),
            JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }),
            JSON.stringify({ message: 'chat', content: "Moro kaikille!" }),
            JSON.stringify({ message: 'playerinput', username: 'jaakko', direction: 'general' }),
            JSON.stringify({ message: 'example', username: 'jaakko', attr1: 'test', attr2: 1234 })];

if(cluster.isMaster) {
  process.title = "node_tester_master";
  for(var x=0; x<3; x++){
    cluster.fork();
  }
}
else {
  process.title = "node_tester"+cluster.worker.id;
  setInterval(function() {
    if(openSockets > 0) {
      var ws = new WebSocket('ws://127.0.0.1:8080');

      ws.on('open', function () {
        openSockets--;
        ws.send(JSON.stringify({ message: 'newplayer', username: 'jaakko', password: 'test1234' }));
        //ws.send(JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }));
        this.open = true;
        var tmo = setInterval(function() {
          if(ws.open === true) {
            if(ws.readyState === ws.OPEN) {
              //ws.send(msgs[Math.round(Math.random()*(msgs.length-1))]);
              ws.send(msgs[4]);
            }
          }
        }, 15);
      });

      ws.on('message', function(data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        //console.log("received %s", data);
        //console.log("flags:", flags);
      });

      ws.on('end', function() {
        this.open = false;
        this.end();
        openSockets++;
      });

      ws.on('error', function(err) {
        this.open = false;
        this.end();
      });
    }
  }, 100);
}