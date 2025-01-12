import { updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { logoutProcess, getAccessToken } from "../shared.js";


let matchingSocket = null
let game_obj = null


function back_to_home(obj) {
    let changeable_div = obj.shadowRoot.getElementById('contIdx')
    changeable_div.innerHTML = ""
    changeable_div.innerHTML = principal_html
    let playbtn1 = obj.shadowRoot.querySelector(".play_btn1")
    let playbtn2 = obj.shadowRoot.querySelector(".play_btn2")
    playbtn1.addEventListener('click',() => playClassic(obj))
    playbtn2.addEventListener('click',() => playFt4(obj))
    fetchGameData(obj.shadowRoot);
  }

function generateHtmlBoard(ina_game){
  const cellPercentage = (ina_game === 3) ? '30%' : '15%';
  const totalCells = ina_game * ina_game;
  let boardCells = "";
  for (let i = 0; i < totalCells; i++) {
      boardCells += `<div class="cell disabled" id="cell-${i}"></div>`;
  }
  let htmlBoard = `
  <div id="contIdx" class="container df_fdc_jcc_aic">
  <div id="board_holder_id" class="board_holder df_fdc_jcsa_aic">
  <div class="turnShowDiv df_fdc_jcc_aic">
      <h1 class="turnShow df_jcc_aic" id="turnShow">
      </h1>
  </div>
  <div class="board_head">
  <div class="fp df_fdc_jcsa_aic">
  <div class="pl_profil" id="fp_profil">
      <img src="" alt="" id="thisPlayer_img">
      <h5 id="thisPlayer_name">abbass</h5>
  </div>
  <div class="turnToggle df_jcc_aic" id="turnToggleZis">
      <div class="inTurnTog">
          <div class="fron">✔</div>
          <div class="bac">✘</div>
      </div>
  </div>  
  <div class="score_win df_fdc_jcc_aic">
      <h1>LOT</h1>
      <h3 id="thisPlayer_score">0</h3>
  </div>
  <div class="sla7 df_fdc_jcc_aic" id="fpArm">
      <h1 id="thisPlayer_arm"></h1>
      <h2 id="thisPlayer_char"></h2>
  </div>
  </div>
  <div class="board" style="
  grid-template-columns: repeat(${ina_game}, ${cellPercentage});
  grid-template-rows: repeat(${ina_game}, ${cellPercentage});
  ">
  ${boardCells}
  </div>
  <div id="popup" class="">
  </div>
  <div class="sp df_fdc_jcsa_aic">
  <div class="pl_profil" id="sp_profil">
      <img src="" alt="" id="opponent_img">
      <h5 id="opponent_name">hmida</h5>
  </div>
  <div class="turnToggle df_jcc_aic" id="turnToggleThat">
      <div class="inTurnTog">
          <div class="fron">✔</div>
          <div class="bac">✘</div>
      </div>
  </div>    
  <div class="score_win df_fdc_jcc_aic">
      <h1>LOT</h1>
      <h3 id="opponent_score">0</h3>
  </div>
      <div class="sla7 df_fdc_jcc_aic" id="spArm">
      <h1 id="opponent_arm"></h1>
      <h2 id="opponent_char"></h2>
      </div>
  </div>
  </div>
  
  <button id="leaveGame">Quit</button>
  </div>
  </div>`
  return htmlBoard
}
//  onclick="leaveGame()

let principal_html = `<div id="id_dynamic" class="dynamic">
<div class="ticTacGame">
    <div class="leftDivTicTac">
      <div class="gameDescription">
        <h4>Tic-Tac-Toe Game OverView</h4>
        <p>In this Tic Tac Toe game, play against
           a random opponent or invite a friend. Customize your challenge:
           be the first to reach 3, 5, or 7 points to win.
        </p>
      </div>
      <div class="playGround">
        <div id="rMatch">
          <h3>Random Match</h3>
          <div id="btnHolder">
            <h2>First To</h2>
              <div class="radio-container">
                <div class="tabs">

                    <input type="radio" id="choice1" name="game-choice" value="1" checked>
                    <label class="tab" for="choice1">1</label>
                 
                    <input type="radio" id="choice3" name="game-choice" value="3">
                    <label class="tab" for="choice3">3</label>
                  
                    <input type="radio" id="choice5" name="game-choice" value="5">
                    <label class="tab" for="choice5">5</label>
                  
                    <input type="radio" id="choice7" name="game-choice" value="7">
                    <label class="tab" for="choice7">7</label>

                    <div class="rd-slid" id="radio-slid"></div>
                </div>
            </div>
            <div class="btnsPlay">
              <button class="play_btn play_btn1">PLAY 3X3 Classic</button>
              <button class="play_btn play_btn2">PLAY 5X5 FT_FOUR</button>
            </div>
              <!-- <button>3</button>
              <button>5</button>
              <button>7</button> -->
          </div>
        </div>
        <!-- <div id="invFriend">
          <h3>Invite Friend</h3>
          <div class="friendList">
            <div class="unitFriend">
              <div class="picUF"></div>
              <h4 class="nameUF">Reda</h4>
            </div>
            <div class="unitFriend">
              <div class="picUF"></div>
              <h4 class="nameUF">Reda</h4>
            </div>
            <div class="unitFriend">
              <div class="picUF"></div>
              <h4 class="nameUF">Reda</h4>
            </div>
            
           
          </div>
        </div> -->
      </div>
      <div class="latestGames">
        <h2>Latest Tic-Tac-Toe Games</h2>
        <div class="listOfLG" id="listOfLGID">
            
        </div>
      </div>
    </div>
    <div class="rightDivTicTac">
      <div class="lclGameDiv">
        <div class="boardlcl">
          <div class="bSlot">x</div>
          <div class="bSlot">o</div>
          <div class="bSlot">x</div>
          <div class="bSlot">o</div>
          <div class="bSlot">x</div>
          <div class="bSlot">o</div>
          <div class="bSlot">x</div>
          <div class="bSlot">o</div>
          <div class="bSlot">x</div>
        </div>
        <div class="animWinLose">
          <h1 class="vertical-text">START</h1>
        </div>
        <div class="dashBlcl">
          <div class="stats"><h4>X WINS</h4><h1>0</h1></div>
          <div class="stats"><h4>DRAWS</h4><h1>0</h1></div>
          <div class="stats"><h4>O WINS</h4><h1>0</h1></div>
          <div class="reset">Reset</div>
        </div>
      </div>
      <div class="menuBtnLcl">
        <input type="radio" id="rb1p" name="playerMode" value="1" checked>
        <label for="rb1p" class="radio-div">1 Player</label>

        <input type="radio" id="rb2p" name="playerMode" value="2">
        <label for="rb2p" class="radio-div">2 Players</label>
      </div>
    </div>
  </div>
</div>`;
let gOver_html = `
        <div class="winloss" id="losswin">
            <h1 id="msg"></h1>
            <h2>Number of Games Played: <span id="nbofgames"></span></h1>
            <h3>You Scored : <span id="winScore"></span></h1>
            <h3>He Scored : <span id="hescore"></span></h1>
            <button class="button" id="quitBtn">OK</button>
        </div>
        `;
let wait_html = `
      <div class="wait" id="id_wait">
          <div class="cube-container df_jcc_aic">
              <div class="cube">
                  <div class="face front">
                      <div class="boardAnim">
                          <div>X</div><div>O</div><div>X</div>
                          <div>O</div><div>X</div><div>O</div>
                          <div>X</div><div>X</div><div>X</div>
                      </div>
                  </div>
                  <div class="face back">
                      <div class="boardAnim">
                          <div>O</div><div>O</div><div>O</div>
                          <div>X</div><div>O</div><div>X</div>
                          <div>X</div><div>O</div><div>X</div>
                      </div>
                  </div>
                  <div class="face left">
                      <div class="boardAnim">
                          <div>X</div><div>X</div><div>O</div>
                          <div>O</div><div>O</div><div>O</div>
                          <div>X</div><div>X</div><div>O</div>
                      </div>
                  </div>
                  <div class="face right">
                      <div class="boardAnim">
                          <div>O</div><div>X</div><div>O</div>
                          <div>X</div><div>X</div><div>X</div>
                          <div>O</div><div>O</div><div>O</div>
                      </div>
                  </div>
              </div>
          </div>
          <h1>Matching with a random player</h1>
      </div>`;

      class Player {
        constructor(shadowRoot,scoreElementId, armElementId, charElementId, turnElementId, nameElementId, imgElementId) {
            this.shadowRoot = shadowRoot
            this.scoreElement = this.shadowRoot.getElementById(scoreElementId);
            this.armElement = this.shadowRoot.getElementById(armElementId);
            this.charElement = this.shadowRoot.getElementById(charElementId);
            this.turnElement = this.shadowRoot.getElementById(turnElementId);
            this.nameElement = this.shadowRoot.getElementById(nameElementId);
            this.imgElement = this.shadowRoot.getElementById(imgElementId);
        }
        setPlayerName(n) {
            this.nameElement.textContent = n;
        }
        setPlayerImg(i) {
            this.imgElement.src = i;
        }
        updatePlayerTurn(t) {
            this.turn = t;
            if (this.turn) {
                this.turnElement.classList.add('your-turn');
                this.turnElement.classList.remove('not-turn');
            }
            else
            {
                this.turnElement.classList.add('not-turn');
                this.turnElement.classList.remove('your-turn');
            }
        }
        updatePlayerArmChar(s) {
            this.sign = s;
            this.charElement.innerHTML = this.sign;
            this.armElement.innerHTML = this.sign === "x" ? "KATANA" : "SHURIKEN";
        }
        updatePlayerScore(sc) {
            this.score = sc;
            this.scoreElement.innerHTML = this.score;
        }
    }


class t3 {
  constructor(shadowRoot) {
      this.shadowRoot = shadowRoot
      this.currMsg = null;
      this.zhisP = null
      this.thatP = null
      // this.pSign = "";
      this.save_ev = null;
      this.cells = [];
      this.elements = [];
      this.cont = this.shadowRoot.getElementById("contIdx")
      this.winloss = this.shadowRoot.getElementById("losswin")
      this.turnShow = this.shadowRoot.getElementById("turnShow")
      
      // this.wins = 0;
      this.board = ""
      this.gType = 0
      this.functionMap = new Map()

      this.functionMap.set("waiting", this.waiting.bind(this))
      this.functionMap.set("setup", this.setup_game_field.bind(this))
      this.functionMap.set("re_setup", this.re_setup.bind(this))
      // this.functionMap.set("start_game", this.start_game.bind(this))
      this.functionMap.set("in_game", this.in_game.bind(this))
      this.functionMap.set("windrawloose", this.windrawloose.bind(this))
      this.functionMap.set("error_handle", this.err_msg.bind(this))
      this.functionMap.set("opponentLeft", this.oppLeftGame.bind(this))

      // this.setupDataBoard.bind(this)
      // this.updateDataBoard.bind(this)
      // this.playAgain.bind(this)
      this.quit.bind(this)
      this.lmClickHandler = this.lmClick.bind(this);
  }

  oppLeftGame(){
      const winMsg = this.shadowRoot.getElementById("popup");
      winMsg.textContent = ""
      winMsg.textContent = this.currMsg["message"]
      winMsg.style.color = "red"
      winMsg.style.display = "flex"; 
      setTimeout(() => {
          this.removeClick()
      }, 1000);
  }

  err_msg(){
      let pop = this.shadowRoot.querySelector("#err_pop")
      const closeCode = this.currMsg["code"];
      const closeReason = this.currMsg["msg"];

      pop.textContent = `Connection closed: Code ${closeCode} - ${closeReason}`;
      pop.style.transition = "top 0.5s ease";
      pop.style.top = "0vh";
  
      setTimeout(() => {
        pop.style.top = "-15vh";

        setTimeout(() => {
                pop.textContent = "";
            }, 500);
        }, 2000);
  }

  async showWinMessage(mesg) {
      const winMsg = this.shadowRoot.getElementById("popup");
      if (mesg == 2)
      {
          winMsg.textContent = "Draw Match"
          winMsg.classList.add("draw")
      }
      else if (mesg == 1)
      {
          winMsg.textContent = "You Won"
          winMsg.classList.add("win")
      }
      else
      {
          winMsg.textContent = "You Lost"
          winMsg.classList.add("lose")
      }
      if (mesg != 2)
      {
          this.currMsg["combo"].forEach(index => {
              const cell = this.cells[index];
              cell.classList.add("win-highlight");
          });
      }

      winMsg.style.display = "flex"; 
      return new Promise(resolve => {
          setTimeout(() => {
              if (mesg != 2)
              {
                  this.currMsg["combo"].forEach(index => {
                      const cell = this.cells[index];
                      cell.classList.remove("win-highlight");
                  });
              }
              winMsg.style.display = "none";
              winMsg.classList.remove("win", "lose", "draw");
              resolve();
          }, 2000);
      });
  }
  waiting(){
      let counter = 1
      this.shadowRoot.getElementById("id_dynamic").style.opacity = "0"
      setTimeout(() => {
          this.cont.innerHTML = wait_html
          setTimeout(() => {
          this.shadowRoot.getElementById("id_wait").style.marginLeft = "0%"
          }, 10)
      }, 50)

  }

  async quit()
  {
      // change it with fetch + animation
    // let changeable_div = this.shadowRoot.getElementById('contIdx')
    // changeable_div.innerHTML = ""
    // changeable_div.innerHTML = principal_html
    // // game_this = null
    // let playbtn1 = this.shadowRoot.querySelector(".play_btn1")
    // let playbtn2 = this.shadowRoot.querySelector(".play_btn2")
    // playbtn1.addEventListener('click',this.playClassic.bind(this))
    // playbtn2.addEventListener('click',this.playFt4.bind(this))
    // fetchGameData(this.shadowRoot);
      back_to_home(this)
      // location.reload()
  }
  
  async windrawloose(){
      this.board = this.currMsg["board"]
      this.updateBoard()
      await this.removeClick()
      if ( this.currMsg["msg"] === "Match Draw !")
      {
          this.showWinMessage(-1)
          return
      }

      await this.showWinMessage(this.currMsg["message"])

      this.cont = this.shadowRoot.getElementById("contIdx")
      this.cont.innerHTML = gOver_html;

      let winDiv = this.shadowRoot.querySelector('.winloss')

      winDiv.style.display = 'flex';

      let quitGameBtn = this.shadowRoot.getElementById('quitBtn')
      let msgRes = this.shadowRoot.getElementById("msg")
      let winScore = this.shadowRoot.getElementById('winScore')
      let nb_games = this.shadowRoot.getElementById('nbofgames')
      let hescore = this.shadowRoot.getElementById('hescore')

      msgRes.textContent = this.currMsg["msg"]

      if ( this.currMsg["message"] )
          winDiv.style.background = "rgba(1, 140, 90, 0.5)"
      else
          winDiv.style.background = "rgba(200, 50, 50, 0.5)"
      winScore.textContent = this.currMsg["wins"]
      nb_games.textContent = this.currMsg["nbGames"]
      hescore.textContent = this.currMsg["opwins"]
      quitGameBtn.addEventListener('click', this.quit.bind(this))
  }

  formatCells(){
      this.cells.forEach( lm => {
          if( lm ) {
              lm.textContent = ""
          }
      })
  }

  setupDataBoard(win, opwin){

      this.zhisP.updatePlayerScore(win)
      this.zhisP.updatePlayerArmChar(this.currMsg["player"])
      this.zhisP.updatePlayerTurn(this.currMsg["turn"])

      let hisChar = this.currMsg["player"] === "x" ? "o" : "x"
      this.thatP.updatePlayerScore(opwin)
      this.thatP.updatePlayerArmChar(hisChar)
      this.thatP.updatePlayerTurn(!this.currMsg["turn"])
  }

  async re_setup(){
      this.board = this.currMsg["board"]
      this.updateBoard()

      await this.removeClick()
      await this.showWinMessage(this.currMsg["reslt"])

      this.board = Array(this.gType**2).fill('.');

      this.formatCells()
      this.setupDataBoard(this.currMsg["wins"],this.currMsg["opwins"])

      this.turnShow.textContent = this.zhisP.turn ? "Your Turn" : "Opponent's Turn"

      if ( this.currMsg["turn"] )
          await this.setBoardToClick()
      else
          await this.removeClick()
  }
  async setup_game_field(){
    this.cont = this.shadowRoot.getElementById("contIdx")
    this.gType = this.currMsg["ina_game"]
    this.cont.innerHTML = generateHtmlBoard(this.gType);

    let bHolderShow = this.shadowRoot.getElementById("board_holder_id")
    let leaveBtn = this.shadowRoot.getElementById("leaveGame")

    leaveBtn.addEventListener('click', () => leaveGame())
    setTimeout(() => {
        bHolderShow.style.marginRight = "0%"
    }, 10)

    this.board = this.currMsg["board"]
    this.cells =  Array.from(this.shadowRoot.querySelectorAll(".cell"))
    this.turnShow = this.shadowRoot.getElementById("turnShow")

    this.zhisP = new Player(this.shadowRoot, "thisPlayer_score", "thisPlayer_arm", "thisPlayer_char", "turnToggleZis", "thisPlayer_name", "thisPlayer_img");
    this.thatP = new Player(this.shadowRoot, "opponent_score", "opponent_arm", "opponent_char", "turnToggleThat", "opponent_name", "opponent_img");
    
    this.zhisP.setPlayerName(this.currMsg["me"]["fname"])
    this.zhisP.setPlayerImg(this.currMsg["me"]["pic"])
    this.thatP.setPlayerName(this.currMsg["him"]["fname"])
    this.thatP.setPlayerImg(this.currMsg["him"]["pic"])

    this.setupDataBoard(0,0)
    this.turnShow.textContent = this.zhisP.turn ? "Your Turn" : "Opponent's Turn"

    if ( this.cells.length === this.gType * this.gType )
    {
        this.elements = this.cells.map(id => this.shadowRoot.getElementById(id));
        if ( this.currMsg["turn"] )
            await this.setBoardToClick()
        else
            await this.removeClick()
    }
    else{
        setTimeout(this.setup_game_field.bind(this), 10)
    }
  }

  updateDataBoard(){
      this.zhisP.updatePlayerTurn(this.currMsg["turn"])
      this.thatP.updatePlayerTurn(!this.currMsg["turn"])
      this.turnShow.textContent = this.currMsg["turn"] ? "Your Turn" : "Opponent's Turn"
  }

  async in_game(){
    this.board = this.currMsg["board"]
    this.updateBoard()
    this.updateDataBoard()
    
    if ( this.currMsg["turn"] )
        await this.setBoardToClick()
    else
        await this.removeClick()
  }
}

t3.prototype.setBoardToClick = async function() {
this.cells.forEach( (lm, i) => {
    if (lm && this.board[i] === ".") {
        lm.addEventListener('click', this.lmClickHandler)
        lm.classList.remove("disabled")
    }
})
}

t3.prototype.removeClick = async function() {
this.cells.forEach( lm => {
    if( lm ) {
        lm.removeEventListener('click', this.lmClickHandler)
        lm.classList.add("disabled")
    }
})
}

t3.prototype.lmClick = function(ev) {

    const idx = this.cells.indexOf(ev.target)

    this.save_ev = ev

    const msg = {
        type : "in_game",
        clickIdx : idx
    }

    matchingSocket.send(JSON.stringify(msg))
}

t3.prototype.updateBoard = function() {
    this.cells.forEach( (lm, i) => {
        if( lm && this.board[i] != "." && lm.innerHTML.trim() === ""){
            let g = this.board[i]
            let p = document.createElement("p")
            p.textContent = g
            p.classList.add(g)
            lm.innerHTML = ""
            lm.appendChild(p)
        }
    })
}


class GamePage extends HTMLElement 
{
    constructor() 
    {
      super();
  
      const shadow = this.attachShadow({ mode: "open" });
  

      const template = document.getElementById("game-template");
      const content = template.content.cloneNode(true);
  
      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/game.css";
  
      this.style.display = "none";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);
      /********************************TICTACTOE GAME JAVASCRIPT************************************** */
      /********************************TICTACTOE GAME JAVASCRIPT************************************** */
      /********************************TICTACTOE GAME JAVASCRIPT************************************** */
      /********************************TICTACTOE GAME JAVASCRIPT************************************** */
      /********************************TICTACTOE GAME JAVASCRIPT************************************** */
      this.playbtn1 = this.shadowRoot.querySelector(".play_btn1")
      this.playbtn2 = this.shadowRoot.querySelector(".play_btn2")
      
      this.playbtn1.addEventListener('click', () => playClassic(this))
      this.playbtn2.addEventListener('click', () => playFt4(this))
// </div><div id="contIdx" class="container df_fdc_jcc_aic">

    //   onclick="playClassic()"onclick="playFt4()"
      // matchingSocket = null
      // game_obj = null



  fetchGameData(this.shadowRoot)
  
}

/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */
/********************************END OF CONTRUCTOR************************************** */

  
async friendsGame(friendId){
    await playgame(friendId, "ft_classic", this)
}

  

  

  

  getAccessToken() {
      return fetch('/auth/get-access-token/', {
          method: 'GET',
          credentials: 'include'  // Include cookies in the request
      })
      .then(response => response.json())
      .then(data => {
          if (data.access_token) {
              return data.access_token;
          } else {
              throw new Error('Access token not found');
          }
      })
      .catch(error => {
          console.error('Error fetching access token:', error);
          throw error;
      });
  }

    connectedCallback() 
    {
      updateActiveNav("game", this.shadowRoot);
      initializeCommonScripts(this.shadowRoot);
      this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => 
      {
        element.addEventListener("click", (e) => {
          const page = e.target.dataset.navigate;
          if (page) 
          {
            navigateTo(page);
          }
        });
      });
      this.gameProcess();
      const game = new TicTacToeGame(this.shadowRoot)
      // window.addEventListener("resize", this.handleResize.bind(this));
      // this.handleResize();
    }
    
    // handleResize() 
    // {
    //   const mobileMessage = this.shadowRoot.querySelector("#mobile-message");
    //   if (window.innerWidth < 1550) 
    //   {
    //     mobileMessage.style.display = "flex";
    //   } 
    //   else 
    //   {
    //     mobileMessage.style.display = "none";
    //   }
    // }

    disconnectedCallback() {
        if (matchingSocket && matchingSocket.readyState === WebSocket.OPEN)
            matchingSocket.close()
        game_obj = null
    }

    logoutListener()
    {
      this.shadowRoot.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutProcess();
      })
    }

    async gameProcess() 
    {
      getUserInfos(this.shadowRoot);
      this.logoutListener();
    }

    
}





