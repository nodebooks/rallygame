"use strict";

var mongoose = require('mongoose');
var config = require('../config/db');

var Database = (function() {
  console.log("trying to connect mongodb");
  var conn = mongoose.connect(config.url, config.opts).then(
    () => { console.log("mongodb connected") },
    err => { console.log("could not connect mongodb, reason", err);
             console.log("start MONGODB server with 'mkdir -p ~/data/db && mongod --dbpath ~/data/db'");
             process.exit(1); 
    }
  );

  mongoose.connection.on('connection', function() {
    console.log("mongodb connection '%s' is open", dbUrl);
  });

  mongoose.connection.on('error', function(err) {
    console.log("mongodb connection error: %s", err);
  });

  mongoose.connection.on('disconnect', function() {
    console.log("mongodb disconnected");
  });

  // If the Node process ends, close the Mongoose connection 
  process.on('SIGINT', function() {  
    mongoose.connection.close(function () { 
      console.log('Mongoose disconnected through server app termination'); 
      process.exit(0); 
    }); 
  }); 

  return mongoose;
})();

module.exports = Database;