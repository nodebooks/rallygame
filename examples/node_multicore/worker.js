var cluster = require('cluster');

var workerId = cluster.worker.id;

console.log("Hello World from worker", workerId);

// Loop through the arguments
process.argv.forEach(function(val, index, array) {
  //console.log(index + ': ' + val);
});

process.on('message', function(msg) {
  console.log("Worker", workerId, "got message: ", msg);
//    process.send(msg);
});