import { updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { logoutProcess } from "../shared.js";

let player_tour1 = "test1"
let player_tour2 = "test2"
function globalNotifPopup(type = "Success", message = "Your changes have been saved") {
  const toast = document.querySelector(".toast");
  const closeIcon = toast.querySelector(".close");
  const progress = toast.querySelector(".progress");
  const notifType = toast.querySelector("#notif-type");
  const notifMessage = toast.querySelector("#notif-message");

  const iconSuccess = toast.querySelector(".icon-circle-success");
  const iconError = toast.querySelector(".icon-circle-error");

  let timer1, timer2;

  // Réinitialisation du texte de la notification
  notifType.textContent = type;
  notifMessage.textContent = message;

  // Cacher les cercles au départ
  iconSuccess.style.display = "none";
  iconError.style.display = "none";

  progress.style.backgroundColor = 'transparent';

  // Afficher le cercle correspondant en fonction du type
  if (type === "Error") {
    iconError.style.display = "flex";  // Afficher cercle rouge pour erreur
    notifType.style.color = "#f44040";  // Afficher cercle rouge pour erreur
    progress.style.backgroundColor = '#f44040';
  }
  else if (type === "Warning") 
  {
    notifType.style.color = "#E49B0F";
    progress.style.backgroundColor = '#E49B0F';
  }
  else {
    iconSuccess.style.display = "flex";  // Afficher cercle vert pour succès
    notifType.style.color = "#4CAF50";
    progress.style.backgroundColor = '#4CAF50';
  }

  // Activer la toast et la barre de progression
  toast.classList.add("active");
  progress.classList.add("active");

  // Timer pour retirer la toast après 5 secondes
  timer1 = setTimeout(() => {
    toast.classList.remove("active");
  }, 5000);

  // Timer pour retirer la barre de progression après 5.3 secondes
  timer2 = setTimeout(() => {
    progress.classList.remove("active");
  }, 5300);

  // Fermeture de la notification au clic sur la croix
  closeIcon.addEventListener("click", () => {
    toast.classList.remove("active");

    setTimeout(() => {
      progress.classList.remove("active");
    }, 300);

    clearTimeout(timer1);
    clearTimeout(timer2);
  });
}
let chatSocket = null;
function callremote(other_id, shadowRoot)
  {
    let orignalremote = shadowRoot.getElementById("myContainer").innerHTML;
    shadowRoot.getElementById("myContainer").innerHTML = 
    `
    <div class="full">
        <div id="content">
            <div class="remote-score" id="score">
               <div id="score">
              <div class="team team1">
              <h1>PLAYER 1</h1>
              </div>
              
              <div class="score-center">
              <h1 id="score1">0</h1>
              <span>-</span>
              <h1 id="score2">0</h1>
              </div>
              
              <div class="team team2">
              <h1>PLAYER 2</h1>
              </div>
              </div>
            </div>
            <canvas id="Game" width="700" height="350"></canvas>
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
                throw new Error("Access token not found");
            }
        })
        .catch(error => {
            console.error("Error fetching access token:", error);
        });
    }
    
    getAccessToken().then(token => {
        chatSocket = new WebSocket(`/ws/game/?Token=${token}&ID=${other_id}`);
        let user = "--";
        let other_user = "--";
        let image = "";
        let other_image = "";
        let id = 0
        const canvas = shadowRoot.getElementById("Game");
        const context = canvas.getContext("2d");
        
        
        function waiting(your_user) {
            shadowRoot.getElementById("myContainer").innerHTML = `

              <div class="lobby-waiting" id="waiting">
              <div class="content-waiting">
                  <div class="player player1">
                      <img src="${image}">
                      <h2>${your_user}</h2>
                  </div>
                      <div class="loader-loading"></div>
                  <div class="player player2">
                      <img src="assets/player2.png">
                      <h2>PLAYER 2</h2>
                  </div>
              </div>
          </div>
            `;
        }
    
    function nowait() {
        shadowRoot.getElementById("myContainer").innerHTML = `

        <div class="full">
        <div id="content">

        <div id="score">
        <div class="team team1">
        <img src="${image}">
        <h1>${user}</h1>
        </div>
        
        <div class="score-center">
        <h1 id="score1">0</h1>
        <span>-</span>
        <h1 id="score2">0</h1>
        </div>
        
        <div class="team team2">
        <img src="${other_image}">
        <h1>${other_user}</h1>
        </div>
        </div>

          <div id="game-container">
          <div class="instructions-box left">
          <p>Use: <span>⬆⬇</span></p>
          </div>
          <canvas id="Game" width="700" height="350"></canvas>
          <div class="instructions-box right">
          <p>Use: <span>⬆⬇</span></p>
          </div>
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

    };
    
    chatSocket.onerror = (error) => {
        
        shadowRoot.getElementById("myContainer").innerHTML =
        `
        <h1>something worng try later</h1>          
        `
        setTimeout(function() {
          shadowRoot.getElementById("myContainer").innerHTML = 
          `
               <div id="holder" class="holder">
              <h1>Choose your game mode</h1>
              <div class="modes">
                <div class="local-mode" id="local">
                  <div class="icon">
                    <img src="assests/icon-local.png">
                  </div>
                  <div class="go-local">
                    <p>Local</p>
                  </div>
                </div>
                <div class="remote-mode"  id="remote">
                  <div class="icon">
                    <img src="assests/icon-remote.png">
                  </div>
                  <div class="go-remote">
                    <p>Remote</p>
                  </div>
                </div>
                <div class="tournament-mode" id="tournament">
                  <div class="icon">
                    <img src="assests/icon-tournoi.png">
                  </div>
                  <div class="go-tournament" >
                    <p>Tournament</p>
                  </div>
                </div>
              </div>
            </div>
          `
          attachEventListeners(shadowRoot)
      }, 2000); 
    };

    function winner(winner)
    {
        shadowRoot.getElementById("myContainer").innerHTML =
        `

        <div class="content-winner">
            <div id="winner">
              <div class="crown"></div>
              <img src="${image}">
              <p>${winner}</p>
            </div>
          </div>
        
        `
    }

    function lost(winner)
    {
        shadowRoot.getElementById("myContainer").innerHTML =
        `
          <div class="content-lose">
            <div id="lost">
              <div class="rejected"></div>
              <img src="${image}">
              <p>${winner}</p>
          </div>
          </div>
        
        `
    }

    chatSocket.onclose = (event) => {
        if (!event.wasClean) {
            console.error("WebSocket connection closed unexpectedly.");
        }
        setTimeout(function() {
            shadowRoot.getElementById("myContainer").innerHTML = 
            `
                <div id="holder" class="holder">
              <h1>Choose your game mode</h1>
              <div class="modes">
                <div class="local-mode" id="local">
                  <div class="icon">
                    <img src="assests/icon-local.png">
                  </div>
                  <div class="go-local">
                    <p>Local</p>
                  </div>
                </div>
                <div class="remote-mode"  id="remote">
                  <div class="icon">
                    <img src="assests/icon-remote.png">
                  </div>
                  <div class="go-remote">
                    <p>Remote</p>
                  </div>
                </div>
                <div class="tournament-mode" id="tournament">
                  <div class="icon">
                    <img src="assests/icon-tournoi.png">
                  </div>
                  <div class="go-tournament" >
                    <p>Tournament</p>
                  </div>
                </div>
              </div>
            </div>
            `
            attachEventListeners(shadowRoot)
        }, 2000); 
    };
    
    
    chatSocket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.TITLE == "start") {
            const dato = { TITLE: "play" };
            chatSocket.send(JSON.stringify(dato));
            
        }
        else if (data.TITLE == "gameloop") 
        {
            const canvas = shadowRoot.getElementById("Game");
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
                
                const data = { TITLE: "move_player", player_direction: "up" };
                chatSocket.send(JSON.stringify(data));
            }
            if (keys.down == true) 
            {
                const data = { TITLE: "move_player", player_direction: "down" };
                chatSocket.send(JSON.stringify(data));
            }
            shadowRoot.getElementById("score1").innerHTML = data.score1;
            shadowRoot.getElementById("score2").innerHTML = data.score2;
        }
        else if (data.TITLE == "wait") 
        {
            image = data.image
            let your_user = data.username
            waiting(your_user)
        }
        else if (data.TITLE == 'winner_send')
        {
            if (data.winner == id)
                winner("You win");
            else 
               lost("You lost!")
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

            const goBackButton = shadowRoot.getElementById("go_back");
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
  }

