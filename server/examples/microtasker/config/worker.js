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
    "port": 8080,
    "address": '127.0.0.1'
  },

  "eventizer": {
    "queue": {  // not implemented yet
      "maxlen": Math.pow(2,24)
    }
  }
}

