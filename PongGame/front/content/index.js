const chatSocket = new WebSocket('ws://' + 'localhost:8000' + '/ws/chat/');

chatSocket.onopen =  function(event) {
    console.log("connected!");
    // const data = { message: "Hello from the frontend!"};
    // chatSocket.send(JSON.stringify(data));
};


chatSocket.onmessage = function(event) {
    const response = JSON.parse(event.data);
    console.log("Message from server:", response);
    
}

// socket.onclose = function(event) {
//     console.log("WebSocket is closed now.");
// };

// socket.onerror = function(error) {
//     console.error("WebSocket error:", error);
// };