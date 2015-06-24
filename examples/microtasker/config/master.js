var os = require('os');

module.exports = {
  // Master process configuration
  "process": {
    "title": "node_umaster"
  },

  "cpus": os.cpus().length,
  
  "sockets": {
    "master": "/tmp/evmaster.sock"
  },

  "worker": {
    "file": "./lib/worker.js"
  }
};