/**************************FETCH DATA************************************ */
/**************************FETCH DATA************************************ */
/**************************FETCH DATA************************************ */
/**************************FETCH DATA************************************ */
/**************************FETCH DATA************************************ */
/**************************FETCH DATA************************************ */
/**************************FETCH DATA************************************ */


function create_board(gType, boards){
  let gameInfos = document.createElement('div');
  gameInfos.classList.add('game-info');
  gameInfos.id = 'winBoards';

  boards.forEach((board, index) => {
    const boardiv = document.createElement("div");
  if (gType === "ft4")
      boardiv.className = "ff_hold_board";
  else
      boardiv.className = "tt_hold_board";
    board.split("").forEach(cell => {
      const divChar = document.createElement("div");
      if (cell === ".") {
          divChar.textContent = "";
      } else if (cell === cell.toUpperCase() && cell !== ".") {
          divChar.textContent = cell;
          divChar.className = "win-combo";
          divChar.style.backgroundColor = "green"
        } else {
          divChar.textContent = cell.toLowerCase();
        }
        boardiv.appendChild(divChar);
    });
    gameInfos.appendChild(boardiv);
  });
  return gameInfos
}

function create_player(img, name, score, l_r){
  let a = document.createElement('div');
  a.classList.add('player',`${l_r}`);
  if (l_r === 'player-left'){
    a.innerHTML = `
    <div class="df_fdc_jcc_aic">
      <img src="${img}" alt="" class="player-pic">
      <span class="player-name">${name}</span>
    </div>
    <h1 class="player-score">${score}</h1>
    `
  }
  else {
    a.innerHTML = `
      <h1 class="player-score">${score}</h1>
      <div class="df_fdc_jcc_aic">
        <img src="${img}" alt="" class="player-pic">
        <span class="player-name">${name}</span>
      </div>
    `
  }
  return a
}

