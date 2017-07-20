var Websocket = require('ws');

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
            type: "list",
            track: "example"
        }));
    }, 1000);
});

ws.on('close', function () {
    //console.log("socket closed");
});

ws.on('error', function (err) {
    console.log("error", err);
});

ws.on('message', function (message) {
    console.log("got message", JSON.parse(message));
    var msg = JSON.parse(message);
    if(msg.message === 'race') {
        if(msg.type === 'list') {
            for(let race in msg.races) {
                for (let player in msg.races[race].players) {
                    console.log(msg.races[race].players[player]);
                }
            }
        }
    }
});
