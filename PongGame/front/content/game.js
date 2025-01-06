function attachEventListeners() {
    document.getElementById("local").addEventListener('click', function(event) {
        orignallocal = document.body.innerHTML;
        document.body.innerHTML = 
        `
            <div class="full">
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
                    <h1>Player1</h1>
                    <h1 id="score1" >0</h1>
                    <p id="test"></p>
                    <h1 id="score2">0</h1>
                    <h1>Player2</h1>
                    <img src="boy.png">
                </div>
    
                <canvas id="Game" width="700" height="350"></canvas>
            </div>
            </div>
            <div id="chat-log"></div>
        `
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
    
            if (keys.up == true && player.y + aiy > player.y - (canvas.height / 2) + paddleHeight / 2)
                aiy -= 5;
            if (keys.down == true && player.y + aiy < player.y + (canvas.height / 2) - paddleHeight / 2)
                aiy += 5
            if (keys.w == true && ai.y + py < ai.y + (canvas.height / 2) - paddleHeight / 2)
                py += 5;
            if (keys.s == true && ai.y + py > ai.y - (canvas.height / 2) + paddleHeight / 2)
                py -= 5;
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
                context.font = "50px Arial";
                context.fillStyle = "withe";  
    
                if(p1win == true)
                    context.strokeText("player1 win!", 200, 170);
                else
                    context.strokeText("player2 win!", 200, 170);
                setTimeout(function() {
                    document.body.innerHTML =  orignallocal
                    attachEventListeners()
                }, 2000); 
                return
            }
            requestAnimationFrame(gameLoop);
        }
    
        gameLoop()
    
    
    });

    document.getElementById("remote").addEventListener('click', function (event) {
        orignalremote = document.body.innerHTML;
        document.body.innerHTML = 
        `
        <div class="full">
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
        <script src="remote.js"></script>
        `
        function getAccessToken() {
            return fetch("/auth/get-access-token/", {
                method: "GET",
                credentials: "include",
            })
            .then(response => {
                if (!response.ok) 
                {
                    throw new Error("Failed to fetch access token");
                }
            
                return response.json();
            })
            .then(data => {
                if (data.access_token) {
                    return data.access_token
                } else {
                    console.log("Token is empty");
                    throw new Error("Access token not found");
                }
            })
            .catch(error => {
                console.error("Error fetching access token:", error);
            });
        }
        
        getAccessToken().then(token => {
            console.log(token)
            let chatSocket = new WebSocket(`/ws/game/?Token=${token}`);
            user = "--";
            other_user = "--";
            image = "";
            other_image = "";
            id = 0
            const canvas = document.getElementById("Game");
            const context = canvas.getContext("2d");
            
            
            function waiting() {
                document.body.innerHTML = `
				<div id="waiting">
                	<div class="circle"><img src="${image}"></div>
                	<p>vs</p>
                	<div class="circle"><img src="boy.png"></div>
				</div>
                `;
            }
        
        function nowait() {
            document.body.innerHTML = `
            <div class="full">
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
            <h1>${user}</h1>
            <h1 id="score1"  >0</h1>
            <p id="test"></p>
            <h1 id="score2">0</h1>
            <h1>${other_user}</h1>
            <img src="${other_image}">
            </div>
            
            <canvas id="Game" width="700" height="350"></canvas>
            <p>control the player by using up and down arrow keys</p>
            </div>
            </div>
            <script src="remote.js"></script>
            `;
        }
                
        function draw(context, canvas, ballx, bally, player1, player2) {  
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
        }
        
        chatSocket.onopen = function (event) {
            console.log("wait..................................");
        };
        
        chatSocket.onerror = (error) => {
            console.log("onerror enter");
            
            document.documentElement.innerHTML =
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="style.css">
            <link rel="stylesheet" href="play.css">
            <title>Document</title>
            </head>
            <body>
            <button id="remote_button"><h1>PLAY</h1></button>
            <script src="remote.js"></script>
            </body>
            </html>
            
            `
            console.log("onerror exit");
        };
    
        function winner(winner)
        {
            document.documentElement.innerHTML =
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="winner.css">
                <title>Document</title>
            </head>
            <body>
                <div id="winner">
                    <img src="${image}"/>
                    <p>${winner}</p>
                </div>
                
            </body>
            </html>
            
            `
        }
    
        chatSocket.onclose = (event) => {
            if (!event.wasClean) {
                console.error("WebSocket connection closed unexpectedly.");
            } else {
                console.log("WebSocket connection closed cleanly.");
            }
            setTimeout(function() {
                document.documentElement.innerHTML = 
                `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="game.css">
                    <title>pingpong</title>
                </head>
                <body>
                    <div id="holder">
                        <div>
                            <button id="local">local</button>
                        </div>
                        <div>
                            <button id="remote">remote</button>
                        </div>
                        <div>
                            <button id="tournament">tournament</button>
                        </div>
                    </div>
                    <script src="game.js"></script>
                </body>
                </html>
                `
                attachEventListeners()
            }, 2000); 
        };
        
        
        chatSocket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            console.log(data.TITLE)
            if (data.TITLE == "start") {
                
                console.log("[[[[",data.TITLE,"]]]]]]]")
                const dato = { TITLE: "play" };
                chatSocket.send(JSON.stringify(dato));
                
            }
            else if (data.TITLE == "gameloop") 
            {
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
                if (keys.up == true) 
                {
                    console.log("up true");
                    
                    const data = { TITLE: "move_player", player_direction: "up" };
                    chatSocket.send(JSON.stringify(data));
                }
                if (keys.down == true) 
                {
                    const data = { TITLE: "move_player", player_direction: "down" };
                    chatSocket.send(JSON.stringify(data));
                }
                document.getElementById("score1").innerHTML = data.score1;
                document.getElementById("score2").innerHTML = data.score2;
            }
            else if (data.TITLE == "wait") 
            {
                image = data.image
                waiting()
            }
            else if (data.TITLE == 'winner_send')
            {
                console.log("yes wslatni chkon rbah li howo ")
                if (data.winner == id)
                    winner("you win!");
                else 
                    winner("you lost!")
            }
            else if(data.TITLE == "id")
            {
                id = data.id
            }
            else if(data.TITLE == "username_id")
            {
                if (id != data.id)
                {
                    other_user = data.username
                    other_image = data.image
                }
                else 
                {
                    user = data.username
                    image = data.image
                }
                nowait()
            }

        };
                    
        function MovePlayer() {
            console.log("moveplaye function woe")
            if (keys.up == true) 
                {
                    const data = { TITLE: "move_player", player_direction: "up" };
                    chatSocket.send(JSON.stringify(data));
                }
                if (keys.down == true) 
                    {
                        const data = { TITLE: "move_player", player_direction: "down" };
                        chatSocket.send(JSON.stringify(data));
                    }
                    requestAnimationFrame(MovePlayer);
                }
                
                const keys = {
                    up: false,
                    down: false,
                };
    
                const goBackButton = document.getElementById("go_back");
                if (goBackButton) {
                    goBackButton.addEventListener('click', function (event) {
                        nowait();
                    });
                }
                
                
                window.addEventListener("keydown", function (event) 
                {
                    if (event.key === "ArrowUp") keys.up = true;
                    if (event.key === "ArrowDown") keys.down = true;
                });
                
                window.addEventListener("keyup", function (event) 
                {
                    if (event.key === "ArrowUp") keys.up = false;
                    if (event.key === "ArrowDown") keys.down = false;
                });
                            
        })
        .catch(error => {
                console.error("Error fetching access token:", error);
        })
    });

    document.getElementById("tournament").addEventListener('click', function (event) {
        origintournament = document.body.innerHTML ;
        document.body.innerHTML = 
        `
            <h1>Tournament Registration</h1>
            <form id="tournamentForm">
                <div>
                    <label for="Player1">Player1</label>
                    <input type="text" id="Player1" name="Player1" required>

                </div>

                <div>
                    <label for="Player2">Player2</label>
                    <input type="text" id="Player2" name="Player2" required>
                </div>
                
                <div>
                    <label for="Player3">Player3</label>
                    <input type="text" id="Player3" name="Player3" required>
                </div>
                
                <div>
                    <label for="Player4">Player4</label>
                    <input type="text" id="Player4" name="Player4" required>
                </div>

                <button  id="register_button" type="submit">Register</button>
            </form>
        `
		playerData = [];
		winer1 = ""
		winer2 = ""
		winer3 = ""
		  document
			.getElementById("tournamentForm")
			.addEventListener("submit", async function (event) {
			  event.preventDefault();
		
			  const formData = new FormData(event.target);
			  playerData[0] = formData.get("Player1");
			  playerData[1] = formData.get("Player2");
			  playerData[2] = formData.get("Player3");
			  playerData[3] = formData.get("Player4");
			  await tournament_table();
			});

		
		async function WinerFunction() {
		
			document.body.innerHTML = `
			<div id="winner">
				<img src="boy.png"/>
				<p>${winer3}</p>
			</div>
			`
			setTimeout(function() {
                document.documentElement.innerHTML = 
                `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="game.css">
                    <title>pingpong</title>
                </head>
                <body>
                    <div id="holder">
                        <div>
                            <button id="local">local</button>
                        </div>
                        <div>
                            <button id="remote">remote</button>
                        </div>
                        <div>
                            <button id="tournament">tournament</button>
                        </div>
                    </div>
                    <script src="game.js"></script>
                </body>
                </html>
                `
                attachEventListeners()
            }, 2000); 
		}
		
		async function tournament_table() {
		
		  document.body.innerHTML = `
						<div id="containe_all">
							<div id="first" >
								<div>
									<div class="player-box"><p>${playerData[0]}</p></div>
									<div class="player-box"><p>${playerData[1]}</p></div>
								</div>
								<div>
									<div class="player-box">${winer1}</div>
								</div>
								<div>
									<div class="player-box">${winer2}</div>
								</div>
								<div>
									<div class="player-box"><p>${playerData[2]}</p></div>
									<div class="player-box"><p>${playerData[3]}</p></div>
								</div>
							</div>
								<button id="play-tour">play</button>

						</div>
					`;
		  document.getElementById("play-tour").addEventListener("click", async (event) => {
			if (playerData[0] && playerData[1])
				{
					if(winer1 == "")
					{
				winer1 = await MakeMatch(playerData[0], playerData[1])
				console.log({ winer1 });
				await tournament_table()
					}
					else if(winer2 == "")
				{
				  winer2 = await MakeMatch(playerData[2], playerData[3])
				  console.log({ winer2 });
				  await tournament_table()
				}
				else if(winer3 == "")
				{
					winer3 = await MakeMatch(winer1, winer2)
					console.log({ winer3 });
					  await WinerFunction()
				}
						
			}
		  });
		}
		
		function MakeMatch(player1, player2) {
		  document.body.innerHTML = `
			<div class="full">
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
						<h1 id="score1" >0</h1>
						<p id="test">${player1} | ${player2}</p>
						<h1 id="score2">0</h1>
						<img src="boy.png">
					</div>
		
					<canvas id="Game" width="700" height="350"></canvas>
					<p>control the left player by using up and down arrow keys</p>
				</div>
			</div>
		
			`;
		
		  const canvas = document.getElementById("Game");
		  const context = canvas.getContext("2d");
		
		  const paddleWidth = 5,
			paddleHeight = 70;
		  const player = {
			x: 0,
			y: canvas.height / 2 - paddleHeight / 2,
			width: paddleWidth,
			height: paddleHeight,
			color: "#FFF",
		  };
		  const ai = {
			x: canvas.width - paddleWidth,
			y: canvas.height / 2 - paddleHeight / 2,
			width: paddleWidth,
			height: paddleHeight,
			color: "#FFF",
		  };
		
		  const ball = {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: 8,
			speed: 10,
			velocityX: 4,
			velocityY: 4,
			color: "withe",
		  };
		  xmove = 0;
		  ymove = 0;
		
		  p1win = false;
		  p2win = false;
		  py = 0;
		  aiy = 0;
		
		  const Escore1 = document.getElementById("score1");
		  const Escore2 = document.getElementById("score2");
		
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
			context.arc(
			  ball.x + xmove,
			  ball.y + ymove,
			  ball.radius,
			  0,
			  Math.PI * 2,
			  false
			);
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
		
		  ymove + ball.y > player.y + py &&
			ymove + ball.y < player.y + py + paddleHeight;
		
		  function MoveBall() {
			if (xmove + ball.x >= canvas.width - paddleWidth - 2 - 10) {
			  if (
				ymove + ball.y > ai.y + aiy &&
				ymove + ball.y < ai.y + aiy + paddleHeight
			  )
				step *= -1;
			  else {
				step = 1;
				xmove = 0;
				ymove = 0;
				py = 0;
				aiy = 0;
				score1 += 1;
				Escore1.innerHTML = score1;
				if (score1 == 3) p1win = true;
				console.log(score1, score2);
			  }
			}
			if (xmove + ball.x <= 0 + paddleWidth + 2 + 10) {
			  if (
				ymove + ball.y > player.y + py &&
				ymove + ball.y < player.y + py + paddleHeight
			  )
				step *= -1;
			  else {
				step = 1;
				xmove = 0;
				ymove = 0;
				py = 0;
				aiy = 0;
				score2 += 1;
				Escore2.innerHTML = score2;
				if (score2 == 3) p2win = true;
				console.log(score1, score2);
			  }
			}
			if (ymove + ball.y >= canvas.height) step2 *= -1;
			if (ymove + ball.y <= 0) step2 *= -1;
			xmove += step * ball.speed;
			ymove += step2 * ball.speed;
		  }
		
		  function MovePlayer() {
			if (
			  keys.up == true &&
			  player.y + py > player.y - canvas.height / 2 + paddleHeight / 2
			)
			  py -= 5;
			if (
			  keys.down == true &&
			  player.y + py < player.y + canvas.height / 2 - paddleHeight / 2
			)
			  py += 5;
			if (
			  keys.w == true &&
			  ai.y + aiy < ai.y + canvas.height / 2 - paddleHeight / 2
			)
			  aiy += 5;
			if (
			  keys.s == true &&
			  ai.y + aiy > ai.y - canvas.height / 2 + paddleHeight / 2
			)
			  aiy -= 5;
		  }
		
		  const keys = {
			up: false,
			down: false,
			w: false,
			s: false,
		  };
		
		  window.addEventListener("keydown", function (event) {
			if (event.key === "ArrowUp") keys.up = true;
			if (event.key === "ArrowDown") keys.down = true;
			if (event.key === "w") keys.s = true;
			if (event.key === "s") keys.w = true;
		  });
		
		  window.addEventListener("keyup", function (event) {
			if (event.key === "ArrowUp") keys.up = false;
			if (event.key === "ArrowDown") keys.down = false;
			if (event.key === "w") keys.s = false;
			if (event.key === "s") keys.w = false;
		  });
		
		
		
		  return new Promise((resolve) => {
			function gameLoop() {
			  MovePlayer();
			  MoveBall();
			  draw();
			  if (p1win == true || p2win == true) {
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.font = "50px Arial";
				context.fillStyle = "withe";
				if (p1win == true) {
				  context.strokeText(player1, 200, 170);
				  return resolve(player1);
				} else {
				  context.strokeText(player2, 200, 170);
				  return resolve(player2);
				}
			  }
			  requestAnimationFrame(gameLoop);
			}
			gameLoop();
		  })
		
		  
		}
		
    });
}

attachEventListeners()