function gameUnit(unit, list){
  let oneUnit = document.createElement('div');
  oneUnit.classList.add('unitLG','df_jcc_aic');
  if (unit.winner_or_loser === 'L')
    oneUnit.style.backgroundColor = 'rgba(200, 50, 50, 0.5)';
  else
    oneUnit.style.backgroundColor = 'rgba(1, 140, 90, 0.5)';
  let p1 = create_player(unit.l_image, unit.l_username, unit.l_score, "player-left");
  let p2 = create_player(unit.w_image, unit.w_username, unit.game_type_db[1], "player-right");
  let gameInfos = create_board(unit.game_type_db[0], unit.winner_boards);
  oneUnit.appendChild(p1);
  oneUnit.appendChild(gameInfos);
  oneUnit.appendChild(p2);
  list.appendChild(oneUnit);
}

function fetchGameData(dom){

  let list = dom.getElementById("listOfLGID")
  getAccessToken()
    .then(accessToken => {
        return fetch('/gamesByWinId/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}`}
        })
    })
    .then(response => response.json())
    .then(data => { console.log(data); 
        data.forEach( game => {
            gameUnit(game, list)
        })
    })
    .catch(error => {
        console.error('Error:', error)
        list.textContent = "Error fetching data ! Please try to refresh the page !"
    });
}




