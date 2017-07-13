var Websocket = require('ws');

var ws = new Websocket('ws://localhost:8000');

ws.on('open', function () {
    console.log("websocket opened");
    // Send login message
    ws.send(JSON.stringify({
        message: "login",
        username: "player2",
        password: "test1234",
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
