let canvas = document.getElementById("tetris");
let context = canvas.getContext("2d");

let canvasNext = document.getElementById("nextTet");
let contextNext = canvasNext.getContext("2d");

let dropStart = Date.now();
let gameOver = false;
let score = 0;

let scoreElement = document.getElementById("score");
let highScoreElement = document.getElementById("highestScore");


const ROW = 20;
const COL = 13;
const SQ = squareSize = 40;
const VACANT = "black";  // empty square

// Draw one square
function drawSquare(x, y, color) {
	context.fillStyle = color;
	context.fillRect(x * SQ, y * SQ, SQ, SQ);
	context.strokeStyle = "black";
	context.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

function drawSquareNext(x, y, color) {
	contextNext.fillStyle = color;
	contextNext.fillRect(x * SQ, y * SQ, SQ, SQ);
	contextNext.strokeStyle = "black";
	contextNext.strokeRect(x * SQ, y * SQ, SQ, SQ);
}


let boardNext = [];
for (let r = 0; r < 3; r++) {
	boardNext[r] = [];
	for (let c = 0; c < 4; c++) {
		boardNext[r][c] = VACANT;
	}
}

// Draw board
function drawBoardNext() {
	for (let r = 0; r < 3; r++) {
		for (let c = 0; c < 4; c++) {
			drawSquareNext(c, r, boardNext[r][c])
		}
	}
}

// drawBoardNext();


// Create board
let board = [];
for (let r = 0; r < ROW; r++) {
	board[r] = [];
	for (let c = 0; c < COL; c++) {
		board[r][c] = VACANT;
	}
}

// Draw board
function drawBoard() {
	context.strokeStyle = "red";
	context.strokeRect(0, 0, 520, 800);

	for (let r = 0; r < ROW; r++) {
		for (let c = 0; c < COL; c++) {
			drawSquare(c, r, board[r][c])
		}
	}
}

const PIECES = [[Z, "mediumseagreen"], [S, "yellow"], [J, "red"], [T, "purple"], [L, "cyan"], [I, "orange"], [O, "deepskyblue"]];

function randomPiece() {
	let randomPiece = Math.floor(Math.random() * PIECES.length);
	return new Piece(PIECES[randomPiece][0], PIECES[randomPiece][1]);
}

// Initiate piece
let p = randomPiece();
let pNext = randomPiece();

// Piece
function Piece(tetrimino, color) {
	this.tetrimino = tetrimino;
	this.color = color;

	this.tetrimNumber = 0;
	this.activeTetrim = this.tetrimino[this.tetrimNumber];

	this.x = 5;
	this.y = -2;
}

Piece.prototype.fill = function (color) {
	for (let r = 0; r < this.activeTetrim.length; r++) {
		for (let c = 0; c < this.activeTetrim.length; c++) {
			if (this.activeTetrim[r][c]) {
				drawSquare(this.x + c, this.y + r, color);
			}
		}
	}
};

Piece.prototype.fillNext = function (color) {
	for (let r = 0; r < 3; r++) {
		for (let c = 0; c < 4; c++) {
			if (this.activeTetrim[r][c]) {
				drawSquareNext(c, r, color);
			}
		}
	}
};

Piece.prototype.drawNext = function () {
	this.fillNext(this.color);
};

Piece.prototype.unDrawNext = function () {
	for (let r = 0; r < 3; r++) {
		for (let c = 0; c < 4; c++) {
			drawSquareNext(c, r, "black");
		}
	}
};

Piece.prototype.draw = function () {
	this.fill(this.color);
};

Piece.prototype.unDraw = function () {
	this.fill(VACANT);
};

Piece.prototype.moveToEnd = function () {
	while (!this.collision(0, 1, this.activeTetrim)) {
		this.unDraw();
		this.y++;
		this.draw();
	}
	this.lock();
	p = pNext;
	pNext = randomPiece();

};

Piece.prototype.moveDown = function () {
	if (!this.collision(0, 1, this.activeTetrim)) {
		this.unDraw();
		this.y++;
		this.draw();
	} else {
		this.lock();
		p = pNext;
		pNext = randomPiece();
	}
};

Piece.prototype.moveRight = function () {
	if (!this.collision(1, 0, this.activeTetrim)) {
		this.unDraw();
		this.x++;
		this.draw();
	}

};

Piece.prototype.moveLeft = function () {
	if (!this.collision(-1, 0, this.activeTetrim)) {
		this.unDraw();
		this.x--;
		this.draw();
	}

};

Piece.prototype.rotate = function () {
	let nextTetrim = this.tetrimino[(this.tetrimNumber + 1) % this.tetrimino.length];
	let kick = 0;
	if (this.collision(0, 0, nextTetrim)) {
		if (this.x > COL / 2) kick = -1;
		else kick = 1
	}

	if (!this.collision(kick, 0, nextTetrim)) {

		this.unDraw();
		this.x += kick;
		this.tetrimNumber = (this.tetrimNumber + 1) % this.tetrimino.length;
		this.activeTetrim = this.tetrimino[this.tetrimNumber];
		this.draw();
	}
};

Piece.prototype.collision = function (x, y, piece) {
	for (let r = 0; r < piece.length; r++) {
		for (let c = 0; c < piece.length; c++) {
			// skip if empty sqr
			if (!piece[r][c]) continue;
			// coordinates of piece after move
			let newX = this.x + c + x;
			let newY = this.y + r + y;
			if (newX < 0 || newX >= COL || newY >= ROW) return true;
			// skip this(can be start point)
			if (newY < 0) continue;
			// check existing piece
			if (board[newY][newX] !== VACANT) {
				return true
			}
		}
	}
	return false;
};

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
	let key = event.keyCode;
	if (key === 37) {
		p.moveLeft();
		// dropStart = Date.now();
	} else if (key === 38) {
		p.rotate();
		// dropStart = Date.now();
	} else if (key === 39) {
		p.moveRight();
		// dropStart = Date.now();
	} else if (key === 40) {
		p.moveDown();
	} else if (key === 32) {
		p.moveToEnd();
	}
}


