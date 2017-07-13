var Websocket = require('ws');
var uuid = require('uuid4');

var ws = new Websocket('ws://localhost:8000');

ws.on('open', function () {
    console.log("websocket opened");
    // Send login message
    ws.send(JSON.stringify({
        message: "race",
        username: "player1",
        type: "spectate",
        track: "example", // Create a race with a specific map specified in model/tracks/*
        hash: "asdf-1234"
    }));
});

ws.on('close', function () {
    //console.log("socket closed");
});

ws.on('error', function (err) {
    console.log("error", err);
});

ws.on('message', function (message) {
    console.log("got message", JSON.parse(message));    
});
