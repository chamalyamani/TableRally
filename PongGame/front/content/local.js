


const canvas = document.getElementById("Game");
const context = canvas.getContext('2d');

const paddleWidth = 5, paddleHeight = 70;
const player = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
const ai = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };

const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speed: 6, velocityX: 4, velocityY: 4, color: 'withe' };
xmove = 0;
ymove = 0;

p1win = false
p2win = false
py = 0;
aiy = 0;

const Escore1 = document.getElementById("score1")
const Escore2 = document.getElementById("score2")

function draw() {

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height);


    context.fillStyle = player.color;
    context.fillRect(player.x + 5, player.y + py, player.width, player.height);

    context.fillStyle = ai.color;
    context.fillRect(ai.x - 5, ai.y + aiy, ai.width, ai.height);

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
score1 = 0;
score2 = 0;

ymove + ball.y > player.y + py && ymove + ball.y < player.y + py + paddleHeight

function MoveBall() {
    if (xmove + ball.x >= canvas.width - paddleWidth - 2 - 10)
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
            score1 += 1;
            Escore1.innerHTML = score1;
            if(score1 == 3)
                p1win = true
            console.log(score1, score2)

        }
    }
    if (xmove + ball.x <= 0 + paddleWidth + 2 + 10 )
    {
        if(ymove + ball.y > player.y + py && ymove + ball.y < player.y + py + paddleHeight)
            step *= -1;
        else{
            step = 1;
            xmove = 0;
            ymove = 0;
            py = 0;
            aiy = 0
            score2 += 1;
            Escore2.innerHTML = score2;
            if(score2 == 3)
                p2win = true
            console.log(score1, score2)
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
        py -= 5;
    if (keys.down == true && player.y + py < player.y + (canvas.height / 2) - paddleHeight / 2)
        py += 5
    if (keys.w == true && ai.y + aiy < ai.y + (canvas.height / 2) - paddleHeight / 2)
        aiy += 5;
    if (keys.s == true && ai.y + aiy > ai.y - (canvas.height / 2) + paddleHeight / 2)
        aiy -= 5;
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
    if(p1win == true || p2win == true)
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "50px Arial"; // Font size and family
        context.fillStyle = "withe";  // Text color

// Draw filled text
        // context.fillText("player1 win!", 200, 170);
        // context.strokeStyle = "red"; // Outline color
        // context.lineWidth = 2;       // Outline width
        if(p1win == true)
            context.strokeText("player1 win!", 200, 170);
        else
        context.strokeText("player2 win!", 200, 170);
        return;
    }
    requestAnimationFrame(gameLoop);
}

// context.clearRect(0, 0, canvas.width, canvas.height);
// context.font = "50px Arial"; // Font size and family
// context.fillStyle = "blue";  // Text color

// // Draw filled text
// context.fillText("player1 win!", 200, 170);
// // context.strokeStyle = "red"; // Outline color
// // context.lineWidth = 2;       // Outline width
// context.strokeText("player1 win!", 200, 170);
gameLoop()

