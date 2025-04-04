// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBnnbVdj_h3og0AfZd6EqQoxexoJVLq92c",
    authDomain: "aplicaciones-7e63f.firebaseapp.com",
    projectId: "aplicaciones-7e63f",
    storageBucket: "aplicaciones-7e63f.firebasestorage.app",
    messagingSenderId: "411353939307",
    appId: "1:411353939307:web:35c1886a850187ec40e02e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let board = [];
let rows = 10;
let cols = 10;
let mines = 15;
let minesLeft = mines;
let username = "";
let startTime = 0;
let timerInterval;

const loginContainer = document.getElementById("login-container");
const gameContainer = document.getElementById("game-container");
const scoreboardContainer = document.getElementById("scoreboard-container");
const boardElement = document.getElementById("board");
const minesLeftElement = document.getElementById("mines-left");
const timerElement = document.getElementById("timer");
const scoreboardTable = document.getElementById("scoreboard").getElementsByTagName('tbody')[0];
const restartButton = document.getElementById("restart-button");

document.getElementById("login-button").addEventListener("click", () => {
    username = document.getElementById("username").value;
    if (username) {
        loginContainer.style.display = "none";
        gameContainer.style.display = "block";
        startGame();
    }
});

restartButton.addEventListener("click", () => {
    scoreboardContainer.style.display = "none";
    gameContainer.style.display = "block";
    startGame();
});

function startGame() {
    board = createBoard(rows, cols, mines);
    renderBoard();
    minesLeft = mines;
    minesLeftElement.textContent = minesLeft;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function createBoard(rows, cols, mines) {
    const board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (board[row][col] === 0) {
            board[row][col] = "mine";
            minesPlaced++;
        }
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] !== "mine") {
                board[i][j] = countAdjacentMines(board, i, j);
            }
        }
    }
    return board;
}

function countAdjacentMines(board, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length && board[newRow][newCol] === "mine") {
                count++;
            }
        }
    }
    return count;
}

function renderBoard() {
    boardElement.innerHTML = "";
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.classList.add("board-cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", handleCellClick);
            cell.addEventListener("contextmenu", handleCellRightClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    revealCell(row, col);
}

function handleCellRightClick(event) {
    event.preventDefault();
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    toggleFlag(row, col);
}

function revealCell(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    const cell = boardElement.children[row * cols + col];
    if (cell.classList.contains("revealed") || cell.classList.contains("flagged")) return;
    
    cell.classList.add("revealed");
    
    if (board[row][col] === "mine") {
        cell.classList.add("mine");
        gameOver();
    } else if (board[row][col] === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    } else {
        cell.textContent = board[row][col];
    }
    
    checkWin();
}

function toggleFlag(row, col) {
    const cell = boardElement.children[row * cols + col];
    if (cell.classList.contains("revealed")) return;
    
    if (cell.classList.contains("flagged")) {
        cell.classList.remove("flagged");
        cell.textContent = "";
        minesLeft++;
    } else {
        cell.classList.add("flagged");
        cell.textContent = "🚩";
        minesLeft--;
    }
    
    minesLeftElement.textContent = minesLeft;
}

function checkWin() {
    let revealedCount = 0;
    const totalCells = rows * cols;
    
    for (let i = 0; i < totalCells; i++) {
        if (boardElement.children[i].classList.contains("revealed")) {
            revealedCount++;
        }
    }
    
    if (revealedCount === rows * cols - mines) {
        gameWon();
    }
}

function gameOver() {
    clearInterval(timerInterval);
    // Revelar todas las minas
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] === "mine") {
                const cell = boardElement.children[i * cols + j];
                if (!cell.classList.contains("revealed")) {
                    cell.classList.add("revealed", "mine");
                }
            }
        }
    }
    
    setTimeout(() => {
        alert("¡Perdiste!");
        showScoreboard();
    }, 500);
}

function gameWon() {
    clearInterval(timerInterval);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    
    setTimeout(() => {
        alert("¡Ganaste en " + elapsedTime + " segundos!");
        showScoreboard();
    }, 500);
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = elapsedTime;
}

async function showScoreboard() {
    gameContainer.style.display = "none";
    scoreboardContainer.style.display = "block";
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    
    // Solo guardar la puntuación si el juego se completó con éxito
    if (elapsedTime > 0) {
        await saveScore(username, elapsedTime);
    }
    
    await loadScores();
}

async function saveScore(username, time) {
    try {
        await addDoc(collection(db, "scores"), {
            username: username,
            time: time,
            date: new Date().toISOString()
        });
        console.log("Puntuación guardada correctamente");
    } catch (e) {
        console.error("Error al guardar la puntuación: ", e);
    }
}

async function loadScores() {
    try {
        scoreboardTable.innerHTML = "";
        const q = query(collection(db, "scores"), orderBy("time"));
        const querySnapshot = await getDocs(q);
        
        let position = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = scoreboardTable.insertRow();
            
            const cellPos = row.insertCell(0);
            const cellName = row.insertCell(1);
            const cellTime = row.insertCell(2);
            
            cellPos.textContent = position++;
            cellName.textContent = data.username;
            cellTime.textContent = data.time + " segundos";
        });
    } catch (e) {
        console.error("Error al cargar las puntuaciones: ", e);
        scoreboardTable.innerHTML = "<tr><td colspan='3'>Error al cargar las puntuaciones</td></tr>";
    }
}