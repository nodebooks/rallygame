/* Simple HTTP server with */
/* public REST interface */
var express = require('express');
var http = require('http');
var config = require('./server/config');

var app = express();

var port = config.serverport;
var host = config.serverip;

// Configure HTTP server routes
var router = require('./server/routes');
app.use('/', router);

// Create server application
var server = http.createServer(app).listen(port);

// Bind specific HTTP server and websocket events (handshake)
var websocket = require('./server/websocket')(server);

// Allow public files 
app.use(express.static(__dirname + '/server/public'));

console.log("server running @ http://" + host + ":" + port);