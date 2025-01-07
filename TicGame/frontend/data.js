
// let dynamic_div = document.getElementById('id_dynamic');

let gOver_html = `
        <div class="winloss" id="losswin">
            <h1 id="msg"></h1>
            <h2>Number of Games Played: <span id="nbofgames"></span></h1>
            <h3>You Scored : <span id="winScore"></span></h1>
            <h3>He Scored : <span id="hescore"></span></h1>
            <button class="button" id="quitBtn">OK</button>
        </div>
        `;
// </div><div id="contIdx" class="container df_fdc_jcc_aic">

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