function attachEventListeners(shadowRoot) {
  shadowRoot.getElementById("local").addEventListener('click', function(event) {
    let orignallocal;
      orignallocal = shadowRoot.getElementById("myContainer").innerHTML;
      shadowRoot.getElementById("myContainer").innerHTML = 
      `
          <div class="full">
          <div id="content">

          <div id="score">
          <div class="team team1">
          <h1>PLAYER 1</h1>
          </div>
          
          <div class="score-center">
          <h1 id="score1">0</h1>
          <span>-</span>
          <h1 id="score2">0</h1>
          </div>
          
          <div class="team team2">
          <h1>PLAYER 2</h1>
          </div>
          </div>

            <div id="game-container">
            <div class="instructions-box left">
            <p>Use: <span>WS</span></p>
            </div>
            <canvas id="Game" width="700" height="350"></canvas>
            <div class="instructions-box right">
            <p>Use: <span>⬆⬇</span></p>
            </div>
          </div>
          </div>
          <div id="chat-log"></div>
      `
      const canvas = shadowRoot.getElementById("Game");
      const context = canvas.getContext('2d');
      
      const paddleWidth = 5, paddleHeight = 70;
      let Player1 = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
      let Player2 = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
      
      let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speed: 6, velocityX: 4, velocityY: 2, color: 'withe' };
      
      let p1win = false
      let p2win = false
      
      const Escore1 = shadowRoot.getElementById("score1")
      const Escore2 = shadowRoot.getElementById("score2")
      
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
      
      
      let step1 = 1;
      let step2 = 1;
      let score1 = 0;
      let score2 = 0;
      
      function MoveBall() {
      
          if (ball.x + 10 >= canvas.width - paddleWidth)
          {
              if(ball.y + 10 > Player2.y && ball.y - 10 < Player2.y + paddleHeight)
              {
                  step1 *= -1;
                  if(ball.y > Player2.y + paddleHeight / 2)
                  {
                      ball.velocityX += 0.2
                      ball.velocityY -= 0.2
                  }
                  else {
                      ball.velocityX -= 0.2
                      ball.velocityY += 0.2
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
              if(ball.y  + 10 > Player1.y && ball.y - 10  < Player1.y + paddleHeight)
              {
                  step1 *= -1;
                  if(ball.y > Player1.y + paddleHeight / 2)
                      {
                          ball.velocityX += 0.2
                          ball.velocityY -= 0.2
                      }
                      else {
                          ball.velocityX -= 0.2
                          ball.velocityY += 0.2
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
              setTimeout(function() {
                  shadowRoot.getElementById("myContainer").innerHTML =  orignallocal
                  attachEventListeners(shadowRoot)
              }, 2000); 
              return;
          }
          requestAnimationFrame(gameLoop);
      }
      
      gameLoop()
      
      
  });
  
  shadowRoot.getElementById("remote").addEventListener('click', (event) => callremote("none", shadowRoot));
  

  shadowRoot.getElementById("tournament").addEventListener('click', function (event) {
      let origintournament = shadowRoot.getElementById("myContainer").innerHTML ;
      shadowRoot.getElementById("myContainer").innerHTML = 
      `
          <div class="tournament-form">
          <form id="tournamentForm">
          <h1>Tournament Registration</h1>
          <label class="player1-tournoi" for="Player1">Name player 1</label>
                  <input class="input-tournoi" type="text" id="Player1" name="Player1" required>

                  <label class="player1-tournoi" for="Player2">Name player 2</label>
                  <input class="input-tournoi" type="text" id="Player2" name="Player2" required>
              
                  <label  class="player1-tournoi" for="Player3">Name player 3</label>
                  <input class="input-tournoi" type="text" id="Player3" name="Player3" required>
              
                  <label class="player1-tournoi" for="Player4">Name player 4</label>
                  <input class="input-tournoi" type="text" id="Player4" name="Player4" required>

              <button class="register-button" id="register_button" type="submit">Register</button>
          </form>
          </div>
          
          
      `
  let playerData = [];
  let winer1 = ""
  let winer2 = ""
  let winer3 = ""
    shadowRoot
    .getElementById("tournamentForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
  
      const formData = new FormData(event.target);
      playerData[0] = formData.get("Player1");
      playerData[1] = formData.get("Player2");
      playerData[2] = formData.get("Player3");
      playerData[3] = formData.get("Player4");
      player_tour1 = playerData[0]
      player_tour2 = playerData[1]
      await tournament_table();
    });

  
  async function WinerFunction() {
  
    shadowRoot.getElementById("myContainer").innerHTML = `
    <div class=content-winner>
        <div id="winner">
        <p>You win !</p>
        <div class="crown"></div>
        <p>${winer3}</p>
        </div>
    </div>
    
    `
    setTimeout(function() {
              shadowRoot.getElementById("myContainer").innerHTML = 
              `
                <div id="holder" class="holder">
                <h1>Choose your game mode</h1>
                <div class="modes">
                  <div class="local-mode" id="local">
                    <div class="icon">
                      <img src="assests/icon-local.png">
                    </div>
                    <div class="go-local">
                      <p>Local</p>
                    </div>
                  </div>
                  <div class="remote-mode"  id="remote">
                    <div class="icon">
                      <img src="assests/icon-remote.png">
                    </div>
                    <div class="go-remote">
                      <p>Remote</p>
                    </div>
                  </div>
                  <div class="tournament-mode" id="tournament">
                    <div class="icon">
                      <img src="assests/icon-tournoi.png">
                    </div>
                    <div class="go-tournament" >
                      <p>Tournament</p>
                    </div>
                  </div>
                </div>
              </div>
                  <script src="game.js"></script>
              `
              attachEventListeners(shadowRoot)
          }, 2000); 
  }
  
  async function tournament_table() {
    globalNotifPopup("NEXT MATCH", player_tour1 + " VS " + player_tour2);
  
    shadowRoot.getElementById("myContainer").innerHTML = `
         <div id="containe_all">
            <div class="title-wrapper">
              <h1>Tournament</h1>
              <img class="laurel-decoration" src="assests/title.png"</img>
            </div>
            
            <div class="container-tournament">

              <!-- 1) Bloc des premiers matchs (Match A & Match B) -->

              <div class="first-matches">
                <div class="round1"><p>ROUND 1</p></div>
                <div class="round2"><p>ROUND 2</p></div>
                <div class="round3"><p>FINAL</p></div>


                <div class="first-players">
                  <div class="player-box"><p>${playerData[0]}</p></div>
                  <div class="player-box"><p>${playerData[1]}</p></div>
                </div>

                <div class="second-players">
                  <div class="player-box"><p>${playerData[2]}</p></div>
                  <div class="player-box"><p>${playerData[3]}</p></div>
                </div>

              </div>

              <!-- 2) Bloc des deux winners (Winner 1 & Winner 2) -->
              <div class="second-matches">
                <div class="champion-1">
                  <div class="player-box"><p>${winer1}</p></div>
                </div>

                <div class="champion-2">
                  <div class="player-box"><p>${winer2}</p></div>
                </div>
              </div>

              <!-- 3) Bloc du champion final (Winner 3) -->
              <div class="champion">
                <div class="player-box"><p>${winer3}</p></div>
                <img src="assests/trophee.png" class="trophee-img"/img>
                <button id="play-tour">play</button>
              </div>

              <div class="line" id="lineA"></div>
              <div class="line" id="lineB"></div>
              <div class="line" id="lineC"></div>
              <div class="line" id="line1"></div>


              <div class="line" id="lineD"></div>
              <div class="line" id="lineE"></div>
              <div class="line" id="lineF"></div>
              <div class="line" id="line2"></div>


              <div class="line" id="lineG"></div>
              <div class="line" id="lineH"></div>
              <div class="line" id="lineI"></div>
              <div class="line" id="line3"></div>




            </div> <!-- /container-tournament -->
          </div> <!-- /containe_all -->
        `;
    shadowRoot.getElementById("play-tour").addEventListener("click", async (event) => {
    if (playerData[0] && playerData[1])
      {
        if(winer1 == "")
        {
      winer1 = await MakeMatch(playerData[0], playerData[1])
      player_tour1 = playerData[2]
      player_tour2 = playerData[3]
      await tournament_table()
        }
        else if(winer2 == "")
      {
        winer2 = await MakeMatch(playerData[2], playerData[3])
        player_tour1 = winer1
        player_tour2 = winer2
        await tournament_table()
      }
      else if(winer3 == "")
      {
        winer3 = await MakeMatch(winer1, winer2)
          await WinerFunction()
      }
          
    }
    });
  }
  
  function MakeMatch(player1, player2) {
    shadowRoot.getElementById("myContainer").innerHTML = `

    <div class="full">
          <div id="content">

          <div id="score">
          <div class="team team1">
          <h1>${player1}</h1>
          </div>
          
          <div class="score-center">
          <h1 id="score1">0</h1>
          <span>-</span>
          <h1 id="score2">0</h1>
          </div>
          
          <div class="team team2">
          <h1>${player2}</h1>
          </div>
          </div>

            <div id="game-container">
            <div class="instructions-box left">
            <p>Use: <span>WS</span></p>
            </div>
            <canvas id="Game" width="700" height="350"></canvas>
            <div class="instructions-box right">
            <p>Use: <span>⬆⬇</span></p>
            </div>
          </div>
          </div>
  
    `;
  
          const canvas = shadowRoot.getElementById("Game");
          const context = canvas.getContext('2d');
          
          const paddleWidth = 5, paddleHeight = 70;
          let Player1 = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
          let Player2 = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: '#FFF' };
          
          let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speed: 6, velocityX: 4, velocityY: 2, color: 'withe' };
          
          let p1win = false
          let p2win = false
          
          const Escore1 = shadowRoot.getElementById("score1")
          const Escore2 = shadowRoot.getElementById("score2")
          
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
          
          
          let step1 = 1;
          let step2 = 1;
          let score1 = 0;
          let score2 = 0;
          
          function MoveBall() {
          
              if (ball.x + 10 >= canvas.width - paddleWidth)
              {
                  if(ball.y + 10 > Player2.y && ball.y - 10 < Player2.y + paddleHeight)
                  {
                      step1 *= -1;
                      if(ball.y > Player2.y + paddleHeight / 2)
                      {
                          ball.velocityX += 0.2
                          ball.velocityY -= 0.2
                      }
                      else {
                          ball.velocityX -= 0.2
                          ball.velocityY += 0.2
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
                  if(ball.y  + 10 > Player1.y && ball.y - 10  < Player1.y + paddleHeight)
                  {
                      step1 *= -1;
                      if(ball.y > Player1.y + paddleHeight / 2)
                          {
                              ball.velocityX += 0.2
                              ball.velocityY -= 0.2
                          }
                          else {
                              ball.velocityX -= 0.2
                              ball.velocityY += 0.2
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


class PingpongPage extends HTMLElement 
{
    constructor() 
    {
      super();
      const shadow = this.attachShadow({ mode: "open" });
  

      const template = document.getElementById("pingpong-template");
      const content = template.content.cloneNode(true);
  
      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/pingpong.css";
  
      this.style.display = "none";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);

      attachEventListeners(this.shadowRoot)

    }
    async playwithfriend(id)
    {
      callremote(id, this.shadowRoot)

    }
    connectedCallback() 
    {
      updateActiveNav("pingpong", this.shadowRoot);
      initializeCommonScripts(this.shadowRoot);
      this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => {
        element.addEventListener("click", (e) => {
          const page = e.target.dataset.navigate;
          if (page) 
          {
            navigateTo(page);
          }
        });
      });
      this.PingpongProcess();
    }

    disconnectedCallback() {
      // console.log("dekhle l disco callback ")
      if (chatSocket && chatSocket.readyState === WebSocket.OPEN)
        chatSocket.close()
      // matchingSocket = null
      // game_obj = null
    // Nettoyage de l'écouteur d'événement lors de la suppression du composant
    // window.removeEventListener("resize", this.handleResize.bind(this));
  //   window.removeEventListener("resize", this.handleResize.bind(this));
    }

    logoutListener()
    {
      this.shadowRoot.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutProcess();
      })
    }

    async PingpongProcess() 
    {
      getUserInfos(this.shadowRoot);
      this.logoutListener();
    }

}
  
customElements.define("pingpong-page", PingpongPage);