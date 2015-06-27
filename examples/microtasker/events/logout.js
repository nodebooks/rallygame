"use strict";

var cluster = require('cluster');

// Message schema
var schema = {
    message: String,
    username: String,
    password: String
  }

module.exports = function (message, socket, callback) {

  console.log("worker%s executing logout event (%s times)", cluster.worker.id);

  if(check()) {
    console.log("ev %s running...", this);
  }
  else {
    console.log("ev %s failed", this);
  }

  function check() {
    Object.keys(schema).forEach(function(item) {
      if(undefined === message[schema[item]]) {
        return false;
      }
    });
    return true;
  }
}