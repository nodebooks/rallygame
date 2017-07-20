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
    this._attendees = new Array();
    this._spectators = new Array();

    this._started = new Date().getTime();  // Total duration
    this._length = 360; // Max duration in seconds
    this._syncInterval = 1000;
    this._maxPlayers = 2;

    this._init(message, socket);
  }

  _init(message, socket) {
    message.hash = this._uuid;

    // Make player also join the race
    this.join(message, socket);
  }

  _start(syncInterval, attendees, spectators, uuid) {
    console.log("starting new race", this._uuid);

    let frame = 0;

    let interval = setInterval(function (players, spectators, hash) {
      var playerstatuses = []; 
      for(const player in players) {
        playerstatuses.push(players[player].player);
      }

      // Synchronize attendees
      for(const player in players) {
        if(players[player].readyState === WebSocket.OPEN) {
          players[player].send(JSON.stringify({
            "message": "sync",
            "hash": hash,
            "players": playerstatuses,
            "frame": frame
          }));
        }
      }

      // Sync spectators if any
      for(const spectator in spectators) {
        if(spectators[spectator].readyState === WebSocket.OPEN) {
          spectators[spectator].send(JSON.stringify({
            "message": "sync",
            "hash": hash,
            "players": playerstatuses,
            "frame": frame
          }));
        }
      }
      frame++;
    }, syncInterval, attendees, spectators, uuid);
  }

  _end() {
    console.log("race finished in %s seconds", this.duration);
  }

  _multicast(data, playerList) {
    // Synchronise attendees
    for(const player in playerList) {
      if(playerList[player].readyState === WebSocket.OPEN) {
        playerList[player].send(JSON.stringify(data));
      }
    }
  }

  join(message, socket) {
    console.log("player", socket.player.username, "is joining the race", message.hash);
    socket.on('message', function incoming(message) {
      message = JSON.parse(message);
      switch(message.message) {
        case 'playerinput':
          console.log("received player input from", message.username);
          break;
        default:
          break;
      }
    });
    this._attendees.push(socket);

    // TODO: proper join & start
    if(this._attendees.length === this._maxPlayers) {
      console.log("all players joined, ready to start race");
      let raceStart = setTimeout(this._multicast, 1000, {"message":"race", "type":"start", "hash": this._uuid}, this._attendees);
      let gameSync = setTimeout(this._start, 3000, this._syncInterval, this._attendees, this._spectators, this._uuid);
    }
  }

  spectate(message, socket) {
    // Do not handle player inputs from spectators,
    // only send other players data to them
    this._spectators.push(socket);
  }

  getPlayers() {
    var players = [];
    for(let player in this._attendees) {
      players.push({ username: this._attendees[player].player.username });
    }
    return players;
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
        'username': this._attendees[player].player.username,
        'location': {"x": x, "y": y},
        'velocity': {"x": x, "y": y}
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