"use strict";

var WebSocket = require('ws');
var cluster = require('cluster');
var os = require('os');

var openSockets = 350;  // How many sockets to open per core

var rtt = {};

var msgs = [JSON.stringify({ message: 'newplayer', username: 'jaakko', password: 'test1234' }),
            JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }),
            JSON.stringify({ message: 'chat', content: 'Moro kaikille!' }),
            JSON.stringify({ message: 'playerinput', username: 'jaakko', direction: 'general' }),
            JSON.stringify({ message: 'example', username: 'jaakko', attr1: 'test', attr2: 1234 })];

if(cluster.isMaster) {

  process.title = "node_tester_master";
  for(var x=0; x<3; x++){
    cluster.fork();
  }
  //runTest();
}
else {
  process.title = "node_tester"+cluster.worker.id;
  runTest();
}

function runTest() {
  setInterval(function() {
    if(openSockets > 0) {
      var ws = new WebSocket('ws://192.168.43.251:8080');

      ws.on('open', function () {
        openSockets--;
        ws.send(JSON.stringify({ message: 'newplayer', username: 'jaakko', password: 'test1234'}));
        //ws.send(JSON.stringify({ message: 'login', username: 'jaakko', password: 'test1234' }));
        this.open = true;
        var tmo = setInterval(function() {
          if(ws.open === true) {
            if(ws.readyState === ws.OPEN) {
              var msg = msgs[Math.round(Math.random()*(msgs.length-1))];
              //ws.send(msg);
              ws.send((msgs[3]));
            }
          }
        }, 25);
      });

      ws.on('message', function(data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        //console.log("received %s", data);
        //console.log("flags:", flags);
        var obj = JSON.parse(data);
        if(obj.rtt) {
          rtt[obj.message] = process.hrtime(obj.rtt);
        }
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
  }, 150);
}

function runRtt() {
  var rttInterval = setInterval(function() {
    for(var item in rtt) {
      console.log(item + " " + (rtt[item][1]/1000/1000).toFixed(2) + " ms");
    }
  }, 5000);
}
