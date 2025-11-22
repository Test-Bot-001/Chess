// Game State
let game = new Chess();
let boardEl = document.getElementById('board');
let statusEl = document.getElementById('status');
let selectedSquare = null;
let draggedPiece = null;
let sourceSquare = null;
let playerColor = 'w'; // Player is White

// Asset Map (Using Wikimedia Commons SVG pieces)
const pieceTheme = {
    'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
};

// Initialization
function initGame() {
    try {
        if (typeof Chess === 'undefined') {
            console.error("Chess library not loaded!");
            alert("Error: Chess library not loaded. Please check internet connection or file integrity.");
            return;
        }
        renderBoard();
        updateStatus();
    } catch (e) {
        console.error("Game initialization error:", e);
        alert("Game failed to start: " + e.message);
    }
}

// Render the board
function renderBoard() {
    boardEl.innerHTML = '';
    const board = game.board(); // 8x8 array

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            const isLight = (i + j) % 2 === 0;
            const squareName = String.fromCharCode(97 + j) + (8 - i); // e.g., 'a8'

            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.square = squareName;

            // Piece rendering
            const piece = board[i][j];
            if (piece) {
                const pieceImg = document.createElement('div');
                pieceImg.className = 'piece';
                pieceImg.style.backgroundImage = `url(${pieceTheme[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]})`;
                pieceImg.draggable = true;

                // Drag Events
                pieceImg.addEventListener('dragstart', (e) => onDragStart(e, squareName));
                pieceImg.addEventListener('dragend', onDragEnd);

                square.appendChild(pieceImg);
            }

            // Square Events (Click & Drop)
            square.addEventListener('click', () => onSquareClick(squareName));
            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', (e) => onDrop(e, squareName));

            boardEl.appendChild(square);
        }
    }
}

// Drag & Drop Handlers
function onDragStart(e, square) {
    // Only allow moving own pieces
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
        e.preventDefault();
        return;
    }

    draggedPiece = piece;
    sourceSquare = square;
    e.target.classList.add('dragging');

    // Highlight moves for this piece
    selectedSquare = square;
    highlightSquares();
}

function onDragOver(e) {
    e.preventDefault(); // Allow drop
}

function onDrop(e, targetSquare) {
    e.preventDefault();
    const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
    });

    if (move) {
        onMoveMade();
    } else {
        // Invalid move
        highlightSquares(); // Re-render highlights or clear them
    }
}

function onDragEnd(e) {
    e.target.classList.remove('dragging');
    // If move wasn't made (dropped outside or invalid), we might want to clear highlights
    // But renderBoard usually handles cleanup if move was made
}

// Handle Square Click (Fallback/Alternative)
function onSquareClick(square) {
    // If a square is already selected, try to move
    if (selectedSquare) {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q' // Always promote to queen for simplicity for now
        });

        if (move === null) {
            // If clicked on another own piece, select that instead
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                selectedSquare = square;
                highlightSquares();
                return;
            }
            // Deselect
            selectedSquare = null;
            highlightSquares();
            return;
        }

        onMoveMade();
    } else {
        // Select a piece
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            selectedSquare = square;
            highlightSquares();
        }
    }
}

function playMoveSound(isCheck) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (isCheck) {
            // Check sound: Higher pitch, bell-like "ding"
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.4);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } else {
            // Move sound: Soothing, lower pitch "thud" or "wood" sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch (e) {
        console.error("Audio play failed:", e);
    }
}

function onMoveMade() {
    selectedSquare = null;
    sourceSquare = null;
    draggedPiece = null;
    renderBoard();
    updateStatus();
    playMoveSound(game.in_check());

    // Computer's turn
    if (!game.game_over()) {
        window.setTimeout(makeBestMove, 250);
    }
}

// Highlight selected square and valid moves
function highlightSquares() {
    // Clear previous highlights
    document.querySelectorAll('.square').forEach(el => {
        el.classList.remove('selected', 'hint');
    });

    if (selectedSquare) {
        // Highlight selected
        const selectedEl = document.querySelector(`[data-square="${selectedSquare}"]`);
        if (selectedEl) selectedEl.classList.add('selected');

        // Highlight moves
        const moves = game.moves({ square: selectedSquare, verbose: true });
        moves.forEach(move => {
            const moveEl = document.querySelector(`[data-square="${move.to}"]`);
            if (moveEl) moveEl.classList.add('hint');
        });
    }
}

// AI Logic
const pieceValues = {
    'p': 100,
    'n': 320,
    'b': 330,
    'r': 500,
    'q': 900,
    'k': 20000
};

const pst = {
    'p': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'n': [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ],
    'b': [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20]
    ],
    'r': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [0, 0, 0, 5, 5, 0, 0, 0]
    ],
    'q': [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20]
    ],
    'k': [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20]
    ]
};

function evaluateBoard(game) {
    let totalEvaluation = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece, x, y) {
    if (piece === null) {
        return 0;
    }

    let absoluteValue = pieceValues[piece.type];

    // Add positional value
    if (piece.color === 'w') {
        absoluteValue += pst[piece.type][x][y];
    } else {
        // Mirror for black
        absoluteValue += pst[piece.type][7 - x][y];
    }

    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}

