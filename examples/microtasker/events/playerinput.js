"use strict";

var cluster = require('cluster');


// Message schema
var schema = {
    message: String,
    username: String,
    direction: String
  };

module.exports = function (message, socket, callback) {

  //console.log("worker%s executing % event (%s times)", cluster.worker.id, message.message);

  if(check()) {
    executeEvent(message, socket, callback);
  }
  else {
    console.log("ev '%s' failed", message.message);
  }

  function check() {
    Object.keys(schema).forEach(function(item) {
      if(undefined === message[schema[item]]) {
        return false;
      }
    });
    return true;
  }

  // Write your event code here
  function executeEvent(message, socket, callback) {
    //console.log("ev '%s' running...", message.message);
    // Do some calculations here - currently just wait 0-1 ms before sending response

    setTimeout(function() {
    // TODO: Sync players (run race on master process for easy routing?)
    message.response = true;
    socket.write(socket.encodeMessage(JSON.stringify(message)));
    }, 0);
  }
};