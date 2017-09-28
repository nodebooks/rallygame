"use strict";

const Lobby = require('./game/lobby');
const WebSocket = require('ws');
const uuid = require('uuid4');

const wssconfig = {
  'clientTracking': true,
  'port': 8080
}

// Set this as default to connected ws (ws.player = wsopts)
const wsopts = {
  isVerified: false,
  username: '',
  inGame: false,
  uuid: undefined,
  sid: undefined,
  location: {x: 1, y: 1},
  velocity: {x: 1, y: 1}
}

class GameServer {
  constructor() {
    this._connected = [];
    this._lobby = new Lobby();
    this._db = require('./lib/db');
    this._wss = new WebSocket.Server(wssconfig);

    console.log("Starting up noderally server...");
    this.init();
  }

  init() {
    console.log("Initializing websocket server");

    this._wss.on('connection', function connection(ws) {

      // Initialize socket with player data
      ws.player = JSON.parse(JSON.stringify(wsopts));
      ws.player.uuid = uuid();
      ws.player.sid = ws._ultron.id;

      ws.on('close', function() {
      });

      ws.on('error', function(error) {
        console.log("error in socket");
      });

      // Handle incoming data
      ws.on('message', function incoming(message) {
        // Messages are received as stringified objects
        // Convert and handle them as javascript objects internally
        gameserver._handleMessage(JSON.parse(message), ws);
      });
    });
  }

  _send(message, socket) {
    if(socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
  _broadcast(message) {
    //console.log("_broadcast");
    this._wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  _handleMessage(message, socket) {
    //console.log("got message", message);
    message.response = false;

    switch(message.message) {
      case 'login':
        //console.log("socket.player", socket.player, message);
        message.response = true;
        gameserver._send(message, socket);
        break;
      default:
        if(socket.player.isVerified) {
          gameserver._lobby.handleMessage(message, socket);
        }
        break;
    }
  }
}

var gameserver = new GameServer();