async function playClassic (obj) {
    await playgame(-1,"ft_classic", obj)
}

async function playFt4 (obj) {
    await playgame(-1,"ft4", obj)
}

async function playgame (friendId ,gameType, obj) {
    let msg;
    let first_to;
    if (friendId === -1){
        first_to = obj.shadowRoot.querySelector('input[name="game-choice"]:checked').value;
        if (!first_to) {
            console.error("No game choice selected.");
            return;
        }
        msg = {
            "type" : gameType,
            "first_to": first_to
        }
    }
    else{
        msg = {
            "type" : "friendGame",
            "friendId" : friendId
        }
    }
    if ( matchingSocket && matchingSocket.readyState === WebSocket.OPEN )
        return
    let tok;
    await getAccessToken()
        .then(accessToken => {
            tok = accessToken;
        })
        .catch(error => {
            console.error('Error getting access token:', error);
            // alert('Error getting access token', error.message);
        }); 
    
    try {
        matchingSocket = new WebSocket(`/ws/play/?Token=${tok}`);
    } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        return;
    }

    matchingSocket.onopen = async () => {
        matchingSocket.send(JSON.stringify(msg));
        
        game_obj = new t3(obj.shadowRoot)
    }
    matchingSocket.onmessage = async (event) => {
        game_obj.currMsg = JSON.parse(event.data)
        if (game_obj.functionMap.has(game_obj.currMsg.type))
            await game_obj.functionMap.get(game_obj.currMsg.type)()
    }
    matchingSocket.onerror = (event) => {
        matchingSocket = null
    }
    matchingSocket.onclose = (event) => {
        if (event.code != 4010)
            back_to_home(obj)
        matchingSocket = null
    }
}

