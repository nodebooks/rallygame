// This module creates an event bus for the
// microtasker platform/
var cluster = require('cluster');
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

var Eventizer = (function() {

  var _events = require('../events/');
  var _listeners = {};
  var _rrCount = 0;
  let _counter = 0;

  if(cluster.isMaster) {
    let tmo = setInterval(function() {
      console.log("resp buffer size", Object.keys(_listeners).length);
    }, 5000);
  }

  function push(message, handle, callback) {
    if(cluster.isMaster) {
      switch(message.message) {
        case 'chat':
        case 'playerinput':
        case 'race':
        // Run some events locally
          generateEvent(message, handle, callback);
          break;  
        default: 
          for(const worker in cluster.workers) {
            if(parseInt(worker) >= (_rrCount%Object.keys(cluster.workers).length+1)) {
              // Send message to worker and wait for answer
              cluster.workers[worker].send(message);
              message.socket = handle;
              _listeners[message.uuid] = message;
              _rrCount++;
              break;
            }
          }
          break;
      }
    }
    else {
      generateEvent(message, handle, callback);
    }
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

  function generateEvent(message, handle, callback) {
    //console.log("generate", message, "with callback", callback);
    // Compare user data to event schema
    if (undefined !== typeof message['message']) {
      if(undefined !== _events[message['message']]) {
        var ev = require('../events/' + message['message']);
        ee.emit(message['message'], message, handle, callback);
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

  function reply(message) {
    //console.log("got reply", message);

    switch(message.message) {
      case 'chat':
      case 'login':
      case 'logout':
      case 'playerinput':
      case 'newplayer':
      case 'race':
      case 'loadtrack':
      case 'example':
        if(_listeners.hasOwnProperty(message.uuid)) {
          let msg = _listeners[message.uuid];
          //console.log("sending", message);
          if(msg.socket.readyState === msg.socket.OPEN) {
            msg.socket.send(JSON.stringify(message));
          }
          _listeners[message.uuid];
        }
        else {
          console.log("no listener found");
        }
        break;
      default:
        console.log("response not recognized", _counter++);
        break;
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
    pop: pop,
    reply: reply
  }
})();

module.exports = Eventizer;