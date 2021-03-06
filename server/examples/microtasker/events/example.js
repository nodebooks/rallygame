"use strict";

var cluster = require('cluster');

// Remember to add your new events to ./index.js-file, 
// e.g. exports = require('./example')
// TODO: Message schema, keep it simple
var schema = {
    message: String,
    username: String,
    attr1: String,
    attr2: Number
  };

// This is generic stuff, don't touch
module.exports = function (message, callback) {
  //console.log("worker%s executing %s event", 
  //            cluster.worker.id, message.message);

  if(check()) {
    executeEvent(message, callback);
  }
  else {
    console.log("ev '%s' failed", message.message);
  }

  // Also generic stuff - don't touch
  function check() {
    Object.keys(schema).forEach(function(item) {
      if(undefined === message[schema[item]]) {
        return false;
      }
    });
    return true;
  }

  // TODO: Write your event code here
  function executeEvent(message, callback) {

    //console.log("example event here");
    message.response = false;  // Tag true/false (for success/failure)
    message.reason = "Bad things happened because...";

    // Send response, sync players, broadcast or 
    // do some other things - but don't hassle
    callback(message);
  }
};