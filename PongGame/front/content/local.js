


const canvas = document.getElementById("Game");
const context = canvas.getContext('2d');

const paddleWidth = 5, paddleHeight = 70;
Player1 = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
Player2 = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };

ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speed: 6, velocityX: 4, velocityY: 2, color: 'withe' };

p1win = false
p2win = false

const Escore1 = document.getElementById("score1")
const Escore2 = document.getElementById("score2")

function draw() {

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height);


    context.fillStyle = Player1.color;
    context.fillRect(Player1.x, Player1.y , Player1.width, Player1.height);

    context.fillStyle = Player2.color;
    context.fillRect(Player2.x, Player2.y, Player2.width, Player2.height);

    context.fillStyle = ball.color;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    context.fill();

    context.beginPath();
    context.setLineDash([4, 2]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, 350);
    context.lineWidth = 2;
    context.strokeStyle = "white";
    context.stroke();
}


step1 = 1;
step2 = 1;
score1 = 0;
score2 = 0;

function MoveBall() {

    if (ball.x + 10 >= canvas.width - paddleWidth)
    {
        if(ball.y + 10 > Player2.y && ball.y - 10 < Player2.y + paddleHeight)
        {
            step1 *= -1;
            if(ball.y > Player2.y + paddleHeight / 2)
            {
                ball.velocityX += 0.1
                ball.velocityY -= 0.1
            }
            else {
                ball.velocityX -= 0.1
                ball.velocityY += 0.1
            }
        }
        else
        {
            step1 = 1;
            ball.x = canvas.width / 2
            ball.y = canvas.height / 2
            Player1.y = canvas.height / 2 - paddleHeight / 2
            Player2.y = canvas.height / 2 - paddleHeight / 2
            score1 += 1;
            Escore1.innerHTML = score1;
            if(score1 == 3)
                p1win = true
        }
    }
    if (ball.x - 10 <= paddleWidth )
    {
        if(ball.y  + 10 > Player1.y && ball.y - 10 < Player1.y + paddleHeight)
        {
            step1 *= -1;
            if(ball.y > Player1.y + paddleHeight / 2)
                {
                    ball.velocityX += 0.1
                    ball.velocityY -= 0.1
                }
                else {
                    ball.velocityX -= 0.1
                    ball.velocityY += 0.1
                }
        }
        else{
            step1 = 1;
            ball.x = canvas.width / 2
            ball.y = canvas.height / 2
            Player1.y = canvas.height / 2 - paddleHeight / 2
            Player2.y = canvas.height / 2 - paddleHeight / 2
            score2 += 1;
            Escore2.innerHTML = score2;
            if(score2 == 3)
                p2win = true
        }
    }
    if (ball.y + 10 >= canvas.height)
        step2 *= -1;
    if (ball.y - 10 <= 0)
        step2 *= -1;
    ball.x += step1 * ball.velocityX;
    ball.y += step2 * ball.velocityY;
        
}

function MovePlayer() {

    if (keys.up == true && Player2.y - 5 >= 0 )
        Player2.y -= 5;
    if (keys.down == true && Player2.y + 5 <= canvas.height - paddleHeight)
        Player2.y += 5
    if (keys.w == true && Player1.y - 5 >= 0 )
        Player1.y -= 5;
    if (keys.s == true && Player1.y + 5 <= canvas.height - paddleHeight)
        Player1.y += 5;
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
    if (event.key === 'w') keys.w = true;
    if (event.key === 's') keys.s = true;
});

window.addEventListener("keyup", function (event) {
    if (event.key === 'ArrowUp') keys.up = false;
    if (event.key === 'ArrowDown') keys.down = false;
    if (event.key === 'w') keys.w = false;
    if (event.key === 's') keys.s = false;
});

function gameLoop() {
    MovePlayer();
    MoveBall();
    draw();
    if(p1win == true || p2win == true)
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "50px Arial";
        context.fillStyle = "withe";
        if(p1win == true)
            context.strokeText("Player1 win!", 200, 170);
        else
        context.strokeText("player2 win!", 200, 170);
        return;
    }
    requestAnimationFrame(gameLoop);
}

gameLoop()

