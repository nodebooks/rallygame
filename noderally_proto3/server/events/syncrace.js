"use strict";

var cluster = require('cluster');

// Remember to add your new events to ./index.js-file, 
// e.g. exports = require('./example')
// TODO: Message schema, keep it simple
var schema = {
    message: String,
    hash: String,   // Should be match hash
    players: [Array]
};

// This is generic stuff, don't touch
module.exports = function (message, handle, callback) {
  //console.log("worker%s executing %s event", 
  //            cluster.worker.id, message.message);

  if(true === check(message)) {
    executeEvent(message, callback);
  }
  else {
    console.log("ev", message.message, "failed against schema");
  }

  // Also generic stuff - don't touch
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

  // TODO: Write your event code here
  function executeEvent(message, callback) {

    //console.log("example event here");
    message.response = false;  // Tag true/false (for success/failure)
    message.reason = "Bad things happened because...";

    // Send response, sync players, broadcast or 
    // do some other things - but don't hassle
    callback(message, handle);
  }
};