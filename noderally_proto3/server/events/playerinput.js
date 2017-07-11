"use strict";

var cluster = require('cluster');

// Message schema
var schema = {
    message: String,
    username: String,
    direction: String
  };

module.exports = function (message, handle, callback) {

  //console.log("worker%s executing % event", cluster.worker.id);

  if(check(message)) {
    executeEvent(message, callback);
  }
  else {
    console.log("ev '%s' failed", message.message);
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
    // Do some calculations here - currently just wait 0-1 ms 
    // before sending response

    message.response = true;
    message.reason = "calculate sumthin";

    callback(message);
  }
};