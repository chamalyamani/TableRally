

let btn_play = `<button class="play_btn" onclick="playgame()">PLAY</button>`
let matchingSocket = null



class Player {
    constructor(scoreElementId, armElementId, charElementId, turnElementId, nameElementId, imgElementId) {
        this.scoreElement = document.getElementById(scoreElementId);
        this.armElement = document.getElementById(armElementId);
        this.charElement = document.getElementById(charElementId);
        this.turnElement = document.getElementById(turnElementId);
        this.nameElement = document.getElementById(nameElementId);
        this.imgElement = document.getElementById(imgElementId);
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
    constructor() {
        
      this.gameOver = `
      <div id="contIdx" class="container df_fdc_jcc_aic">
        <div class="winloss" id="losswin">
            <h1 id="msg"></h1>
            <h2>Number of Games Played: <span id="nbofgames"></span></h1>
            <h3>You Scored : <span id="winScore"></span></h1>
            <h3>He Scored : <span id="hescore"></span></h1>
            <button class="button" id="quitBtn">OK</button>
        </div>
        </div>
      `
        // this.matchingSocket = null;
        this.currMsg = null;
        this.zhisP = null
        this.thatP = null
        // this.pSign = "";
        this.save_ev = null;
        this.cells = [];
        this.elements = [];
        this.cont = document.getElementById("contIdx")
        this.winloss = document.getElementById("losswin")
        this.turnShow = document.getElementById("turnShow")
        this.first_to = document.querySelector('input[name="game-choice"]:checked').value;
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
        // this.functionMap.set("partyResult", this.partyRes.bind(this))
        this.functionMap.set("opponentLeft", this.oppLeftGame.bind(this))

        // this.functionMap.set("inform", this.inform.bind(this))
        // this.functionMap.set("loose", this.loose.bind(this))
        // this.functionMap.set("draw", this.loose.bind(this))
        // this.setupDataBoard.bind(this)
        // this.updateDataBoard.bind(this)
        // this.playAgain.bind(this)
        this.quit.bind(this)
        this.lmClickHandler = this.lmClick.bind(this);
    }
  
    generateHtmlBoard(ina_game){
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
      <div class="" id="gameTimer">
        <h1 class="df_jcc_aic">30s</h1>
        <div class="loaderTimer"></div>
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
    // inform(){
    //     // this.winloss = document.getElementById("losswin")
    //     let announce = document.getElementById("msg")
    //     announce.innerHTML = ""
    //     announce.innerHTML = this.currMsg["msg"]
    //     console.log("inform : ", announce)
    // }
    oppLeftGame(){
        // this.winloss = document.getElementById("losswin")
        // let announce = document.getElementById("msg")
        const winMsg = document.getElementById("popup");
        winMsg.textContent = ""
        winMsg.textContent = this.currMsg["message"]
        winMsg.style.color = "red"
        winMsg.style.display = "flex"; 
        setTimeout(() => {
            this.removeClick()
            if ( matchingSocket && matchingSocket.readyState === WebSocket.OPEN )
                matchingSocket.close(1000)
            // location.reload()
        }, 1000);
        // console.log("inform : ", announce)
    }
    async partyRes(){
        let pop = document.getElementById("popup")
        if ( this.currMsg["msg"] )
        {
            this.turnShow.innerHTML = "You Won !"
            await this.showWinMessage("You Won !")
        }
        else
        {
            this.turnShow.innerHTML = "You Lost !"
            await this.showWinMessage("You Lost !")
        }
        // this.zhisP.updatePlayerScore(this.currMsg["myscore"])
        // this.thatP.updatePlayerScore(this.currMsg["hiscore"])
        // let score = this.currMsg["score"]
        // this.wins+= score
        // update score players
        // switch to display Who won 
        // 
    }

    async showWinMessage(mesg) {
        const winMsg = document.getElementById("popup");
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
    
        // setTimeout(() => {
        //     console.log("give the none back")
        //     this.currMsg["combo"].forEach(index => {
        //         const cell = this.cells[index];
        //         cell.classList.remove("win-highlight");
        //     });
        //     winMsg.style.display = "none";
        //     winMsg.classList.remove("win", "lose", "draw")
        // }, 2000);
    }
    waiting(){
        let counter = 1
        document.getElementById("id_dynamic").style.opacity = "0"
        setTimeout(() => {
            this.cont.innerHTML = `
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
            </div>
        `
            setTimeout(() => {
            document.getElementById("id_wait").style.marginLeft = "0%"
            }, 10)
        }, 50)

        

        // const intervalId = setInterval(() => {
        //     counter++; // Increment the counter
            
        //     if (counter > 30) { // Check if the counter has reached 20
        //         clearInterval(intervalId); // Stop the timer && must re
        //         // location.reload()
        //         // matchingSocket = null
        //         // gg = null
        //     }
        // }, 1000);
    }

    // playAgain()
    // {
    //     console.log("gg you click on play again")
    //     playAgainBtn.style.backgroundColor = 'green'
    //     const msg = {
    //         type : "playAgain",
    //         // player : this.pSign,
    //         // theBoard : this.board
    //     }
    //     matchingSocket.send(JSON.stringify(msg))
    // }
    
    quit()
    {
        // console.log(this)
        // quitGameBtn.style.backgroundColor = 'red'
        // const msg = {
        //     type : "quitGame",
        //     // player : this.pSign,
        //     // theBoard : this.board
        // }
        // matchingSocket.send(JSON.stringify(msg))
        location.reload()

        // console.log("hello world")
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
        this.cont = document.getElementById("contIdx")
        this.cont.outerHTML = this.gameOver;

        // document.querySelector('.winloss').firstChild.textContent = this.currMsg["msg"]
        document.querySelector('.winloss').style.display = 'flex';
        // document.getElementById("turnShow").innerText = this.currMsg["msg"]
        // let playAgainBtn = document.getElementById('playAgainBtn')
        let quitGameBtn = document.getElementById('quitBtn')
        let msgRes = document.getElementById("msg")
        let winScore = document.getElementById('winScore')
        let nb_games = document.getElementById('nbofgames')
        let hescore = document.getElementById('hescore')
        // console.log("Ha ch9amto : ",this.currMsg["wins"])
        msgRes.textContent = this.currMsg["msg"]
        if ( this.currMsg["message"] )
            msgRes.style.color = "green"
        else
            msgRes.style.color = "red"
        winScore.textContent = this.currMsg["wins"]
        nb_games.textContent = this.currMsg["nbGames"]
        hescore.textContent = this.currMsg["opwins"]
        // playAgainBtn.addEventListener('click', this.playAgain.bind(this))
        quitGameBtn.addEventListener('click', this.quit.bind(this))

        // document.querySelector('.winloss').style.marginTop = '20vh';
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
        this.cont = document.getElementById("contIdx")
        // here i will build the html board by calling the function and giving it the currmsg[ina game]
        this.gType = this.currMsg["ina_game"]
        // console.log(this.generateHtmlBoard(this.gType))
        // return
        this.cont.outerHTML = this.generateHtmlBoard(this.gType);
        let bHolderShow = document.getElementById("board_holder_id")
        setTimeout(() => {
            bHolderShow.style.marginRight = "0%"
        }, 10)

        console.log("-------------->>>> ",this.currMsg["board"])
        this.board = this.currMsg["board"]
        // this.updateBoard()
        this.cells =  Array.from(document.getElementsByClassName("cell"))
        // this.pSign = this.currMsg["player"]  // not needed ??
        this.turnShow = document.getElementById("turnShow")
        // this.turnShow.style.marginTop = "0%"
  
        this.zhisP = new Player("thisPlayer_score", "thisPlayer_arm", "thisPlayer_char", "turnToggleZis", "thisPlayer_name", "thisPlayer_img");
        this.thatP = new Player("opponent_score", "opponent_arm", "opponent_char", "turnToggleThat", "opponent_name", "opponent_img");
        
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
            this.elements = this.cells.map(id => document.getElementById(id));
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
        
        // let thisPlayerTurn = document.getElementById("turnToggleZis")

        
        // let opponentTurn = document.getElementById("turnToggleThat")


        // thisPlayerTurn.style.backgroundColor = this.currMsg["turn"] ? "green" : "red"
        // opponentTurn.style.backgroundColor = this.currMsg["turn"] ? "red" : "green"
        this.zhisP.updatePlayerTurn(this.currMsg["turn"])
        this.thatP.updatePlayerTurn(!this.currMsg["turn"])
        // this.turnShow.classList.toggle("tshowanim")
        // this.turnShow.style.marginTop = "100%"
        this.turnShow.textContent = this.currMsg["turn"] ? "Your Turn" : "Opponent's Turn"
        // this.turnShow.classList.toggle("tshowanim")
        // this.turnShow.style.marginTop = "0%"
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

function getAccessToken() {
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



async function playgame (gameType) {
    if ( matchingSocket && matchingSocket.readyState === WebSocket.OPEN )
        return
    let tok;
    await getAccessToken()
        .then(accessToken => {
            tok = accessToken;
        })
        .catch(error => {
            console.error('Error getting access token:', error);
            alert('Error getting access token', error.message);
        }); 

    matchingSocket = new WebSocket(`/ws/play/?Token=${tok}`)
    // gg.matchingSocket.onopen = here i should tell if they are playing 3 5 or 7
    // and the tail size etc ....
    let gg = new t3()
    matchingSocket.onopen = async function () {
        // alert('tconnecctaa');
        const msg = {
            "type" : gameType,
            "first_to": gg.first_to
        }
        matchingSocket.send(JSON.stringify(msg));
    }
    // console.log("WHAT ?")
    matchingSocket.onmessage = async function(event)
    {
        // console.log("ON MESSAGE")
        gg.currMsg = JSON.parse(event.data)
        console.log("what i got : ", gg.currMsg.type)
        console.log("all : ", gg.currMsg)
        if (gg.functionMap.has(gg.currMsg.type)){
            // console.log("in IF WINDRaw")
            await gg.functionMap.get(gg.currMsg.type)()
        }
        else
        {
            console.log("wayliiiiii  else ??")
        }
    }
    matchingSocket.onclose = async function(event)
    {
        // let contIDX = document.getElementById("contIdx")
        // contIDX.innerHTML = ""
        // contIDX.innerHTML = `<button class="play_btn" onclick="playgame()">PLAY</button>`
        // console.log("by by : ",gg.cont)
        console.log('this is matchingsocket.onclose function')
        // location.reload()
        matchingSocket = null
        gg = null

        // console.log("by by : ",gg)
    }
}

async function playClassic () {
    await playgame("ft_classic")
}

async function playFt4 () {
    await playgame("ft4")
}

function leaveGame() {
    const msg = {
        type : "leaveGame",
        // player : this.pSign,
        // theBoard : this.board
    }
    matchingSocket.send(JSON.stringify(msg))

    if ( matchingSocket && matchingSocket.readyState === WebSocket.OPEN )
        matchingSocket.close(1000)
    // console.log("hello world")
    location.reload();
}



// function that add and remove onclick event 

t3.prototype.setBoardToClick = async function (){
    this.cells.forEach( (lm, i) => {
        // console.log(i)
        if (lm && this.board[i] === ".") {
            console.log("gg")
            lm.addEventListener('click', this.lmClickHandler)
            lm.classList.remove("disabled")
        }
    })
}

t3.prototype.removeClick = async function (){
    this.cells.forEach( lm => {
        if( lm ) {
            lm.removeEventListener('click', this.lmClickHandler)
            lm.classList.add("disabled")
        }
    })
}

t3.prototype.lmClick = function (ev) {
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

t3.prototype.updateBoard = function () {
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

// window.location.host