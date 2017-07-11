"use strict";

var cluster = require('cluster');

// Message schema
var schema = {
    message: String,
    username: String,
    password: String
  }

module.exports = function (message, handle, callback) {

  //console.log("worker%s executing logout event", cluster.worker.id);

  if(check(message)) {
    console.log("ev %s running...", this);
  }
  else {
    console.log("ev %s failed", this);
  }

  function check(message) {
    var ret = true;
    Object.keys(schema).forEach(function(item) {
      if(!message.hasOwnProperty(item)) {
        console.log("message", JSON.stringify(message), "has not defined item", item);
        ret = false;
      }
    });
    return ret;
  }

  // Write your event code here
  function executeEvent(message, callback) {
    //console.log("ev '%s' running...", message.message);
    message.response = true;
    callback(message);
  }
}