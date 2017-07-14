// This is the RACE instance which handles events: 
// input: calculate player action and syncronize with other players
// logout: end race, notify other players
// tmoRaceLength: Timeout for how long should the race run

// TODO-steps for game mechanics: 
// 1. check player inputs
// 2. calculate new position
// 3. synchronize players
const uuid = require('uuid4');
const WebSocket = require('ws');

class Race {
  constructor(message, socket) {
    this._initiator = socket ? socket.player.username : "server demo";
    this._track = message ? ((message.track) ? message.track : "example") : "example";
    this._uuid = message ? ((message.hash) ? message.hash : uuid()) : uuid();
    this._attendees = new Array(10);
    this._spectators = new Array(100);

    this._started = new Date().getTime();  // Total duration
    this._length = 360; // Max duration in seconds
    this._syncInterval = 1000;

    this._init(message, socket);
  }

  _init(message, socket) {

    message.hash = this._uuid;
    let frame = 0;
    // Join to race
    if(socket) {
      this._attendees.push(socket);
    }
    else {
      console.log("socket not defined, expecting this to be initiated by server");
    }

    let interval = setInterval(function (players, hash) {
      var playerstatuses = []; 
      for(const player in players) {
        playerstatuses.push(players[player].player);
      }

      for(const player in players) {
        if(players[player].readyState === WebSocket.OPEN) {
          players[player].send(JSON.stringify({
            "message": "sync",
            "hash": hash,
            "players": playerstatuses,
            "frame": frame++
          }));
        }
      }
    }, this._syncInterval, this._attendees, this._uuid);

    //console.log("created new race", JSON.stringify(this));
  }

  join(message, socket) {
    console.log("joining the race");
    socket.on('message', function incoming(message) {
      message = JSON.parse(message);
      switch(message.message) {
        case 'playerinput':
          console.log("received player input", message);
          break;
        default:
          break;
      }
    });

    this._attendees.push(socket);
  }

  _start() {
    console.log("new race started");
  }

  _end() {
    console.log("race finished in %s seconds", this.duration);
  }

  spectate(message, socket) {
    // Do not handle player inputs from spectators,
    // only send other players data to them
    this._spectators[socket.uuid] = socket;
  }

  _multicast(data, playerList) {
    for(const player in playerList) {
      if(playerList[player].readyState === WebSocket.OPEN) {
        playerList[player].send(JSON.stringify(data));
      }
    }
  }

  handleMessage(message, socket) {
    switch(message.message) {
      case 'playerinput':
        syncPlayers(socket.inGame);
        break;
      case 'loadtrack':
          loadTrack(message, socket);
        break;
      default:
        console.log("race default", message);
        break;
    }
  }

  sync() {
    var x=10, y=10;

    for(const player in this._attendees) {
      if(this._attendees[player].readyState === WebSocket.OPEN) {  
        this._attendees[player].send(JSON.stringify({
        // TODO: set points / vectors here
        'username': this._attendees[player].player.username,
        'location': {x, y},
        'velocity': {x, y}
        }));
      }
    }
  }

  loadTrack(message, socket) {
    message.track = require('../model/tracks/example');
    message.response = true;
    socket.send(JSON.stringify(message));
  }
}

module.exports = Race;