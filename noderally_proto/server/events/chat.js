var cluster = require('cluster');

module.exports = function (message) {
  console.log("worker%s executing %s event", 
              cluster.worker.id, message.message);

  // return message to master for broadcast
  process.send(message);
};