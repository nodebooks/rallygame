"use strict";

// Start the master process
var master = new (require('./master/master'));
master.start();

var tasks = require('./tasks');

console.log(tasks.chat);
