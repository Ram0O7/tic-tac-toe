const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.emit('updateGame', { currentPlayer, gameState });
    
    // Handle reset game event from the client
    socket.on('resetGame', () => {
        gameState = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        socket.emit('updateGame', { gameState, currentPlayer });
    });
    
    socket.on('play', (data) => {
        const { position } = data;
        if (gameState[position] === '') {
            gameState[position] = currentPlayer;
            if (checkWin()) {
                io.emit('updateGame', { currentPlayer, gameState });
                io.emit('gameOver', { winner: currentPlayer });
            } else if (checkDraw()) {
                io.emit('updateGame', { currentPlayer, gameState });
                io.emit('gameOver', { winner: "draw" });
            }
            else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    io.emit('updateGame', { currentPlayer, gameState });
                }
            }
        });
});

const checkWin = () => {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (gameState[a] === currentPlayer && gameState[b] === currentPlayer && gameState[c] === currentPlayer) {
            return true;
        }
    }
    return false;
}

const checkDraw = () => {
    for(let i=0; i<9; i++){
        if(gameState[i] === ""){
            return false;
        }
    }
    return true;
}

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
