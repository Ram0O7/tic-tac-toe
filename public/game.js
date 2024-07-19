const socket = io();
let currentPlayer;
let gameState = [];
let isGameOver = false;

// Get HTML elements
const cells = document.querySelectorAll(".cell");
const xButton = document.querySelector("#x-button");
const oButton = document.querySelector("#o-button");
const resetButton = document.querySelector("#r-button");
const btns = document.querySelector(".btns");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("updateGame", (data) => {
  gameState = data.gameState;
  currentPlayer = data.currentPlayer;
  render();
});

socket.on("gameOver", (data) => {
  handleGameOver(data.winner);
  isGameOver = true;
});

socket.on("reloadPage", () => {
  resetGameUI();
  render();
});

socket.on("wrongTurn", () => {
  alert("Wrong choice or turn!");
});

socket.on("roomFull", () => {
  alert("Room is full. Try again later.");
});

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (isGameOver) return;
    const index = cell.getAttribute("data-index");
    socket.emit("play", { position: index });
  });
});

resetButton.addEventListener("click", () => {
  socket.emit("resetGame");
});

function render() {
  cells.forEach((cell, index) => {
    cell.textContent = gameState[index];
    if (gameState[index] !== "") {
      cell.classList.add("played");
    } else {
      cell.classList.remove("played");
    }
  });
}

function resetGameUI() {
  // Reset the content and classes of each cell
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("played");
  });

  xButton.style.backgroundColor = "";
  oButton.style.backgroundColor = "";
  xButton.innerHTML = "X";
  oButton.innerHTML = "O";

  // Remove the draw button if it exists
  const drawButton = document.querySelector(".draw");
  if (drawButton) {
    drawButton.remove();
  }
  isGameOver = false;
}

function handleGameOver(winner) {
  if (winner === "O") {
    xButton.style.backgroundColor = "red";
    oButton.style.backgroundColor = "green";
    oButton.innerHTML = "WINNER 'O'";
  } else if (winner === "X") {
    oButton.style.backgroundColor = "red";
    xButton.innerHTML = "WINNER 'X'";
    xButton.style.backgroundColor = "green";
  } else {
    const drawButton = document.createElement("button");
    drawButton.innerText = "DRAW";
    drawButton.classList.add("draw");
    drawButton.style.backgroundColor = "orange";
    btns.appendChild(drawButton);
  }
}
