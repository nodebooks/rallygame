
"use strict";

var cluster = require('cluster');

// Remember to add your new events to ./index.js-file, e.g. exports = require('./example')
// TODO: Message schema, keep it simple
var schema = {
    message: String,
    username: String,
    trackname: String,
    track: String // Generated in response
  };

// This is generic stuff, don't touch
module.exports = function (message, callback) {
  //console.log("worker%s executing %s event", cluster.worker.id, message.message);

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

    message.track = require('../model/tracks/example');
    //console.log("loading track", message.track);
    message.response = true;  // Tag true/false (for success/failure)
    //message.reason = "Bad things happened because...";

    callback(message);
  }
};