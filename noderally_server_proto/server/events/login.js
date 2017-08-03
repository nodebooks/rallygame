"use strict";

var cluster = require('cluster');
var Player = require('../model/player');

// Message schema
var schema = {
    message: String,
    username: String,
    password: String
  }

module.exports = function (message, handle, callback) {

  //console.log("worker%s executing %s event", 
  //            cluster.worker.id, message.message);

  if(check(message)) {
    executeEvent(message, callback);
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
    //console.log("ev '%s' running for %s ", message.message, message.username);

    var resp = false;

    Player.findOne({ 'username' : message.username}, function(err, player) {
      if(err) {
        console.log("something failed", err);
      }
      if(!err && player) {
        resp = player.isValidPassword(message.password);
        if(resp) {
          //console.log("username and password did match");
        }
        else {
          //console.log("password did not match");
        }
      }
      else {
        //console.log("Players.findOne player not found");
        err = "user not found";
      }
      message.response = resp;
      message.reason = err;
    });
    callback(message);
  }
};