// This module creates an event bus for the
// microtasker platform/
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

//var config = require('../config/worker');

var Eventizer = (function() {

  var _events = require('../events/');

  // Data is pushed from the websocket
  function push(message, socket, callback) {
    generateEvent(message, socket, callback);
  }

  // Get next event from _eventQueue
  function pop () {
    if (_prioEventQueue.length) {
      _prioEventQueue.shift(); 
    } 
    else {
      return _eventQueue.shift();
    }
  }

  function generateEvent(message, socket, callback) {
    //console.log("generate %s %s %s", message, socketId);
    // Compare user data to event schema
    if (undefined !== typeof message['message']) {
      if(undefined !== _events[message['message']]) {
        var ev = require('../events/' + message['message']);
        ee.emit(message['message'], message, socket, callback);
      }
      else {
        // Spam log
        var event = message['message'];
        console.log("no listener file '../events/%s' for event '%s'", 
                     event, event);
      }
    }
    else {
      console.log("'message' does not exist", message);
    }
  }

  // Bind all events when this module is loaded (IIFE)
  (function bindEvents() {
    Object.keys(_events).forEach(function(event) {
      ee.on(event.toString(), require('../events/'+event.toString()));
    });
  })();

  return{
    push: push,
    pop: pop
  }
})();

module.exports = Eventizer;