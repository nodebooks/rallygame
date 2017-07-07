"use strict";

var cluster = require('cluster');
var Player = require('../model/player');

// Message schema
var schema = {
    message: String,
    username: String,
    password: String
  };

module.exports = function (message, callback) {

  //console.log("worker%s executing event", cluster.worker.id);

  if(check()) {
    executeEvent(message, callback);
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
  function executeEvent(message, callback) {
    console.log("ev '%s' running...", JSON.stringify(message));
    
    var player = new Player({ username: message.username, 
                              password: message.password });

    player.save(function (err, player) {
      var resp = false;
      if(err) {
        console.log("ev '%s' failed in user creation...", message.message);
        resp = false;
      }
      else {
        console.log("ev '%s' user creation passed. New user '%s' created.", 
                    message.message, message.username);
        resp = true;
      }
      message.response = resp;
      message.reason = err;
      callback(message);
    }); 
  }
};