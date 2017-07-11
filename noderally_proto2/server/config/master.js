var os = require('os');

module.exports = {
  // Master process configuration
  "process": {
    "title": "node_umaster"
  },

  "cpus": os.cpus().length,

  "worker": {
    "file": "./lib/worker.js"
  }
};
