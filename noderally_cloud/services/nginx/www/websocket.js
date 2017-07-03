function connectLobby() {
    console.log("starting up websocket");

    var ws = new WebSocket("ws://lobby");

    ws.onopen = function (event) {
    console.log("websocket opened", ws);
    document.getElementById('pagedata').innerHTML = "websocket connected";

    // Send a control message as a JSON-formatted string.
    var msg = {
        message: 1,
        username: "jvanhalen",
        password: "¿hello world?"
    };

    ws.send(JSON.stringify(msg));
    };

    ws.onmessage = function (event) {
    console.log("data:", JSON.parse(event.data));
    };

    ws.onclose = function() {
    console.log("connection closed");
    };

    //return;
}