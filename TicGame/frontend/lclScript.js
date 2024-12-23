let huPlayer = 'X';
let aiPlayer = 'O';

class TicTacToeGame {
    constructor() {
        // Get the necessary elements from the DOM
        this.boardSlots = document.querySelectorAll('.bSlot');
        this.statsXWins = document.querySelector('.stats:nth-child(1) h1');
        this.statsDraws = document.querySelector('.stats:nth-child(2) h1');
        this.statsOWins = document.querySelector('.stats:nth-child(3) h1');
        this.resetButton = document.querySelector('.reset');
        this.startButton = document.querySelector('.animWinLose h1');
        this.animWinLose = document.querySelector('.animWinLose h1');
        this.playerMode = document.querySelector('input[name="playerMode"]:checked').value; // Get the initial mode
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
        document.querySelectorAll('input[name="playerMode"]').forEach(radio => {
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
    
        this.animWinLose.textContent = `${this.playerTurn}'s Turn`; // Show who's turn it is
        this.isGameActive = true; // Mark the game as active
        this.movesCount = 0;
        // this.boardState.fill(null); // Clear the board state
        this.boardState = Array.from({ length: 9 }, (_, index) => index); // [0, 1, 2, ..., 8]

    
        // Clear the board display and reset classes
        this.boardSlots.forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('xSlot', 'oSlot');
        });
    
        // Enable the slots for interaction
        this.enableBoard();
    }

    enableBoard() {
        this.boardSlots.forEach(slot => {
            slot.style.pointerEvents = 'auto'; // Enable interaction
        });
        this.startButton.textContent = 'Playing'; // Update Start button
    }

    disableBoard() {
        this.boardSlots.forEach(slot => {
            slot.style.pointerEvents = 'none'; // Disable interaction
        });

        this.startButton.textContent = 'START AGAIN'; // Update Start button for a new game
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
                setTimeout(() => {
                    this.switchTurn();
                    // this.minimax(this.boardState, this.playerTurn);  // Bot plays after short delay
                    const bestMove = this.minimax(this.boardState, this.playerTurn).index;
                    // console.log("bestMove ::: ", bestMove)
                    this.handleSlotClick(this.boardSlots[bestMove], bestMove);
                    // this.boardState[bestMove] = this.playerTurn;
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
        // console.log("bestMove ::: ", bestMove)
        
        return moves[bestMove];
    }

}














document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
});