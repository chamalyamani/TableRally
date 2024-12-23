
// console.log(window.location.host)

// let matchingSocket;
// let fplayer = "x"
// let splayer = "o"
// let pSign = ""
// let cells = []
// let  elements = [] ;  
// let board = [
//     ["0", "0", "0"],
//     ["0", "0", "0"],
//     ["0", "0", "0"]
// ];

let save_ev
const htmlBoard = `<div id="contIdx" class="container">
<h1>Tic-Tac-Toe</h1>
<div class="board">
    <div class="cell disabled" id="cell-0"></div>
    <div class="cell disabled" id="cell-1"></div>
    <div class="cell disabled" id="cell-2"></div>
    <div class="cell disabled" id="cell-3"></div>
    <div class="cell disabled" id="cell-4"></div>
    <div class="cell disabled" id="cell-5"></div>
    <div class="cell disabled" id="cell-6"></div>
    <div class="cell disabled" id="cell-7"></div>
    <div class="cell disabled" id="cell-8"></div>
</div>
<button id="restart-button" onclick="reset()">Quit</button>
</div>`

class t3 {
    constructor() {
        this.matchingSocket = NULL;
        this.fplayer = "x";
        this.splayer = "o";
        this.pSign = "";
        this.cells = [];
        this.elements = [];
        this.cont = document.getElementById("cont")
        this.board = [
            ["0", "0", "0"],
            ["0", "0", "0"],
            ["0", "0", "0"]
        ]
        this.functionMap = new Map()

        functionMap.set("waiting", this.waiting.bind(this))
        functionMap.set("setup", this.setup_game_field.bind(this))
        functionMap.set("setting_gup", this.start_game.bind(this))
        functionMap.set("in_game", this.in_game.bind(this))
    }
    waiting(){
        let counter = 1
        const intervalId = setInterval(() => {
            this.cont.innerHTML = `
                <h1 class="wait"> WAITING FOR YOUR OPPONNENT TO JOIN in ${counter}</h1>
            `
            counter++; // Increment the counter
            
            if (counter > 10) { // Check if the counter has reached 20
                clearInterval(intervalId); // Stop the timer && must re
            }
            }, 1000);
    }
    setup_game_field(){
        this.cont.outerHTML = htmlBoard;
        this.cells =  Array.from(document.getElementsByClassName("cell"))
        this.elements = cells.map(id => document.getElementById(id));
        console.log("after Replace size : ", elements.length)
        const msg_start = {
            type: "setting_gup"
        }
        if ( this.matchingSocket.readyState === WebSocket.OPEN)
        {
            this.matchingSocket.send(JSON.stringify(msg_start))
            console.log("i've sent this msg : ", msg_start)
        }
    }
    async start_game(){
        console.log("Ha LI GLNA: ", msg["player"])
        if ( msg["player"] === fplayer )
        {
            // set the board to onclick to listen

            console.log("gg you are X")
            pSign = msg["player"]
            await setBoardToClick()
            // create the array* board to comm with backend
            // here must give onclick to the first player
        }
        else
        {
            console.log("gg you are O")
            pSign = msg["player"]
            await removeClick()
        }
    }
    async in_game(){
        if (msg["board"])
            console.log("I got here buddy", msg)

        board = msg["board"]
        updateBoard()
        if ( msg["turn"] === "on")
        {
            await setBoardToClick()
        }
        else
        {
            save_ev.target.removeEventListener('click', lmClick)
            save_ev.target.classList.add("disabled")
            // save_ev.target.innerHTML += '<p>' + pSign + '</p>'
            await removeClick()
        }
    }
}

t3.prototype.setup_game_field = () => {
    
}

t3.prototype.playgame = () => {

    this.matchingSocket = new WebSocket(
        'ws://' + 'localhost:8001' + '/ws/game/'
    )
    
    this.matchingSocket.onmessage = async function(event){
        const msg = JSON.parse(event.data)
        console.log("what i got : ", msg.type)
        if (this.functionMap[msg.type])
            this.functionMap[msg.type]()
    }
}

// function that add and remove onclick event 

t3.prototype.setBoardToClick = async () =>
{
    let i = 0
    console.log("rah dkhel hna...")
    elements.forEach( lm => {
        if( lm )
        {
            if (board[Math.floor(i / 3)][i%3] === "0")
            {
                lm.addEventListener('click', lmClick)
                lm.classList.remove("disabled")
            }
        }
        i++
    })
}

t3.prototype.removeClick = async () =>
{
    elements.forEach( lm => {
        if( lm )
        {
            lm.removeEventListener('click', lmClick)
            lm.classList.add("disabled")
        }
    })
}

t3.prototype.lmClick = (ev) =>
{
    const idx = elements.indexOf(ev.target)
    // idx must be protected to from 0 to 8
    board[Math.floor(idx / 3)][idx%3] = pSign
    console.log("board[Math.floor(idx / 3)][idx%3]    ::: " ,pSign)

    // ill send you the board 
    // with ingame msg
    // who played now
    save_ev = ev
    const msg = {
        type : "in_game",
        player : pSign,
        theBoard : board
    }
    matchingSocket.send(JSON.stringify(msg))
    console.log(idx)
    // ev.target.removeEventListener('click', lmClick)
    // ev.target.classList.add("disabled")
    // ev.target.innerHTML += '<p>' + pSign + '</p>'
}

t3.prototype.updateBoard = () =>
{
    let i = 0;
    elements.forEach( lm => {
        if( lm && board[Math.floor(i / 3)][i%3] != "0" && lm.innerHTML.trim() === "")
            lm.innerHTML += '<p>' + board[Math.floor(i / 3)][i%3] + '</p>'
        i++
    })
}

// window.location.host