function leaveGame() {
    const msg = { type : "leaveGame" }
    matchingSocket.send(JSON.stringify(msg))
}

/**************************LOCAL GAME *************************************** */
/**************************LOCAL GAME *************************************** */
/**************************LOCAL GAME *************************************** */
/**************************LOCAL GAME *************************************** */
/**************************LOCAL GAME *************************************** */
/**************************LOCAL GAME *************************************** */
let huPlayer = 'X';
let aiPlayer = 'O';

class TicTacToeGame {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot
        this.boardSlots = this.shadowRoot.querySelectorAll('.bSlot');
        this.statsXWins = this.shadowRoot.querySelector('.stats:nth-child(1) h1');
        this.statsDraws = this.shadowRoot.querySelector('.stats:nth-child(2) h1');
        this.statsOWins = this.shadowRoot.querySelector('.stats:nth-child(3) h1');
        this.resetButton = this.shadowRoot.querySelector('.reset');
        this.startButton = this.shadowRoot.querySelector('.animWinLose h1');
        this.animWinLose = this.shadowRoot.querySelector('.animWinLose h1');
        this.playerMode = this.shadowRoot.querySelector('input[name="playerMode"]:checked').value;
        this.playerTurn = 'X';
        this.movesCount = 0;
        this.boardState = Array.from({ length: 9 }, (_, index) => index);

