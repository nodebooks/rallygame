"use strict";

var WebSocket = require('ws');
var cluster = require('cluster');
var os = require('os');


// Configurable options
var messageInterval = 25;
var openSocketInterval = 150;
var openSocketsMax = 50;  // How many sockets to open per core
var numProcesses = 1;


var openSockets = 0;  // How many sockets open currently (per core)
var eventCount = 0;

var msgs = [
  JSON.stringify({ message: 'newplayer', 
                   username: 'jaakko', password: 'test1234' }),
  JSON.stringify({ message: 'login', 
                   username: 'jaakko', password: 'test1234' }),
  JSON.stringify({ message: 'chat', 
                   content: 'Hello world!' }),
  JSON.stringify({ message: 'playerinput',
                   username: 'jaakko', direction: 'general' }),
  JSON.stringify({ message: 'example',
                   username: 'jaakko', attr1: 'test', attr2: 1234 })];

if(cluster.isMaster) {
  process.title = "node_tester_master";
  for(var x=1; x<numProcesses; x++){
    cluster.fork();
  }

  runTest();
  calculateEventReplies();
  Object.keys(cluster.workers).forEach(function(id) {
    cluster.workers[id].on('message', function(message, socket) {
      if(message === 'reply') {
        eventCount++;
      }
    });
  });
}
else {
  process.title = "node_tester" + cluster.worker.id;
  runTest();
}

function runTest() {
  console.log("started test process");

  // Open 'openSocketsMax' + few sockets
  setInterval(function() {
    if(openSocketsMax > openSockets) {
      var ws = new WebSocket('ws://127.0.0.1:8080');

      ws.on('open', function () {
        openSockets++;
        ws.send(JSON.stringify({ message: 'newplayer', 
                                 username: 'jaakko', 
                                 password: 'test1234'}));
        ws.open = true;
        var tmo = setInterval(function() {
          if(ws.open === true) {
            if(ws.readyState === ws.OPEN) {
              var msg = msgs[Math.round(Math.random()*(msgs.length-1))];
              ws.send(msg);
              //ws.send((msgs[2]));
            }
          }
        }, Math.round(Math.random()*messageInterval));
      });
      ws.on('close', function() {
        //console.log("socket close");
        ws.open = false;
        openSockets--;
      });
      ws.on('error', function(err) {
        console.log("error", err);
        ws.open = false;
        ws.close();
      });
      ws.on('message', function(message) {
        if(undefined !== process.send) {
          process.send('reply');
        }
        else {
          eventCount++;
        }
      });
    }
  }, openSocketInterval);
}

function calculateEventReplies() {
  var eventCountMax = 0;
  var prevEventCount = 0;

  var interv = setInterval(function() {
    var currentCount = (eventCount-prevEventCount);
    if(currentCount > eventCountMax) {
      eventCountMax = currentCount;
    }
    console.log("messages/sec: %s (max: %s). Sockets open %s/%s", 
      currentCount, eventCountMax, openSockets, openSocketsMax);
    prevEventCount = eventCount;
  }, 1000);
}

