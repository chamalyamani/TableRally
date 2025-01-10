import { updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { logoutProcess } from "../shared.js";


let matchingSocket = null
let game_obj = null

function back_to_home(dom) {
  // console.log(principal_html)
  let changeable_div = dom.getElementById('contIdx')
  changeable_div.innerHTML = ""
  changeable_div.innerHTML = principal_html
  // game_obj = null
  fetchGameData(dom);
  // location.reload()
  // matchingSocket = null
  game_obj = null
  // Update the DOM with the fetched HTML content
  // document.open()
  // document.write(html)
  // document.close()
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
  
  <button id="restart-button" onclick="leaveGame()">Quit</button>
  </div>
  </div>`
  return htmlBoard
}


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
              <button class="play_btn" onclick="playClassic()">PLAY 3/3 Classic</button>
              <button class="play_btn" onclick="playFt4()">PLAY 5/5 FT4</button>
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
            
            // Set to "Not Your Turn"
            this.turn = t;
            if (this.turn) {
                // this.turnElement.innerHTML = "✔";
                this.turnElement.classList.add('your-turn');
                this.turnElement.classList.remove('not-turn');
            }
            else
            {
                // this.turnElement.innerHTML = "✘";
                this.turnElement.classList.add('not-turn');
                this.turnElement.classList.remove('your-turn');
            }
            // this.turnElement.style.backgroundColor = this.turn ? "green" : "red";
        }
        updatePlayerArmChar(s) {
            this.sign = s;
            this.charElement.innerHTML = this.sign;
            this.armElement.innerHTML = this.sign === "x" ? "KATANA" : "SHURIKEN";
        }
        updatePlayerScore(sc) {
            console.log("score-------------------- : ", sc)
  
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
      // this.winloss = this.shadowRoot.getElementById("losswin")
      // let announce = this.shadowRoot.getElementById("msg")
      const winMsg = this.shadowRoot.getElementById("popup");
      winMsg.textContent = ""
      winMsg.textContent = this.currMsg["message"]
      winMsg.style.color = "red"
      winMsg.style.display = "flex"; 
      setTimeout(() => {
          this.removeClick()
          // if ( matchingSocket && matchingSocket.readyState === WebSocket.OPEN )
          //     matchingSocket.close(1000)
          // location.reload()
      }, 1000);
      // console.log("inform : ", announce)
  }

  err_msg(){
      let pop = this.shadowRoot.querySelector(".toast")
      const closeCode = this.currMsg["code"];
      const closeReason = this.currMsg["msg"];
      console.log("hna f err_msg handler : ", closeCode, "  :  ", closeReason)
      // Update the content of the popup
      pop.textContent = `Connection closed: Code ${closeCode} - ${closeReason}`;
  
      // Make the popup visible with animation
    //   pop.style.transition = "top 0.5s ease";
    //   pop.style.top = "0vh";
  
      // Hide the popup after a delay
      setTimeout(() => {
          pop.classList.add("active");
          
          // Clear the text after hiding for a cleaner reset
          setTimeout(() => {
              pop.textContent = "";
              pop.classList.remove("active");
          }, 2000); // Matches the transition time
      }, 50); // Keep the popup visible for 3 seconds
      // console.log('onclose : ', event.code, "  :  ", event.reason)
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
      // Ensure it's visible
      console.log("flex given")
      return new Promise(resolve => {
          setTimeout(() => {
              console.log("give the none back");
              if (mesg != 2)
              {
                  this.currMsg["combo"].forEach(index => {
                      const cell = this.cells[index];
                      cell.classList.remove("win-highlight");
                  });
              }
              winMsg.style.display = "none"; // Hide after animation
              winMsg.classList.remove("win", "lose", "draw");
              resolve(); // Resolve the promise after the animation completes
          }, 2000); // Match the animation duration
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
      back_to_home(this.shadowRoot)
      // location.reload()
  }
  
  async windrawloose(){
      console.log("In windrawLoose func")
      this.board = this.currMsg["board"]
      // console.log("in win : ",this.board)
      this.updateBoard()
      await this.removeClick()
      if ( this.currMsg["msg"] === "Match Draw !")
      {
          this.showWinMessage(-1)
          return
      }

      await this.showWinMessage(this.currMsg["message"])
      // this.zhisP.updatePlayerScore(this.currMsg["wins"])
      this.cont = this.shadowRoot.getElementById("contIdx")
      this.cont.innerHTML = gOver_html;

      // this.shadowRoot.querySelector('.winloss').firstChild.textContent = this.currMsg["msg"]
      let winDiv = this.shadowRoot.querySelector('.winloss')
      winDiv.style.display = 'flex';
      // this.shadowRoot.getElementById("turnShow").innerText = this.currMsg["msg"]
      // let playAgainBtn = this.shadowRoot.getElementById('playAgainBtn')
      let quitGameBtn = this.shadowRoot.getElementById('quitBtn')
      let msgRes = this.shadowRoot.getElementById("msg")
      let winScore = this.shadowRoot.getElementById('winScore')
      let nb_games = this.shadowRoot.getElementById('nbofgames')
      let hescore = this.shadowRoot.getElementById('hescore')
      // console.log("Ha ch9amto : ",this.currMsg["wins"])
      msgRes.textContent = this.currMsg["msg"]
      if ( this.currMsg["message"] )
          winDiv.style.background = "rgba(1, 140, 90, 0.5)"
      else
          winDiv.style.background = "rgba(200, 50, 50, 0.5)"
      winScore.textContent = this.currMsg["wins"]
      nb_games.textContent = this.currMsg["nbGames"]
      hescore.textContent = this.currMsg["opwins"]
      // playAgainBtn.addEventListener('click', this.playAgain.bind(this))
      quitGameBtn.addEventListener('click', this.quit.bind(this))

      // this.shadowRoot.querySelector('.winloss').style.marginTop = '20vh';
      // alert(this.currMsg["msg"])
  }

  formatCells(){
      this.cells.forEach( lm => {
          if( lm ) {
              lm.textContent = ""
          }
      })
  }

  setupDataBoard(win, opwin){
      // console.log(this.zhisP, this.thatP)

      this.zhisP.updatePlayerScore(win)
      this.zhisP.updatePlayerArmChar(this.currMsg["player"])
      this.zhisP.updatePlayerTurn(this.currMsg["turn"])


      let hisChar = this.currMsg["player"] === "x" ? "o" : "x"
      this.thatP.updatePlayerScore(opwin)
      this.thatP.updatePlayerArmChar(hisChar)
      this.thatP.updatePlayerTurn(!this.currMsg["turn"])
  }

  /** re_setup function will trigger when receiving the re_setup msg from backend
   * it will handle formatting the board
   * showing win msg
   * update the data in board aka score
   * animate
   */
  /** problem after re_setup f ft4 3la wed had update board ma khdamch o hta reset dl board */
  async re_setup(){
      this.board = this.currMsg["board"]
      // alert(".")
      console.log("getting daba inside re_setup : ")
      this.updateBoard()
      await this.removeClick()
      // setTimeout(() => {
      await this.showWinMessage(this.currMsg["reslt"])
      // }, 1000)
      this.board = Array(this.gType**2).fill('.');
      this.formatCells()
      this.setupDataBoard(this.currMsg["wins"],this.currMsg["opwins"])
      // this.updateDataBoard()
      this.turnShow.textContent = this.zhisP.turn ? "Your Turn" : "Opponent's Turn"
      if ( this.currMsg["turn"] )
          await this.setBoardToClick()
      else
          await this.removeClick()
  }
  async setup_game_field(){
      // this function is important, and can hold more animations, and 
      // i can also add a presenter, that will present the two players before the game start
      console.log("gggggggggggggggg :",this.currMsg["ina_game"])
      console.log("you are : ", this.currMsg["me"]["fname"], "  |  Your lvl : ", this.currMsg["me"]["lvl"])
      console.log("You will be playing against :", this.currMsg["him"]["fname"], "   |  Hes lvl : ", this.currMsg["him"]["lvl"])
      // here must fill the data
      this.cont = this.shadowRoot.getElementById("contIdx")
      // here i will build the html board by calling the function and giving it the currmsg[ina game]
      this.gType = this.currMsg["ina_game"]
      // console.log(this.generateHtmlBoard(this.gType))
      // return
      this.cont.innerHTML = generateHtmlBoard(this.gType);
      let bHolderShow = this.shadowRoot.getElementById("board_holder_id")
      setTimeout(() => {
          bHolderShow.style.marginRight = "0%"
      }, 10)

      console.log("-------------->>>> ",this.currMsg["board"])
      this.board = this.currMsg["board"]
      // this.updateBoard()
      this.cells =  Array.from(this.shadowRoot.querySelectorAll(".cell"))
      // this.pSign = this.currMsg["player"]  // not needed ??
      this.turnShow = this.shadowRoot.getElementById("turnShow")
      // this.turnShow.style.marginTop = "0%"

      this.zhisP = new Player(this.shadowRoot, "thisPlayer_score", "thisPlayer_arm", "thisPlayer_char", "turnToggleZis", "thisPlayer_name", "thisPlayer_img");
      this.thatP = new Player(this.shadowRoot, "opponent_score", "opponent_arm", "opponent_char", "turnToggleThat", "opponent_name", "opponent_img");
      
      this.zhisP.setPlayerName(this.currMsg["me"]["fname"])
      this.zhisP.setPlayerImg(this.currMsg["me"]["pic"])
      this.thatP.setPlayerName(this.currMsg["him"]["fname"])
      this.thatP.setPlayerImg(this.currMsg["him"]["pic"])

      this.setupDataBoard(0,0)
      // this.turnShow.style.marginTop = "100%"
      this.turnShow.textContent = this.zhisP.turn ? "Your Turn" : "Opponent's Turn"
      // this.turnShow.style.marginTop = "0%"

      if ( this.cells.length === this.gType * this.gType )
      {
          this.elements = this.cells.map(id => this.shadowRoot.getElementById(id));
          // console.log("after Replace size : ", this.elements.length)
          // if ( this.pSign === this.fplayer )
          if ( this.currMsg["turn"] )
              await this.setBoardToClick()
          else
              await this.removeClick()

      }
      else
      {
          console.log("NOT GOOOD TRYING AGAIN")
          setTimeout(this.setup_game_field.bind(this), 10)
      }
      // return
  }

  updateDataBoard(){
      this.zhisP.updatePlayerTurn(this.currMsg["turn"])
      this.thatP.updatePlayerTurn(!this.currMsg["turn"])
      this.turnShow.textContent = this.currMsg["turn"] ? "Your Turn" : "Opponent's Turn"
  }

  async in_game(){
      // if (this.currMsg["board"])
      console.log("I got here buddy", this.currMsg["board"])
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
    // console.log(i)
    if (lm && this.board[i] === ".") {
        console.log("gg")
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
// console.log("hhhhhhhh : ", idx)
// if( idx > 8 || idx < 0 )
//     return

// console.log("EV = ", ev)
this.save_ev = ev
const msg = {
    type : "in_game",
    clickIdx : idx
}
matchingSocket.send(JSON.stringify(msg))
}

t3.prototype.updateBoard = function() {
console.log("rah dkheeeeeelt hna ")
this.cells.forEach( (lm, i) => {
    console.log("o hta hnaaaaaaaaaaaaaa")
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
      this.playbtn1.addEventListener('click',this.playClassic.bind(this))
      this.playbtn2.addEventListener('click',this.playFt4.bind(this))
// </div><div id="contIdx" class="container df_fdc_jcc_aic">

      

      this.principal_html = `<div id="id_dynamic" class="dynamic">
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
                    <button class="play_btn play_btn1" onclick="playClassic()">PLAY 3/3 Classic</button>
                    <button class="play_btn play_btn2" onclick="playFt4()">PLAY 5/5 FT4</button>
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

  // we said here i will take a string to define the type of request 
  // if it comes from friend invite 
  // or from the play button random
  async playgame (gameType) {
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
      
      let first_to = this.shadowRoot.querySelector('input[name="game-choice"]:checked').value;
      if (!first_to) {
          console.error("No game choice selected.");
          return;
      }
      try {
          matchingSocket = new WebSocket(`/ws/play/?Token=${tok}`);
      } catch (error) {
          console.error("Error creating WebSocket connection:", error);
          return;
      }
      // gg.matchingSocket.onopen = here i should tell if they are playing 3 5 or 7
      // and the tail size etc ....
      matchingSocket.onopen = async () => {
          // alert('tconnecctaa');
          // this on open msg sent is for the default, but for the friend game
          // it must be another msg that will hold the username of the friend
          const msg = {
              "type" : gameType,
              "first_to": first_to
          }
          matchingSocket.send(JSON.stringify(msg));
          
          game_obj = new t3(this.shadowRoot)
      }
      matchingSocket.onmessage = async (event) => {
          game_obj.currMsg = JSON.parse(event.data)
          console.log("what i got : ", game_obj.currMsg.type)
          console.log("all : ", game_obj.currMsg)
          if (game_obj.functionMap.has(game_obj.currMsg.type))
              await game_obj.functionMap.get(game_obj.currMsg.type)()
      }
      matchingSocket.onerror = (event) => {
          console.log('this is matchingsocket.onerror function')
          matchingSocket = null
          // gg = null
      }
      matchingSocket.onclose = (event) => {
          // 4010 is the end of game close, not back to home but to the gameover
          // then he must click [OK] to go back to home
          if (event.code != 4010)
              back_to_home(this.shadowRoot)   
          matchingSocket = null
          // should not be null because there is the button OK to quit the gameover there will call the 
          // back home and free gg
          // gg = null
          // event.wasClean = true ? console.log("clean") : console.log("not clean")
      }
      // console.log("WHAT ?")
  }

    async playClassic () {
        await this.playgame("ft_classic")
    }

    async playFt4 () {
        await this.playgame("ft4")
    }

  leaveGame() {
      const msg = { type : "leaveGame" }
      matchingSocket.send(JSON.stringify(msg))

      // if ( matchingSocket && matchingSocket.readyState === WebSocket.OPEN )
      //     matchingSocket.close(1000)
      // console.log("hello world")
      // location.reload();
  }



  // function that add and remove onclick event 

  

  // -----------------------> must fetch data here using token JWT instead of ID
  // fetchGameData(){

  //     let list = document.getElementById("listOfLGID")
  //     getAccessToken()
  //             .then(accessToken => {
  //                 console.log("hhhhhhhhhhhhhhhhhhhhhhhh :", accessToken)
  //                 return fetch('/gamesByWinId/', {
  //                     method: 'GET',
  //                     headers: { 'Authorization': `Bearer ${accessToken}`}
  //                 })
  //             })
  //             .then(response => response.json())
  //             .then(data => { console.log(data); 
  //                 data.forEach( game => {
  //                     // console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ before : ', game)
  //                     gameUnit(game, list)
  //                 })
  //             })
  //             .catch(error => {
  //                 console.error('Error:', error)
  //                 list.textContent = "Error fetching data ! Please try to refresh the page !"
  //                 // re-call the fetchGameData
  //             });
  // }

  
  // window.location.host
      
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
        console.log("dekhle l disco callback ")
        if (matchingSocket && matchingSocket.readyState === WebSocket.OPEN)
            matchingSocket.close()
        // matchingSocket = null
        game_obj = null
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
          divChar.textContent = cell; // Keep uppercase if it's a winning combo
          divChar.className = "win-combo"; // Highlight winning combo
          divChar.style.backgroundColor = "green" // Do not add anything for empty cells
        } else {
          divChar.textContent = cell.toLowerCase(); // Convert to lowercase otherwise
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
  // console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ : ', unit.winner_or_looser)
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
        console.log("hhhhhhhhhhhhhhhhhhhhhhhh :", accessToken)
        return fetch('/gamesByWinId/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}`}
        })
    })
    .then(response => response.json())
    .then(data => { console.log(data); 
        data.forEach( game => {
            // console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ before : ', game)
            gameUnit(game, list)
        })
    })
    .catch(error => {
        console.error('Error:', error)
        list.textContent = "Error fetching data ! Please try to refresh the page !"
        // re-call the fetchGameData
    });
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
        // Get the necessary elements from the DOM
        this.shadowRoot = shadowRoot
        this.boardSlots = this.shadowRoot.querySelectorAll('.bSlot');
        this.statsXWins = this.shadowRoot.querySelector('.stats:nth-child(1) h1');
        this.statsDraws = this.shadowRoot.querySelector('.stats:nth-child(2) h1');
        this.statsOWins = this.shadowRoot.querySelector('.stats:nth-child(3) h1');
        this.resetButton = this.shadowRoot.querySelector('.reset');
        this.startButton = this.shadowRoot.querySelector('.animWinLose h1');
        this.animWinLose = this.shadowRoot.querySelector('.animWinLose h1');
        this.playerMode = this.shadowRoot.querySelector('input[name="playerMode"]:checked').value; // Get the initial mode
        this.playerTurn = 'X'; // X always starts
        this.movesCount = 0;
        // this.boardState = Array(9).fill(null); // Empty board
        this.boardState = Array.from({ length: 9 }, (_, index) => index);

        this.xWins = 0;
        this.oWins = 0;
        this.draws = 0;
        this.isGameActive = false; // Track if the game is active

        // Initialize game event listeners
        this.initListeners();
    }

    // Initialize click listeners on board slots, reset, start button, and radio buttons
    initListeners() {
        // Listen for the "Start" button click
        // console.log("beningin ::: ", this.playerMode)
        this.startButton.addEventListener('click', () => this.startGame());

        // Listen for the reset button click
        this.resetButton.addEventListener('click', () => this.resetScores());

        // Add event listeners to the radio buttons to reset the game mode
        this.shadowRoot.querySelectorAll('input[name="playerMode"]').forEach(radio => {
            radio.addEventListener('change', (event) => this.changeMode(event.target.value));
        });

        // Add click event listeners to the board slots
        this.boardSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.handleSlotClick(slot, index));
        });
    }

    changeMode(mode) {
        this.playerMode = mode;
        this.resetGame(); // Reset the board whenever mode changes
        this.resetScores(); // Reset the scores as well
        this.animWinLose.textContent = 'START'; // Update the text back to "START"
        this.startButton.textContent = 'START'; // Reset start button text
    }

    startGame() {
        if (this.isGameActive) return; // Prevent starting if already active
        console.log("ggggggggggggggggggggggg")
        this.animWinLose.textContent = `${this.playerTurn}'s Turn`; // Show who's turn it is
        this.isGameActive = true; // Mark the game as active
        this.movesCount = 0;
        this.playerTurn = 'X'; // X always starts
        // this.boardState.fill(null); // Clear the board state
        this.boardState = Array.from({ length: 9 }, (_, index) => index); // [0, 1, 2, ..., 8]

    
        // Clear the board display and reset classes
        this.boardSlots.forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('xSlot', 'oSlot');
        });
        this.startButton.textContent = 'Playing'; // Update Start button
        
        // Enable the slots for interaction
        this.enableBoard();
    }

    enableBoard() {
        this.boardSlots.forEach(slot => {
            slot.style.pointerEvents = 'auto'; // Enable interaction
        });
    }

    disableBoard() {
        this.boardSlots.forEach(slot => {
            slot.style.pointerEvents = 'none'; // Disable interaction
        });
    }

    resetGame() {
        // this.boardState.fill(null); // Clear the board state
        this.boardState = Array.from({ length: 9 }, (_, index) => index); // [0, 1, 2, ..., 8]
        this.playerTurn = 'X'; // X always starts
        this.movesCount = 0;
        this.isGameActive = false;

        // Clear the board display and reset classes
        this.boardSlots.forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('xSlot', 'oSlot');
        });

        this.animWinLose.textContent = 'START'; // Reset display text
        this.startButton.textContent = 'Start'; // Reset Start button
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
        if (!this.isGameActive || typeof this.boardState[index] !== 'number') return; // Ignore if game not active or slot filled

        // Set the clicked slot with the current player's symbol (X or O)
        this.boardState[index] = this.playerTurn;
        slot.textContent = this.playerTurn;
        slot.classList.add(this.playerTurn === 'X' ? 'xSlot' : 'oSlot');
        this.movesCount++;

        // Check if the current player has won or if the game is a draw
        // this.switchTurn();
        let gameStatus = this.checkWin(this.boardState, this.playerTurn);
        console.log("gameStatus ::: ", gameStatus)
        if (gameStatus) {
            this.announceWinner(this.playerTurn);
        }
        else if (this.movesCount === 9) {
            this.announceDraw();
        }
        else {
            if (this.playerMode === '1' && this.playerTurn === 'X') {
                // If it's 1-player mode and X just played, disable board and make the bot (O) play
                this.disableBoard();  // Disable clicks while bot is playing
                this.switchTurn();
                setTimeout(() => {
                    // this.minimax(this.boardState, this.playerTurn);  // Bot plays after short delay
                    const bestMove = this.minimax(this.boardState, this.playerTurn).index;
                    // console.log("bestMove ::: ", bestMove)
                    this.handleSlotClick(this.boardSlots[bestMove], bestMove);
                    // this.boardState[bestMove] = this.playerTurn;
                    if (this.isGameActive)
                        this.enableBoard(); // Re-enable the board after bot finishes playing
                }, 500);
            } else {
                this.switchTurn(); // Switch turns in 2-player mode or after bot's turn
            }
        } 
        // else
        //     this.switchTurn();
    }

    checkWin(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        // console.log("winPatterns ::: ")
        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === player);
        });
    }

    announceWinner(player) {
        this.animWinLose.textContent = `${player} Wins!`;
        this.animWinLose.classList.add('win-animation');
        this.isGameActive = false;
        this.startButton.textContent = 'START AGAIN'; // Update Start button for a new game
        if (player === 'X') {
            this.xWins++;
            this.statsXWins.textContent = this.xWins;
        } else {
            this.oWins++;
            this.statsOWins.textContent = this.oWins;
        }

        // Disable further moves
        this.disableBoard();
    }

    announceDraw() {
        this.animWinLose.textContent = "It's a Draw!";
        this.animWinLose.classList.add('draw-animation');
        this.isGameActive = false;
        this.startButton.textContent = 'START AGAIN'; // Update Start button for a new game
        this.draws++;
        this.statsDraws.textContent = this.draws;

        this.disableBoard();
    }

    switchTurn() {
        this.playerTurn = this.playerTurn === 'X' ? 'O' : 'X';
        console.log("this.playerTurn ::: ", this.playerTurn)
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
        // console.log("bestMove ::: ", bestMove)
        
        return moves[bestMove];
    }

}






customElements.define("game-page", GamePage);
  