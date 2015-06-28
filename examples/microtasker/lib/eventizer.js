// This module creates an event bus for the
// microtasker platform/
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

var config = require('../config/worker');

var Eventizer = (function() {

  var _events = require('../events/');

  // Push data from websocket
  function push(message, socket) {
    generateEvent(message, socket);
    process.send('eventCount');
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

  function generateEvent(message, socket) {
    // Compare user data to event schema
    if (undefined !== typeof message['message']) {
      if(undefined !== _events[message['message']]) {
        var ev = require('../events/' + message['message']);
        ee.emit(message['message'], message, socket);
      }
      else {
        // Spam log
        var event = message['message'];
        console.log("no listener file '../events/%s' for event '%s'", event, event);
      }
    }
    else {
      console.log("'message' does not exist", message);
    }
  }

  function evReturn(message, socket) {
    if(socket) {
      socket.write(encodeMessage(JSON.stringify({'message': 'passed'})));
    }
  }

  // Bind all events when this module is loaded (IIFE)
  (function bindEvents() {
    Object.keys(_events).forEach(function(event) {
      ee.on(event.toString(), require('../events/'+event.toString()));
      //ee.on(event.toString(), justTesting);
    });
  })();

  function encodeMessage (data){
    var len = data.length;
    var message = [];
    // Set header to text frame
    message[0] = 129;
    // Calculate payload data length and format message accordingly
    if(len <= 125) {
      message[1] = len;
    }
    else if (len >= 126 && len < 65535) {
      message[1] = 126; 
      message[2] = (len >> 8) & 255;
      message[3] = len & 255;
    }
    else {
      message[1] = 127;
      for(var x=1; x<=8;x++) {
        message[x] = (len >> 64 - x*8) & 255;
      }
    }
    // Create a buffer object 
    var buffer = new Buffer(message.length + data.length);
    // Copy header 
    for (var i = 0; i < message.length; i++){
      buffer[i] = message[i];
    }
    // Copy payload data
    for (var j=0; j<len; j++) {
      buffer[i+j] = data.charCodeAt(j);
    }
    return buffer;
  }

  function justTesting() {
    var x = 1;
    x++;
  }
  return{
    push: push,
    pop: pop
  }
})();

module.exports = Eventizer;