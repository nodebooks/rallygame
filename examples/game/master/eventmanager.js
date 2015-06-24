"use strict";

// Create the interprocess communication channels.
var SocketManager = (function() {
  var cluster = require('cluster');
  var fs = require('fs');
  var net = require('net');
  var config = require('../config');
  /*
  var _eventEmitter = new (require('events').EventEmitter)();
  var _util = require('util');
  */

  init();

  function init() {
    (cluster.isMaster) ? configMaster() : configWorker();
  }

  function configMaster() {
    var path = config.socketopts.paths.master;

    console.log("setup socket for", path);
    fs.stat(path, function(err) {
        if (!err) fs.unlinkSync(path);
      var socketServer = net.createServer(function(socket) {
        socket.on('data', function(data) {
          console.log("master received data", data.toString('utf8'));
        });
      });

      socketServer.listen(path);
    });
  }

  function configWorker() {
    var client = net.createConnection(path);

    client.on("connect", function() {
      console.log("client", cluster.worker.id, "connected", path);
      client.write("hello master");
    });

    client.on("data", function(data) {
      console.log("client", cluster.worker.id, "received", data.toString('utf8'));
    });
  }

  function registerEvent(event, callback) {
    _eventEmitter.on(event, callback);
    //console.log("event '" + event +"' has", _util.inspect(_eventEmitter.listeners(event).length), "listeners");
  }

  return {
    registerEvent: registerEvent
  };
})();

module.exports = SocketManager;
