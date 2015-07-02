"use strict";

var cluster = require('cluster');
var Player = require('../model/player');

// Message schema
var schema = {
    message: String,
    username: String,
    password: String
  }

module.exports = function (message, callback) {

  //console.log("worker%s executing %s event", 
  //            cluster.worker.id, message.message);

  if(check()) {
    executeEvent(message, callback);
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
  function executeEvent(message, callback) {
    //console.log("ev '%s' running...", message.message);
    Player.findOne({ "username" : message.username}, function(err, player) {
      var resp = false;

      if(!err && player) {
        resp = player.isValidPassword(message.password);
        if(resp) {
          //console.log("password match");
        }
        else {
          console.log("password did not match");
        }
      }
      else {
        console.log("Players.findOne failed:", err);
      }
      message.response = resp;
      message.reason = err;
      callback(message);
    });
  }
};