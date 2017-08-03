"use strict";

var cluster = require('cluster');

// Remember to add your new events to ./index.js-file, 
// e.g. exports = require('./example')
// TODO: Message schema, keep it simple
var schema = {
    message: String,
    username: String,
    type: String, // [create|join|spectate|list]
    hash: String, // Hash for the race to [create|join|spectate],
    races: Array
  };

// This is generic stuff, don't touch
module.exports = function (message, handle, callback) {
  //console.log("worker%s executing %s event", 
  //            cluster.worker.id, message.message);

  if(check(message)) {
    executeEvent(message, callback);
  }
  else {
    console.log("ev '%s' failed", message.message);
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

    // TODO: Allow only one active race per player
    switch(message.type) {
      case 'create':
        // TODO: create a new race
        //console.log("create new race on worker %s", cluster.worker.id);
      break;

      case 'join':
        // TODO: join a race
      break;

      case 'spectate':
        // TODO: spectate an ongoing race
      break;

      case 'list':
        // TODO: List ongoing races
      break;

      default:
        console.log("unable to handle event %s", message);
      break;
    }

    message.response = true;  // Tag true/false (for success/failure)
    message.reason = "Get ready to rumble!";

    callback(message);
  }
};
