"use strict";

var cluster = require('cluster');
var Player = require('../model/player');

// Message schema
var schema = {
    message: String,
    username: String,
    password: String
  }

module.exports = function (message, socket, callback) {

  //console.log("worker%s executing login event (%s times)", cluster.worker.id);

  if(check()) {
    executeEvent(message, socket, callback);
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

  // Write your event code here
  function executeEvent(message, socket, callback) {
    //console.log("ev '%s' running...", message.message);

    var retVal = false;

    Player.findOne({ "username" : message.username}, function(err, player) {
      if(!err) {
        retVal = player.isValidPassword(message.password);
        if(retVal) {
          //console.log("password match");
        }
        else {
          console.log("password did not match");
        }
      }
      else {
        console.log("Players.findOne failed:", err);
      }
      message.response = retVal;
      socket.write(socket.encodeMessage(JSON.stringify(message)));
    });
  }
};