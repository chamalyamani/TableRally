


const canvas = document.getElementById("Game");
const context = canvas.getContext('2d');

const paddleWidth = 5, paddleHeight = 70;
const player = { x: 5, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
const ai = { x: canvas.width - paddleWidth - 5, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };

const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speed: 4, velocityX: 4, velocityY: 4, color: 'withe' };
xmove = 0;
ymove = 0;


py = 0;
aiy = 0;

function draw() {

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height);


    context.fillStyle = player.color;
    context.fillRect(player.x , player.y + py, player.width, player.height);

    context.fillStyle = ai.color;
    context.fillRect(ai.x, ai.y + aiy, ai.width, ai.height);

    context.fillStyle = ball.color;
    context.beginPath();
    context.arc(ball.x + xmove, ball.y + ymove, ball.radius, 0, Math.PI * 2, false);
    context.fill();

    context.beginPath();
    context.setLineDash([4, 2]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, 350);
    context.lineWidth = 2;
    context.strokeStyle = "white";
    context.stroke();
}


step = 1;
step2 = 1;

ymove + ball.y > player.y + py && ymove + ball.y < player.y + py + paddleHeight

function MoveBall() {
    if (xmove + ball.x >= canvas.width - paddleWidth - 2 - 5 )
    {
        if(ymove + ball.y > ai.y + aiy && ymove + ball.y < ai.y + aiy + paddleHeight)
            step *= -1;
        else
        {
            step = 1;
            xmove = 0;
            ymove = 0;
            py = 0;
            aiy = 0
        }
    }
    if (xmove + ball.x <= 0 + paddleWidth + 2 + 5 )
    {
        if(ymove + ball.y > player.y + py && ymove + ball.y < player.y + py + paddleHeight)
            step *= -1;
        else{
            step = 1;
            xmove = 0;
            ymove = 0;
            py = 0;
            aiy = 0
        }
    }
    if (ymove + ball.y >= canvas.height)
        step2 *= -1;
    if (ymove + ball.y <= 0)
        step2 *= -1;
    xmove += step * ball.speed;
    ymove += step2 * ball.speed;
        
}

function MovePlayer() {

    if (keys.up == true && player.y + py > player.y - (canvas.height / 2) + paddleHeight / 2)
    {
        // py -= 1;
        const data = { message: "py-"};
        chatSocket.send(JSON.stringify(data));
    }
    if (keys.down == true && player.y + py < player.y + (canvas.height / 2) - paddleHeight / 2)
    {
        // py += 1
        const data = { message: "py+"};
        chatSocket.send(JSON.stringify(data));
    }
        
    // if (keys.w == true && ai.y + aiy < ai.y + (canvas.height / 2) - paddleHeight / 2)
    //     aiy += 1;
    // if (keys.s == true && ai.y + aiy > ai.y - (canvas.height / 2) + paddleHeight / 2)
    //     aiy -= 1;
}



const keys = {
    up: false,
    down: false,
    w: false,
    s: false
};

window.addEventListener("keydown", function (event) {
    if (event.key === 'ArrowUp') keys.up = true;
    if (event.key === 'ArrowDown') keys.down = true;
    if (event.key === 'w') keys.s = true;
    if (event.key === 's') keys.w = true;
});

window.addEventListener("keyup", function (event) {
    if (event.key === 'ArrowUp') keys.up = false;
    if (event.key === 'ArrowDown') keys.down = false;
    if (event.key === 'w') keys.s = false;
    if (event.key === 's') keys.w = false;
});

function gameLoop() {
    MovePlayer();
    MoveBall();
    draw();
    requestAnimationFrame(gameLoop);
}


function waiting()
{
    console.log("Im waiting")
    const x = document.getElementById("test")
    x.innerHTML = "<p>wait...........</p>"
}

function nowait()
{
    const x = document.getElementById("test")
    x.innerHTML = ""
}
waiting();

const chatSocket = new WebSocket('ws://' + 'localhost:8000' + '/ws/chat/');
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("{", data.game, "*}")
    if(data.game.message == "py-")
    {
        console.log("dkhlat")
        py -= 1
    }
    else if(data.game.message == "py+")
        py += 1
    else if(data.game.message == "ai+")
        aiy += 1
    else if(data.game.message == "ai-")
        aiy -= 1
    if(data.game == "start")
    {
        
        console.log("yes the game start! :: " , data.message)
        nowait();
        gameLoop();
    }
    else 
        console.log("wait ...............");

};

// chatSocket.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     console.log('Message from server:', data.postion);
//     if(data.message == 'ArrowUp')
//         py -= data.postion
//     else if(data.message == 'ArrowDown')
//         py += data.postion

// };

chatSocket.onopen =  function(event) {
    console.log("connected!");
    const data = { message: "Hello from the frontend!"};
    chatSocket.send(JSON.stringify(data));
};