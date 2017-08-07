var cluster = require('cluster');
var os = require('os');

console.log("\n\033[91m");
console.log(":: Node.js cluster example ::");
console.log("::", os.type(), os.arch(), os.platform(), os.release(), "::");
console.log("::", os.cpus().length, "core/thread", os.cpus()[0].model, "|", 
            Math.floor(os.totalmem()/1024/1024), "RAM ::");
console.log("\033[0m");

// Setup cluster before forking, change setup per worker, if necessary
cluster.setupMaster({
  exec: './worker.js',
  args: ['--role', 'gameserver'],
  silent: false // Let slave log to stdout
});

// isMaster == true on master process, all the workers go to else-branch, 
// if 'exec'-param is not set. // In this example, the "exec: './worker.js'" 
// executes the code from worker.js-file.
if (cluster.isMaster) {
  // Fork new worker
  for (var i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    //console.log("Worker", worker.id, "is online.");
  });

  cluster.on('fork', function(worker) {
    //console.log("Worker", worker.id, "is forked.");
  });

  cluster.on('online', function(worker) {
    //console.log("Worker", worker.id, "is online.");
    var tmo = setTimeout(function() {
      worker.send("Nice to meet you worker " + worker.id);
    }, 1000);
  });

} 
else {
  // Worker gets here if 'exec'-param is not set here
  console.log("What shall we do, Master?");
}