function minimax(depth, game, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizingPlayer) {
        let bestEval = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            bestEval = Math.max(bestEval, minimax(depth - 1, game, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestEval);
            if (beta <= alpha) {
                return bestEval;
            }
        }
        return bestEval;
    } else {
        let bestEval = Infinity;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            bestEval = Math.min(bestEval, minimax(depth - 1, game, alpha, beta, !isMaximizingPlayer));
            game.undo();
            beta = Math.min(beta, bestEval);
            if (beta <= alpha) {
                return bestEval;
            }
        }
        return bestEval;
    }
}

function makeBestMove() {
    const moves = game.moves();
    if (moves.length === 0) return;

    let bestMove = null;
    let bestValue = -Infinity;

    // AI plays as Black, so it wants to minimize the evaluation (since Black pieces are negative)
    // However, for the minimax implementation above:
    // evaluateBoard returns positive for White advantage, negative for Black advantage.
    // We want to find the move that results in the LOWEST score (most negative) for the board state from White's perspective.
    // BUT, standard minimax usually maximizes for the current player.
    // Let's simplify: AI is Black. We want to MINIMIZE the board value (White - Black).

    // Actually, let's stick to a standard convention:
    // We are Black. We want to pick the move that results in the best outcome for Black.
    // In our eval, Black is negative. So we want the most negative score.

    let bestEval = Infinity; // We want to minimize
    let alpha = -Infinity;
    let beta = Infinity;

    for (let i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        // After we move, it's White's turn (Maximizing player)
        let boardValue = minimax(2, game, alpha, beta, true);
        game.undo();

        if (boardValue < bestEval) {
            bestEval = boardValue;
            bestMove = moves[i];
        }
        beta = Math.min(beta, bestEval);
    }

    if (bestMove) {
        game.move(bestMove);
        renderBoard();
        updateStatus();
        playMoveSound(game.in_check()); // Play sound for AI move too
    } else {
        // Fallback to random if something goes wrong
        makeRandomMove();
    }
}

// Basic Random AI (Fallback)
function makeRandomMove() {
    const moves = game.moves();
    if (moves.length === 0) return;

    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    game.move(randomMove);
    renderBoard();
    updateStatus();
    playMoveSound(game.in_check());
}

// Update Game Status
function updateStatus() {
    let status = '';
    let moveColor = game.turn() === 'w' ? 'White' : 'Black';

    if (game.in_checkmate()) {
        status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = `${moveColor} to move`;
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check';
        }
    }

    statusEl.innerText = status;
    updateMoveHistory();
    updateCapturedPieces();
}

// Update Move History
function updateMoveHistory() {
    const history = game.history({ verbose: true });
    const moveListEl = document.getElementById('move-history');
    moveListEl.innerHTML = '';

    for (let i = 0; i < history.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1];

        const row = document.createElement('div');
        row.className = 'move-row';

        const numSpan = document.createElement('span');
        numSpan.className = 'move-number';
        numSpan.innerText = `${moveNumber}.`;

        const whiteSpan = document.createElement('span');
        whiteSpan.className = 'move-white';
        whiteSpan.innerText = whiteMove.san;

        const blackSpan = document.createElement('span');
        blackSpan.className = 'move-black';
        blackSpan.innerText = blackMove ? blackMove.san : '';

        row.appendChild(numSpan);
        row.appendChild(whiteSpan);
        row.appendChild(blackSpan);

        moveListEl.appendChild(row);
    }

    // Auto-scroll to bottom
    moveListEl.scrollTop = moveListEl.scrollHeight;
}

// Update Captured Pieces
function updateCapturedPieces() {
    const board = game.board();
    const currentPieces = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                currentPieces[piece.color][piece.type]++;
            }
        }
    }

    const initialPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const capturedByBlack = []; // White pieces captured by Black
    const capturedByWhite = []; // Black pieces captured by White

    // Calculate missing pieces (captured)
    // White pieces captured by Black
    for (const type in initialPieces) {
        const count = initialPieces[type] - currentPieces['w'][type];
        for (let k = 0; k < count; k++) {
            capturedByBlack.push({ type: type, color: 'w' });
        }
    }

    // Black pieces captured by White
    for (const type in initialPieces) {
        const count = initialPieces[type] - currentPieces['b'][type];
        for (let k = 0; k < count; k++) {
            capturedByWhite.push({ type: type, color: 'b' });
        }
    }

    // Top container: Black's side. Show what Black has captured (White pieces)
    renderCaptured(document.getElementById('captured-top'), capturedByBlack);

    // Bottom container: White's side. Show what White has captured (Black pieces)
    renderCaptured(document.getElementById('captured-bottom'), capturedByWhite);
}

function renderCaptured(container, pieces) {
    container.innerHTML = '';
    pieces.forEach(piece => {
        const el = document.createElement('div');
        el.className = 'captured-piece';
        el.style.backgroundImage = `url(${pieceTheme[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]})`;
        container.appendChild(el);
    });
}

// Start
initGame();
