var cluster = require('cluster');

module.exports = function (message, socket) {
  //console.log("worker%s executing %s event", cluster.worker.id, message.message);
  process.send(message);
}