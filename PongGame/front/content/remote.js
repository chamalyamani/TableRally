// group_name = "";

// const paddleWidth = 5, paddleHeight = 70;
// const player1 = { x: 5, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
// const player2 = { x: canvas.width - paddleWidth - 5, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };

// const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speed: 4, velocityX: 4, velocityY: 4, color: 'withe' };

// function draw() {
    
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     context.fillStyle = "rgba(0, 0, 0, 0.2)";
//     context.fillRect(0, 0, canvas.width, canvas.height);


//     context.fillStyle = player1.color;
//     context.fillRect(player1.x , player1.y, player1.width, player1.height);

//     context.fillStyle = player2.color;
//     context.fillRect(player2.x, player2.y , player2.width, player2.height);

//     context.fillStyle = ball.color;
//     context.beginPath();
//     context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
//     context.fill();

//     context.beginPath();
//     context.setLineDash([4, 2]);
//     context.moveTo(canvas.width / 2, 0);
//     context.lineTo(canvas.width / 2, 350);
//     context.lineWidth = 2;
//     context.strokeStyle = "white";
//     context.stroke();
// }
// stepX = 1
// stepY = 1

// function MoveBall() 
// {
//         const data = {TITLE : "move_ball",}
//         chatSocket.send(JSON.stringify(data));
//     }
    
//     const keys = {
//             up: false,
//             down: false,
//         };
        
//         window.addEventListener("keydown", function (event) {
//                 if (event.key === 'ArrowUp') keys.up = true;
//                 if (event.key === 'ArrowDown') keys.down = true;
//             });
            
//             window.addEventListener("keyup", function (event) {
//                     if (event.key === 'ArrowUp') keys.up = false;
//                     if (event.key === 'ArrowDown') keys.down = false;
// });


// function MovePlayer()
// {
//     if (keys.up == true  )
//     {        
//         const data =  {TITLE : "move_player", player_direction : "up"}
//         chatSocket.send(JSON.stringify(data))
//     }
//     if (keys.down == true ) 
//     {
//         const data =  {TITLE : "move_player", player_direction : "down"}
//         chatSocket.send(JSON.stringify(data))
//     }
// }

// function gameLoop() {
//         MovePlayer();
//         MoveBall();
//         draw();
//     requestAnimationFrame(gameLoop);
// }




// chatSocket.onmessage = function(e) 
// {
    //         const data = JSON.parse(e.data);
    //     if(data.TITLE == "start")
    //     {
    //         group_name = data.message;
    //         nowait();
    //         const info = {
        //                 "TITLE" : "info",
        //                 "canvas_width" : canvas.width , 
        //                 "canvas_height" : canvas.height,
        //                 "paddleWidth" : paddleWidth,
        //                 "paddleHeight" : paddleHeight,
        //                 "player1" : player1, 
        //                 "player2" : player2,
//                 "ball" : ball,
//             }
//             chatSocket.send(JSON.stringify(info))
//             gameLoop();
//         }
//         else if(data.TITLE == "move_ball")
//         {
//             ball.x = data.ballX
//             ball.y = data.ballY

//         }
//         else if(data.TITLE == "move_player")
//         {
//             if(data.player == "player1")
//             player1.y = data.position
//         else
//             player2.y = data.position

//     }


// };






const chatSocket = new WebSocket('/ws/game/');
const canvas = document.getElementById("Game");
const context = canvas.getContext('2d');




function waiting()
{
    // const x = document.getElementById("test")
    // x.innerHTML = "wait.........."
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
    <div class="circle"><img src="boy.png"></div>
    <p>vs</p>
    <div class="circle"><img src="boy.png"></div>
</body>
</html> 
      `;


}

function nowait()
{
    // console.log("no wait");
    // const x = document.getElementById("test")
    // x.innerHTML = ""
    
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
                    <img src="boy.png">
                </div>
            </div>
            <div id="score">
                <img src="boy.png">
                <h1 id="score1"  >0</h1>
                <p id="test"></p>
                <h1 id="score2">0</h1>
                <img src="boy.png">
            </div>

            <canvas id="Game" width="700" height="350"></canvas>
            <p>control the player by using up and down arrow keys</p>
        </div>
    </div>
    <div id="chat-log"></div>
    <script src="remote.js"></script>

    
</body>
</html>
`

}


function draw(context, canvas,ballx, bally, player1, player2) {
    // console.log("draw start");
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height);


    context.fillStyle = '#FFF';
    context.fillRect(5 , player1, 5, 70);

    context.fillStyle = '#FFF';
    context.fillRect(canvas.width - 10, player2, 5, 70);

    context.fillStyle = '#FFF';
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




chatSocket.onopen =  function(event) {
    console.log("wait");
    
    waiting();
};

chatSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if(data.TITLE == "start")
    {

        nowait();
    }
    if(data.TITLE == "gameloop")
    {
        const canvas = document.getElementById("Game");
        const context = canvas.getContext('2d');        draw(context, canvas, data.ballx, data.bally, data.player1, data.player2)
        document.getElementById("score1").innerHTML = data.score1
        document.getElementById("score2").innerHTML = data.score2
    }

}

function MovePlayer()
{

        // console.log("moveplaye function woe")
        if (keys.up == true  )
        {        
            const data =  {TITLE : "move_player", player_direction : "up"}
            chatSocket.send(JSON.stringify(data))
        }
        if (keys.down == true ) 
        {
            const data =  {TITLE : "move_player", player_direction : "down"}
            chatSocket.send(JSON.stringify(data))
        }
        requestAnimationFrame(MovePlayer)
}

const keys = {
    up: false,
    down: false,
};

window.addEventListener("keydown", function (event) {
    if (event.key === 'ArrowUp') keys.up = true;
    if (event.key === 'ArrowDown') keys.down = true;
});
    
window.addEventListener("keyup", function (event) {
    if (event.key === 'ArrowUp') keys.up = false;
    if (event.key === 'ArrowDown') keys.down = false;
});

MovePlayer();