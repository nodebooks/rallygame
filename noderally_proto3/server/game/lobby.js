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
      default:
        console.log("undefined race type", message.type);
        break;
    }
  }

  _spectateRace(message, socket) {
    message.response = false;
    for(let race in this._races) {
      if(this._races[race].hash === message.hash) {
        message.response = true;
        console.log("found race, proceeding");
        this._races[race].spectate(message, socket);
      }
    }
  }

  _createRace(message, socket) {
    message.response = false;
    try {
      var track = require('../model/tracks/' + message['track'] + '.json');
      console.log("track found, proceeding");
      message.response = true;
      let race = new Race(message, socket);
      this._races.push(race._uuid);
    }
    catch (e) {
      console.log("track'" + message.track + "' not found", e);
    }
    console.log("returning message")
    socket.send(JSON.stringify(message));
  }

  _listRaces(message, socket) {
    console.log("listing races");
    let races = [];
    for(let race in this._races) {
      races.push({
        "initiator": this._races[race].initiator,
        "track": this._races[race].track,
        "hash": this._races[race]._uuid
    });
    }
    message.races = races;
    message.response = true;

    socket.send(JSON.stringify(message));
  }
}

module.exports = Lobby;