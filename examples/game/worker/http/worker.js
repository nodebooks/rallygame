"use strict";

var express = require('express');
var net = require('net');
var http = require('http');
var config = require('../config');
var cluster = require('cluster');

var app = express();

var port = config.serverport;
var host = config.serverip;

// Configure HTTP server routes
var router = require('./http/routes');
app.use('/', router);

// Create HTTP server application
var server = http.createServer(app).listen(port);

// Bind HTTP upgrade for websocket (handshake)
var websocket = require('./http/websocket')(server);

// Allow public files 
//app.use(express.static(__dirname + 'server/webserver/public'));

process.title = config.workernameprefix + cluster.worker.id;