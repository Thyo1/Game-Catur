// ==========================================
// DEKLARASI VARIABEL & ELEMEN HTML
// ==========================================
console.log("♟️ Chess Elite Engine v1.0 - Developed by Tio Syahputra");

const boardElement = document.getElementById('chessboard');
const turnStatus = document.getElementById('turn-status').querySelector('span');
const deadWhiteBin = document.getElementById('dead-white-bin'); 
const deadBlackBin = document.getElementById('dead-black-bin'); 
const toggleBtn = document.getElementById('toggle-view');
const timerDisplay = document.getElementById('match-timer');
const aiLoading = document.getElementById('ai-loading');

let matchTime = 0;
let timerInterval = null;

// --- VARIABEL CUSTOM THYO ---
let thyoBoard = [];
let thyoTurn = 'putih';
let selectedSquare = null;
let thyoValidMoves = [];
let is3DMode = true; 
let thyoMode = '';
let botLevel = 2; 

let deadWhitePieces = {};
let deadBlackPieces = {};

// ==========================================
// LOGIKA MENU NAVIGASI
// ==========================================
function showBotMenu() {
    document.getElementById('main-menu-buttons').classList.add('hidden');
    document.getElementById('bot-menu-buttons').classList.remove('hidden');
}

function hideBotMenu() {
    document.getElementById('bot-menu-buttons').classList.add('hidden');
    document.getElementById('main-menu-buttons').classList.remove('hidden');
}

function startBotGame(level) {
    botLevel = level;
    startGame('bot');
}

function startGame(mode) {
    thyoMode = mode;
    if (mode === 'online') {
        alert('Fitur Online sedang disiapkan servernya!');
        return; 
    }
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    hideBotMenu(); 
    resetGame();
}

function backToMenu() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetGame() {
    thyoBoard = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    thyoTurn = 'putih';
    selectedSquare = null;
    thyoValidMoves = [];
    matchTime = 0; 
    
    deadWhitePieces = {};
    deadBlackPieces = {};
    renderGraveyard();
    
    aiLoading.classList.add('hidden'); 
    turnStatus.textContent = thyoTurn.toUpperCase();
    turnStatus.style.color = '#f6d365';
    
    updateTimerDisplay();
    renderBoard();
}

// ==========================================
// LOGIKA TIMER STOPWATCH
// ==========================================
function updateTimerDisplay() {
    let m = Math.floor(matchTime / 60).toString().padStart(2, '0');
    let s = (matchTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        matchTime++;
        updateTimerDisplay();
    }, 1000);
}

function gameOver(message) {
    clearInterval(timerInterval);
    setTimeout(() => { alert(message); backToMenu(); }, 100);
}

// ==========================================
// GRAVEYARD (MAKAM)
// ==========================================
function addDeadPiece(piece) {
    let color = getPieceColor(piece);
    if (color === 'putih') {
        deadWhitePieces[piece] = (deadWhitePieces[piece] || 0) + 1;
    } else {
        deadBlackPieces[piece] = (deadBlackPieces[piece] || 0) + 1;
    }
    renderGraveyard();
}

function renderGraveyard() {
    deadWhiteBin.innerHTML = '';
    deadBlackBin.innerHTML = '';

    for (let p in deadWhitePieces) {
        let count = deadWhitePieces[p];
        deadWhiteBin.innerHTML += `<div class="dead-piece">${p} ${count > 1 ? `<span class="count">x${count}</span>` : ''}</div>`;
    }
    for (let p in deadBlackPieces) {
        let count = deadBlackPieces[p];
        deadBlackBin.innerHTML += `<div class="dead-piece">${p} ${count > 1 ? `<span class="count">x${count}</span>` : ''}</div>`;
    }
}

// ==========================================
// RENDER PAPAN & INTERAKSI
// ==========================================
function getPieceColor(piece) {
    if (!piece) return null;
    return ['♙', '♖', '♘', '♗', '♕', '♔'].includes(piece) ? 'putih' : 'hitam';
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            if (thyoBoard[r][c] !== '') square.innerHTML = `<div class="piece">${thyoBoard[r][c]}</div>`;
            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) square.classList.add('selected');
            if (thyoValidMoves.some(m => m.r === r && m.c === c)) square.classList.add('valid-move');
            square.onclick = () => handleSquareClick(r, c);
            boardElement.appendChild(square);
        }
    }
}

