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
    //this._races[0] = new Race();
  }

  join(socket) {
    if(!this._players[socket.player.sid]) {
      _playerCount++;
      this._players[socket.player.sid] = socket;
    }
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

  handleMessage(message, socket) {
    //console.log("lobby received some message");

    // Socket is verified at this point
    switch(message.message) {
      case 'race':
        this._race(message, socket);
        break;
      default:
        break;
    }
  }

  stats() {
    var amount = 0;
    console.log("lobby has", _playerCount, "connected players");    
  }

  _race(message, socket) {
    console.log(socket.player.username, "is trying to", message.type, "race", message.hash);
    switch(message.type) {
      case 'join':
        //this._races[0].join(message, socket);
        this._joinRace(message, socket);
        break;
      case 'spectate':
        this._spectateRace(message, socket);
        break;
      case 'create':
        this._createRace(message, socket);
        break;
      case 'list':
        this._listRaces(message, socket);
        break;
      case 'end_debug':
        this._endRace(message,socket);
        break;
      default:
        console.log("undefined race type", message.type);
        break;
    }
  }

  _joinRace(message, socket) {
    for(let race in this._races) {
      //console.log("race", this._races[race]);
      if (message.hash == this._races[race]._uuid) {
        console.log("race", message.hash, "found, joining it immediately");
        message.response = true;
        this._races[race].join(message, socket);
      }
    }
    socket.send(JSON.stringify(message));
  }

  _spectateRace(message, socket) {
    message.response = false;
    for(let race in this._races) {
      if (message.hash == this._races[race]._uuid) {
        message.response = true;
        console.log("found race, proceeding");
        this._races[race].spectate(message, socket);
      }
    }
    socket.send(JSON.stringify(message));
  }

  _createRace(message, socket) {
    message.response = false;
    try {
      var track = require('../model/tracks/' + message['track'] + '.json');
      console.log("track found, proceeding for sid", socket.player.sid);
      message.response = true;
      let race = new Race(message, socket);
      this._races[socket.player.sid] = race;
    }
    catch (e) {
      console.log("track'" + message.track + "' not found", e);
    }
    console.log("returning message");
    socket.send(JSON.stringify(message));
  }

  _listRaces(message, socket) {
    console.log("listing races");
    let races = [];
    for(let race in this._races) {
      races.push({
        "initiator": this._races[race]._initiator,
        "track": this._races[race]._track,
        "hash": this._races[race]._uuid,
        "players": this._races[race].getPlayers()
    });
    }
    message.races = races;
    message.response = true;

    socket.send(JSON.stringify(message));
  }

  _endRace(message, socket) {
    
  }
}

module.exports = Lobby;