function drop() {
	let now = Date.now();
	let delta = now - dropStart;
	if (delta > 700) {
		pNext.unDrawNext();
		p.moveDown();
		pNext.drawNext();
		dropStart = Date.now();
	}
	if (!gameOver) requestAnimationFrame(drop);
}

Piece.prototype.lock = function () {
	for (let r = 0; r < this.activeTetrim.length; r++) {
		for (let c = 0; c < this.activeTetrim.length; c++) {
			if (!this.activeTetrim[r][c]) continue;
			if (this.y + r < 0) {
				alert("Game Over");
				gameOver = true;

				return;
			}
			board[this.y + r][this.x + c] = this.color;
		}
	}
	// remove row
	for (r = 0; r < ROW; r++) {
		let isRowFull = true;
		for (let c = 0; c < COL; c++) {
			isRowFull = isRowFull && (board[r][c] !== VACANT);
		}
		if (isRowFull) {
			for (let y = r; y > 1; y--) {
				for (let c = 0; c < COL; c++) {
					board[y][c] = board[y - 1][c]
				}
			}
			// add top row

			for (let c = 0; c < COL; c++) {
				board[0][c] = VACANT;
			}
			score += 13;
		}
	}
	drawBoard();
	console.log(scoreElement.innerHTML, "scoreElement.innerHTML");
	scoreElement.innerHTML = score;
	if (highScoreElement.innerHTML < score) {
		highScoreElement.innerText = score;
	}
};

function main() {
	gameOver = false;
	score = 0;
	scoreElement.innerHTML = score;

	boardNext = [];
	for (let r = 0; r < 3; r++) {
		boardNext[r] = [];
		for (let c = 0; c < 4; c++) {
			boardNext[r][c] = VACANT;
		}
	}
	board = [];
	for (let r = 0; r < ROW; r++) {
		board[r] = [];
		for (let c = 0; c < COL; c++) {
			board[r][c] = VACANT;
		}
	}
	drawBoardNext();
	drawBoard();

	p = randomPiece();
	pNext = randomPiece();

	drop();
}

drawBoardNext();
drawBoard();
drop();
