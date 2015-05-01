var express = require('express');
var http = require('http');
var config = require('./server/config');

var app = express();

var port = config.serverport;
var host = config.serverip;

/* Simple HTTP server with */
/* public REST interface */
app.use(express.static(__dirname + '/server/public'));

// Set routes
var router = require('./server/routes');
app.use('/', router);

// Start server application
var server = http.createServer(app).listen(port);

// Start HTTP and websocket server
var websocket = require('./server/websocket')(server);

console.log("server running @ http://" + host + ":" + port);