function handleSquareClick(r, c) {
    if (thyoMode === 'bot' && thyoTurn === 'hitam') return;

    const clickedPiece = thyoBoard[r][c];
    const clickedColor = getPieceColor(clickedPiece);

    if (!timerInterval) startTimer();

    // Pindah atau Makan
    if (thyoValidMoves.some(m => m.r === r && m.c === c)) {
        const targetPiece = thyoBoard[r][c];
        
        if (targetPiece) addDeadPiece(targetPiece);

        thyoBoard[r][c] = thyoBoard[selectedSquare.r][selectedSquare.c];
        thyoBoard[selectedSquare.r][selectedSquare.c] = '';
        
        thyoTurn = thyoTurn === 'putih' ? 'hitam' : 'putih';
        turnStatus.textContent = thyoTurn.toUpperCase();
        turnStatus.style.color = thyoTurn === 'putih' ? '#f6d365' : '#94a3b8';
        
        selectedSquare = null;
        thyoValidMoves = [];
        renderBoard();

        if (thyoMode === 'bot' && thyoTurn === 'hitam') {
            aiLoading.classList.remove('hidden'); 
            let thinkTime = Math.floor(Math.random() * 1500) + 1000;
            
            setTimeout(() => {
                makeBotMove();
                aiLoading.classList.add('hidden'); 
            }, thinkTime); 
        }
        return;
    }

    if (clickedColor === thyoTurn) {
        selectedSquare = { r, c };
        thyoValidMoves = getValidMovesForPiece(r, c, clickedPiece, thyoBoard);
        renderBoard();
        return;
    }

    selectedSquare = null;
    thyoValidMoves = [];
    renderBoard();
}

// ==========================================
// ALGORITMA PERGERAKAN BIDAK
// ==========================================
function getValidMovesForPiece(r, c, piece, currentBoard) {
    let moves = [];
    const color = getPieceColor(piece);
    const dir = color === 'putih' ? -1 : 1; 

    const addSliderMoves = (directions) => {
        for (let [dr, dc] of directions) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                if (!currentBoard[nr][nc]) moves.push({ r: nr, c: nc });
                else {
                    if (getPieceColor(currentBoard[nr][nc]) !== color) moves.push({ r: nr, c: nc });
                    break; 
                }
                nr += dr; nc += dc;
            }
        }
    };

    if (piece === '♙' || piece === '♟') {
        if (r + dir >= 0 && r + dir < 8 && !currentBoard[r + dir][c]) {
            moves.push({ r: r + dir, c });
            if ((color === 'putih' && r === 6) || (color === 'hitam' && r === 1)) {
                if (!currentBoard[r + dir * 2][c]) moves.push({ r: r + dir * 2, c });
            }
        }
        if (c - 1 >= 0 && currentBoard[r + dir][c - 1] && getPieceColor(currentBoard[r + dir][c - 1]) !== color) moves.push({ r: r + dir, c: c - 1 });
        if (c + 1 < 8 && currentBoard[r + dir][c + 1] && getPieceColor(currentBoard[r + dir][c + 1]) !== color) moves.push({ r: r + dir, c: c + 1 });
    }

    if (piece === '♖' || piece === '♜') addSliderMoves([[-1,0], [1,0], [0,-1], [0,1]]);
    if (piece === '♗' || piece === '♝') addSliderMoves([[-1,-1], [-1,1], [1,-1], [1,1]]);
    if (piece === '♕' || piece === '♛') addSliderMoves([[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]]);

    if (piece === '♘' || piece === '♞') {
        const knightMoves = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        for (let [dr, dc] of knightMoves) {
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && getPieceColor(currentBoard[nr][nc]) !== color) moves.push({ r: nr, c: nc });
        }
    }

    if (piece === '♔' || piece === '♚') {
        const kingMoves = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        for (let [dr, dc] of kingMoves) {
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && getPieceColor(currentBoard[nr][nc]) !== color) moves.push({ r: nr, c: nc });
        }
    }
    return moves;
}

function getAllPossibleMoves(color, currentBoard) {
    let allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let piece = currentBoard[r][c];
            if (getPieceColor(piece) === color) {
                let pMoves = getValidMovesForPiece(r, c, piece, currentBoard);
                for (let m of pMoves) {
                    allMoves.push({
                        fromR: r, fromC: c, toR: m.r, toC: m.c,
                        piece: piece, target: currentBoard[m.r][m.c]
                    });
                }
            }
        }
    }
    return allMoves;
}

