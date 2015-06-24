var cluster = require('cluster');
var os = require('os');

module.exports = {
  // Worker process configuration
  "process": {
    "title": "node_uworker" + cluster.worker.id
  },
  
  "cpus": os.cpus().length,

  "sockets": {
    "master": "/tmp/evmaster.sock",
    "worker": "/tmp/evworker" + cluster.worker.id + ".sock"
  },

  "http": {
    "port": 8080,
    "address": '127.0.0.1' //'192.168.43.251'
  },

  "eventizer": {
    "queue": {
      "maxlen": Math.pow(2,24)
    }
  }
}

