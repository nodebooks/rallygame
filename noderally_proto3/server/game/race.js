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
  constructor() {
    
    this._started = new Date().getTime();  // Total duration
    this._length = 360; // Max duration in seconds
    this._attendees = new Array(10);
    this._spectators = new Array(100);
    this._uuid = uuid();

    this._init();
  }

  _init() {
    let interval = setInterval(function sync(players) {
      var playerstatuses = []; 
      for(const player in players) {
        playerstatuses.push(players[player].player);
      }

      for(const player in players) {
        if(players[player].readyState === WebSocket.OPEN) {
          players[player].send(JSON.stringify({
            "message": "sync",
            "hash": this.uuid,
            "players": playerstatuses
          }));
        }
      }
    }, 50, this._attendees );
  }

  join(socket) {
    console.log("joining the race");
    socket.on('message', function incoming(message) {
      console.log("asdfasdf");
    });

    this._attendees.push(socket);
  }

  _start() {
    console.log("new race started");
  }

  _end() {
    console.log("race finished in %s seconds", this.duration);
  }

  spectate(socket) {
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