// ==========================================
// OTAK BOT AI 
// ==========================================
function makeBotMove() {
    let allHitamMoves = getAllPossibleMoves('hitam', thyoBoard);

    if (allHitamMoves.length === 0) {
        gameOver("Permainan Selesai! Hitam tidak punya langkah.");
        return;
    }

    let bestMove = null;

    if (botLevel === 1) {
        bestMove = allHitamMoves[Math.floor(Math.random() * allHitamMoves.length)];
    } 
    else if (botLevel === 2) {
        const getPieceValue = (p) => {
            if (p === '♕' || p === '♛') return 90; 
            if (p === '♖' || p === '♜') return 50; 
            if (p === '♗' || p === '♝' || p === '♘' || p === '♞') return 30; 
            if (p === '♙' || p === '♟') return 10; 
            return 0; 
        };
        let maxScore = -1;
        allHitamMoves.sort(() => Math.random() - 0.5); 
        for (let move of allHitamMoves) {
            let score = getPieceValue(move.target);
            if (score > maxScore) { maxScore = score; bestMove = move; }
        }
    }
    else if (botLevel === 3) {
        let bestScore = -Infinity;
        allHitamMoves.sort(() => Math.random() - 0.5); 
        
        for (let move of allHitamMoves) {
            let tempTarget = thyoBoard[move.toR][move.toC];
            thyoBoard[move.toR][move.toC] = move.piece;
            thyoBoard[move.fromR][move.fromC] = '';

            let score = minimax(thyoBoard, 2, false, -Infinity, Infinity);

            thyoBoard[move.fromR][move.fromC] = move.piece;
            thyoBoard[move.toR][move.toC] = tempTarget;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    let r = bestMove.toR;
    let c = bestMove.toC;
    let targetPiece = thyoBoard[r][c];
    
    if (targetPiece) addDeadPiece(targetPiece); 

    thyoBoard[r][c] = thyoBoard[bestMove.fromR][bestMove.fromC];
    thyoBoard[bestMove.fromR][bestMove.fromC] = '';

    thyoTurn = 'putih';
    turnStatus.textContent = thyoTurn.toUpperCase();
    turnStatus.style.color = '#f6d365';
    
    selectedSquare = null;
    renderBoard();
}

function evaluateBoard(currentBoard) {
    let totalScore = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let piece = currentBoard[r][c];
            if (!piece) continue;
            let val = 0;
            if (piece === '♕' || piece === '♛') val = 90;
            else if (piece === '♖' || piece === '♜') val = 50;
            else if (piece === '♗' || piece === '♝' || piece === '♘' || piece === '♞') val = 30;
            else if (piece === '♙' || piece === '♟') val = 10;
            
            totalScore += getPieceColor(piece) === 'hitam' ? val : -val;
        }
    }
    return totalScore;
}

function minimax(simBoard, depth, isMaximizingPlayer, alpha, beta) {
    if (depth === 0) return evaluateBoard(simBoard);

    let possibleMoves = getAllPossibleMoves(isMaximizingPlayer ? 'hitam' : 'putih', simBoard);
    if (possibleMoves.length === 0) return isMaximizingPlayer ? -9999 : 9999; 

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of possibleMoves) {
            let tempTarget = simBoard[move.toR][move.toC];
            simBoard[move.toR][move.toC] = move.piece;
            simBoard[move.fromR][move.fromC] = '';

            let ev = minimax(simBoard, depth - 1, false, alpha, beta);

            simBoard[move.fromR][move.fromC] = move.piece;
            simBoard[move.toR][move.toC] = tempTarget;

            maxEval = Math.max(maxEval, ev);
            alpha = Math.max(alpha, ev);
            if (beta <= alpha) break; 
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of possibleMoves) {
            let tempTarget = simBoard[move.toR][move.toC];
            simBoard[move.toR][move.toC] = move.piece;
            simBoard[move.fromR][move.fromC] = '';

            let ev = minimax(simBoard, depth - 1, true, alpha, beta);

            simBoard[move.fromR][move.fromC] = move.piece;
            simBoard[move.toR][move.toC] = tempTarget;

            minEval = Math.min(minEval, ev);
            beta = Math.min(beta, ev);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

// ==========================================
// LOGIKA TOMBOL TOGGLE 2D / 3D
// ==========================================
toggleBtn.addEventListener('click', () => {
    is3DMode = !is3DMode;
    if (is3DMode) {
        boardElement.classList.add('is-3d');
        boardElement.classList.remove('is-2d');
        toggleBtn.textContent = 'Mode: 3D';
    } else {
        boardElement.classList.add('is-2d');
        boardElement.classList.remove('is-3d');
        toggleBtn.textContent = 'Mode: 2D';
    }
});

// Ekspos fungsi ke global
window.startGame = startGame;
window.backToMenu = backToMenu;
window.showBotMenu = showBotMenu;
window.hideBotMenu = hideBotMenu;
window.startBotGame = startBotGame;
