const uuid = require('uuid4');
const Race = require('./race');
const WebSocket = require('ws');

let  _playerCount = 0;

class Lobby {
  constructor() {
    this._players = new Array(10000); // Allow only XXX players!
    this._races = new Array(10); // Allow only YYY races
    console.log("Lobby created", this._players.length);

    //INITIALIZE PROTO SERVER
    this.initProto();
  }

  initProto() {
    console.log("INITIALIZED FREE-FOR-ALL DRIVING, REMOVE THIS AFTERWARDS!")
     this._races[0] = new Race();
  }

  join(socket) {
    if(!this._players[socket.player.sid]) {
      _playerCount++;
      this._players[socket.player.sid] = socket;
    }

    // JOIN RACE AUTOMATICALLY AFTER AUTHENTICATION
    this._races[0].join(socket);
  }

  leave(socket) {
    if(socket.player.isVerified) {
      //console.log("player", socket.player, "left");
      _playerCount--;
      delete this._players[socket.player.sid];
    }
    else {
      console.log("socket was not verified");
    }
  }

  race(message, socket) {
    //console.log(socket.player.username, "is trying to", message.type, "race", message.hash);
    switch(message.type) {
      case 'join':
        break;
      case 'spectate':
        break;
      case 'create':
        break;
      default:
        console.log("undefined race type", message.type);
        break;
    }
  }

  handleMessage(message, socket) {
    //console.log("lobby received some message");

    // Socket is verified at this point
    switch(message.message) {
      case 'playerinput':
        break;
      case 'race':
        this.race(message, socket);
        break;
      default:
        break;
    }
  }

  stats() {
    var amount = 0;
    console.log("lobby has", _playerCount, "connected players");    
  }
}

module.exports = Lobby;