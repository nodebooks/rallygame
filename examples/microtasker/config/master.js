var os = require('os');

module.exports = {
  // Master process configuration
  "process": {
    "title": "node_umaster"
  },

  "cpus": os.cpus().length-1,

  "worker": {
    "file": "./lib/worker.js"
  }
};
