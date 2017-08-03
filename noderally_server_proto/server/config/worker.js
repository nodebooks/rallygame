var cluster = require('cluster');
var os = require('os');

module.exports = {
  // Worker process configuration
  "process": {
    "title": "node_uworker" + cluster.worker.id
  },

  "socket": {
    "opts": {
      "allowHalfOpen": false,
      
    }
  },

  "http": {
    "port": 8000,
    "address": 'rallyserver'
  },

  "eventizer": {
    "queue": {  // not implemented yet
      "maxlen": Math.pow(2,24)
    }
  }
}