        this.xWins = 0;
        this.oWins = 0;
        this.draws = 0;
        this.isGameActive = false;

        this.initListeners();
    }

    initListeners() {
        this.startButton.addEventListener('click', () => this.startGame());

        this.resetButton.addEventListener('click', () => this.resetScores());

        this.shadowRoot.querySelectorAll('input[name="playerMode"]').forEach(radio => {
            radio.addEventListener('change', (event) => this.changeMode(event.target.value));
        });

        this.boardSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.handleSlotClick(slot, index));
        });
    }

    changeMode(mode) {
        this.playerMode = mode;
        this.resetGame();
        this.resetScores();
        this.animWinLose.textContent = 'START';
        this.startButton.textContent = 'START';
    }

    startGame() {
        if (this.isGameActive) return;
        this.animWinLose.textContent = `${this.playerTurn}'s Turn`;
        this.isGameActive = true;
        this.movesCount = 0;
        this.playerTurn = 'X';
        this.boardState = Array.from({ length: 9 }, (_, index) => index);

    
        this.boardSlots.forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('xSlot', 'oSlot');
        });
        this.startButton.textContent = 'Playing';
        
        this.enableBoard();
    }

    enableBoard() {
        this.boardSlots.forEach(slot => {
            slot.style.pointerEvents = 'auto';
        });
    }

    disableBoard() {
        this.boardSlots.forEach(slot => {
            slot.style.pointerEvents = 'none';
        });
    }

    resetGame() {
        this.boardState = Array.from({ length: 9 }, (_, index) => index);
        this.playerTurn = 'X';
        this.movesCount = 0;
        this.isGameActive = false;

        this.boardSlots.forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('xSlot', 'oSlot');
        });

        this.animWinLose.textContent = 'START';
        this.startButton.textContent = 'Start';
    }

    resetScores() {
        this.xWins = 0;
        this.oWins = 0;
        this.draws = 0;

        this.statsXWins.textContent = this.xWins;
        this.statsOWins.textContent = this.oWins;
        this.statsDraws.textContent = this.draws;
    }

    handleSlotClick(slot, index) {
        if (!this.isGameActive || typeof this.boardState[index] !== 'number') return;

        this.boardState[index] = this.playerTurn;
        slot.textContent = this.playerTurn;
        slot.classList.add(this.playerTurn === 'X' ? 'xSlot' : 'oSlot');
        this.movesCount++;

        let gameStatus = this.checkWin(this.boardState, this.playerTurn);
        if (gameStatus) {
            this.announceWinner(this.playerTurn);
        }
        else if (this.movesCount === 9) {
            this.announceDraw();
        }
        else {
            if (this.playerMode === '1' && this.playerTurn === 'X') {
                this.disableBoard();
                this.switchTurn();
                setTimeout(() => {
                    const bestMove = this.minimax(this.boardState, this.playerTurn).index;
                    this.handleSlotClick(this.boardSlots[bestMove], bestMove);
                    if (this.isGameActive)
                        this.enableBoard();
                }, 500);
            } else {
                this.switchTurn();
            }
        } 
    }

    checkWin(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === player);
        });
    }

    announceWinner(player) {
        this.animWinLose.textContent = `${player} Wins!`;
        this.animWinLose.classList.add('win-animation');
        this.isGameActive = false;
        this.startButton.textContent = 'START AGAIN';
        if (player === 'X') {
            this.xWins++;
            this.statsXWins.textContent = this.xWins;
        } else {
            this.oWins++;
            this.statsOWins.textContent = this.oWins;
        }

        this.disableBoard();
    }

    announceDraw() {
        this.animWinLose.textContent = "It's a Draw!";
        this.animWinLose.classList.add('draw-animation');
        this.isGameActive = false;
        this.startButton.textContent = 'START AGAIN';
        this.draws++;
        this.statsDraws.textContent = this.draws;

        this.disableBoard();
    }

    switchTurn() {
        this.playerTurn = this.playerTurn === 'X' ? 'O' : 'X';
        this.animWinLose.textContent = `${this.playerTurn}'s Turn`;
        this.animWinLose.classList.add('turn-animation');
        setTimeout(() => {
            this.animWinLose.classList.remove('turn-animation');
        }, 500);
    }

    emptySquares(board) {
        return board.filter(s => typeof s == 'number');
    }

    minimax(newBoard, player) {
        var availSpots = this.emptySquares(newBoard);

        if (this.checkWin(newBoard, huPlayer)) {
            return {score: -10};
        } else if (this.checkWin(newBoard, aiPlayer)) {
            return {score: 10};
        } else if (availSpots.length === 0) {
            return {score: 0};
        }
        var moves = [];
        for (var i = 0; i < availSpots.length; i++) {
            var move = {};
            move.index = newBoard[availSpots[i]];
            newBoard[availSpots[i]] = player;
    
            if (player == aiPlayer) {
                var result = this.minimax(newBoard, huPlayer);
                move.score = result.score;
            } else {
                var result = this.minimax(newBoard, aiPlayer);
                move.score = result.score;
            }
    
            newBoard[availSpots[i]] = move.index;
            moves.push(move);
        }
    
        var bestMove;
        if(player === aiPlayer) {
            var bestScore = -10000;
            for(var i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            var bestScore = 10000;
            for(var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }        
        return moves[bestMove];
    }

}






customElements.define("game-page", GamePage);
  