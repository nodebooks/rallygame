var os = require('os');

var showSetup = (function() {

  console.log("\n\033[91m");
  console.log(":: System setup ::");
  console.log("::", os.type(), os.arch(), os.platform(), os.release(), "::");
  console.log("::", os.cpus().length, "core/thread", os.cpus()[0].model, "|",
              Math.floor(os.totalmem()/1024/1024), "RAM ::");
  console.log(":: CPU load:", os.loadavg(), "::");
  console.log("\033[0m");
})();

module.exports = showSetup;