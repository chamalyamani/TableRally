let chatSocket;
let image;
let image2 = 'boy.png';
let id;

async function getAccessToken() {
  try {
    
    const response = await fetch("/auth/get-access-token/", {
      method: "GET",
      credentials: "include",
    });
    
    const data = await response.json();
    console.log(">>", data.access_token, "<<");
    if (data.access_token) {
      chatSocket = new WebSocket(`/ws/game/?Token=${data.access_token}`);
    } else {
      throw new Error("Access token not found");
    }
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}


getAccessToken()
.then(() => {    
    
    console.log("helo 6");
    
    function waiting() {
      document.documentElement.innerHTML = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="file.css">
</head>
<body>
    <div class="circle"><img src="${image}"></div>
    <p>vs</p>
    <div class="circle"><img src="boy.png"></div>
</body>
</html> 
      `;
    }

    function nowait() {
      document.documentElement.innerHTML = `
    <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Document</title>
</head>
<body>
    <div class="full">
        <div id="side">
            <div id="sidebar">
            </div>
        </div> 
        <div id="content">
            <div id="header">
                <h1>Game</h1>
                <div id="imges">
                    <img src="notification-bell.png">
                    <img src="${image}">
                </div>
            </div>
            <div id="score">
                <img src="${image}">
                <h1 id="score1"  >0</h1>
                <p id="test"></p>
                <h1 id="score2">0</h1>
                <img src="${image2}">
            </div>

            <canvas id="Game" width="700" height="350"></canvas>
            <p>control the player by using up and down arrow keys</p>
        </div>
    </div>
    <div id="chat-log"></div>
    <script src="remote.js"></script>

    
</body>
</html>
`;
    }

    function draw(context, canvas, ballx, bally, player1, player2) {
      // console.log("draw start");

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(0, 0, 0, 0.2)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#FFF";
      context.fillRect(5, player1, 5, 70);

      context.fillStyle = "#FFF";
      context.fillRect(canvas.width - 10, player2, 5, 70);

      context.fillStyle = "#FFF";
      context.beginPath();
      context.arc(ballx, bally, 8, 0, Math.PI * 2, false);
      context.fill();

      context.beginPath();
      context.setLineDash([4, 2]);
      context.moveTo(canvas.width / 2, 0);
      context.lineTo(canvas.width / 2, 350);
      context.lineWidth = 2;
      context.strokeStyle = "white";
      context.stroke();

      // console.log("draw end");
    }

    chatSocket.onopen = function (event) {
      console.log("wait..................................");

    //   waiting();
    };

    chatSocket.onerror = (error) => {
      console.log("onerror enter");
      
      document.documentElement.innerHTML =
      `
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="chose.css">
      <title>Document</title>
      </head>
      <body>
      <div id="holder">
      <a href="local.html">
      <div>
      <!-- <img src="local3.png"> -->
      <p>local</p>
      </div>
      </a> 
      <a href="remote.html">
      <div>
      <p>remote</p>
                <!-- <img id="remote" src="local3.png"> -->
            </div>
        </a>
        <a href="tournament.html">
        <div>
        <p>tournament</p>
                <!-- <img  src="local3.png"> -->
                </div>
                </a>
                </div>
</body>
</html>
`
console.log("onerror exit");

  };

  chatSocket.onclose = (event) => {
    if (!event.wasClean) {
        console.error("WebSocket connection closed unexpectedly.");
    } else {
        console.log("WebSocket connection closed cleanly.");
    }
};


    chatSocket.onmessage = function (event) {
      const data = JSON.parse(event.data);
	  console.log(data.TITLE, data.image)
      if(data.TITLE == "matching")
      {
        const data = { TITLE: "play"};
        chatSocket.send(JSON.stringify(data));      
      }
      else if (data.TITLE == "start") {
        if(data.image2 != image)
        {
          image2 = data.image2
        }
        nowait();
        
      }
      else if (data.TITLE == "gameloop") {
        const canvas = document.getElementById("Game");
        const context = canvas.getContext("2d");
        draw(
          context,
          canvas,
          data.ballx,
          data.bally,
          data.player1,
          data.player2
        );
        document.getElementById("score1").innerHTML = data.score1;
        document.getElementById("score2").innerHTML = data.score2;
      }
      else if (data.TITLE == "wait") {
		    image = data.image
        waiting()
      }
      else if(data.TITLE == "id")
        id = data.id
    };

    function MovePlayer() {
      // console.log("moveplaye function woe")
      if (keys.up == true) {
        const data = { TITLE: "move_player", player_direction: "up" };
        chatSocket.send(JSON.stringify(data));
      }
      if (keys.down == true) {
        const data = { TITLE: "move_player", player_direction: "down" };
        chatSocket.send(JSON.stringify(data));
      }
      requestAnimationFrame(MovePlayer);
    }

    const keys = {
      up: false,
      down: false,
    };

    window.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp") keys.up = true;
      if (event.key === "ArrowDown") keys.down = true;
    });

    window.addEventListener("keyup", function (event) {
      if (event.key === "ArrowUp") keys.up = false;
      if (event.key === "ArrowDown") keys.down = false;
    });
    document.getElementById('remote_button').addEventListener('click', function() {
      document.body.innerHTML =`
          <!-- <div class="full">
        <div id="side">
            <div id="sidebar">
            </div>
        </div> 
        <div id="content">
            <div id="header">
                <h1>Game</h1>
                <div id="imges">
                    <img src="notification-bell.png">
                    <img src="boy.png">
                </div>
            </div>
            <div id="score">
                <img src="boy.png">
                <h1 >0</h1>
                <p id="test"></p>
                <h1>0</h1>
                <img src="boy.png">
            </div>

            <canvas id="Game" width="700" height="350"></canvas>
            <p>control the left player by using up and down arrow keys</p>
        </div>
    </div>
    <div id="chat-log"></div> -->
    <script src="remote.js"></script>
      `

      MovePlayer();
  });
  
   
    console.log("WebSocket connection established:", chatSocket);
  })
  .catch((error) => {
    console.error("Error initializing WebSocket:", error);
  });
