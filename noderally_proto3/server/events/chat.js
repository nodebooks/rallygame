var cluster = require('cluster');

module.exports = function (message, handle, callback) {
  //console.log("worker %s executing %s event", 
  //            cluster.worker.id, message.message, handle, callback);

  // return message to master for broadcast
  callback(message, handle);
};