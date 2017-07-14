var Websocket = require('ws');
var uuid = require('uuid4');
var matchId = uuid();

var ws = new Websocket('ws://localhost:8000');

ws.on('open', function () {
    console.log("websocket opened");

    // Send login message
    ws.send(JSON.stringify({
        message: "login",
        username: "player1",
        password: "test1234",
    }));

    let happen = setTimeout(function() {
        // Send test message
        ws.send(JSON.stringify({
            message: "race",
            username: "player1",
            type: "create",
            track: "example", // Create a race with a specific map specified in model/tracks/*
            hash: ""
        }));
    }, 1000);
});

ws.on('close', function () {
    console.log("socket closed");
});

ws.on('error', function (err) {
    console.log("error", err);
});

ws.on('message', function (message) {
    var msg = JSON.parse(message);
    console.log("got message", msg);
    if(msg.message === 'sync') {
        if(msg.hash === matchId) {
        console.log("in sync");
        }
        else {
            console.log("lost sync - exit");
            process.exit(1);
        }
    }
});
