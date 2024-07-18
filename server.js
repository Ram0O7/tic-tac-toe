const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let currentPlayer = "X";
let gameState = Array(9).fill("");

app.use(express.static("public"));

let playerSockets = [];
let currentPlayerSocketId;
io.on("connection", (socket) => {
  if (playerSockets.length < 2) {
    playerSockets.push(socket.id);
    currentPlayerSocketId = playerSockets[0];

    socket.emit("updateGame", { currentPlayer, gameState });

    socket.on("resetGame", () => {
      gameState = Array(9).fill("");
      currentPlayer = "X";
      io.emit("reloadPage");
      io.emit("updateGame", { gameState, currentPlayer });
    });

    socket.on("play", (data) => {
      const { position } = data;
      if (gameState[position] === "" && socket.id !== currentPlayerSocketId) {
        gameState[position] = currentPlayer;
        if (checkWin()) {
          io.emit("updateGame", { currentPlayer, gameState });
          io.emit("gameOver", { winner: currentPlayer });
        } else if (checkDraw()) {
          io.emit("updateGame", { currentPlayer, gameState });
          io.emit("gameOver", { winner: "draw" });
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          currentPlayerSocketId = getCurrentPlayerSocketId();
          io.emit("updateGame", { currentPlayer, gameState });
        }
      } else {
        socket.emit("wrongTurn");
      }
    });
  }
});

const getCurrentPlayerSocketId = () => {
  if (currentPlayer === "X") {
    return playerSockets[0];
  } else {
    return playerSockets[1];
  }
};

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

  return winningCombinations.some((combination) => {
    const [a, b, c] = combination;
    return (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    );
  });
};

const checkDraw = () => {
  return gameState.every((cell) => cell !== "");
};

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
