const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");
const resetScoresButton = document.getElementById("reset-scores");
const vsComputer = document.getElementById("vs-computer");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;
const scores = { X: 0, O: 0, draw: 0 };

// Returns { winner, line } if someone has won, "draw" if the board is full, or null.
function checkResult(b) {
  for (const line of WIN_LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], line };
    }
  }
  return b.every(Boolean) ? "draw" : null;
}

function play(index) {
  if (gameOver || board[index]) return;

  board[index] = currentPlayer;
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const result = checkResult(board);
  if (result) {
    endRound(result);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${currentPlayer}'s turn`;

  if (vsComputer.checked && currentPlayer === "O") {
    setTimeout(() => play(bestMove(board)), 350);
  }
}

function endRound(result) {
  gameOver = true;
  cells.forEach((cell) => (cell.disabled = true));

  if (result === "draw") {
    scores.draw++;
    statusText.textContent = "It's a draw!";
  } else {
    scores[result.winner]++;
    result.line.forEach((i) => cells[i].classList.add("win"));
    statusText.textContent = `${result.winner} wins!`;
  }
  updateScores();
}

function updateScores() {
  document.querySelector("#score-x strong").textContent = scores.X;
  document.querySelector("#score-o strong").textContent = scores.O;
  document.querySelector("#score-draw strong").textContent = scores.draw;
}

function restart() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  statusText.textContent = "X's turn";
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.className = "cell";
    cell.disabled = false;
  });
}

// The computer plays O and uses minimax, so it never loses.
function bestMove(b) {
  let bestScore = -Infinity;
  let move = null;
  b.forEach((value, i) => {
    if (value) return;
    b[i] = "O";
    const score = minimax(b, 0, false);
    b[i] = null;
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  });
  return move;
}

function minimax(b, depth, isMaximizing) {
  const result = checkResult(b);
  if (result === "draw") return 0;
  if (result) return result.winner === "O" ? 10 - depth : depth - 10;

  let best = isMaximizing ? -Infinity : Infinity;
  b.forEach((value, i) => {
    if (value) return;
    b[i] = isMaximizing ? "O" : "X";
    const score = minimax(b, depth + 1, !isMaximizing);
    b[i] = null;
    best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
  });
  return best;
}

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    // While the computer is thinking, ignore clicks.
    if (vsComputer.checked && currentPlayer === "O") return;
    play(Number(cell.dataset.index));
  });
});

restartButton.addEventListener("click", restart);

resetScoresButton.addEventListener("click", () => {
  scores.X = scores.O = scores.draw = 0;
  updateScores();
  restart();
});

vsComputer.addEventListener("change", restart);
