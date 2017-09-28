var Websocket = require('ws');

var ws = new Websocket('ws://localhost:8000');

let hash = undefined;

ws.on('open', function () {
    console.log("websocket opened");

    // Send login message
    ws.send(JSON.stringify({
        message: "login",
        username: "player3",
        password: "test1234",
    }));

    let list = setTimeout(function() {
        // Send test message
        ws.send(JSON.stringify({
            message: "race",
            username: "player3",
            type: "list",
            track: "example"
        }));
    }, 500);

    let join = setTimeout(function() {
        console.log("trying to join race", hash);
        // Send test message
        ws.send(JSON.stringify({
            message: "race",
            username: "player3",
            type: "join",
            track: "example", // Create a race with a specific map specified in model/tracks/*
            hash: hash
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
    let msg = JSON.parse(message)
    console.log("got message", msg);
    if(msg.message === 'race') {
        if(msg.type === 'list') {
            console.log("found race", msg.track, "with hash", msg.races[0].hash);
            hash = msg.races[0].hash;
        }
    }
});
