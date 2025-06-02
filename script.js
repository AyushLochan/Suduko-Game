class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.difficulty = 'easy';
        this.startTime = null;
        this.timerInterval = null;
        this.isComplete = false;

        this.initializeGrid();
        this.setupEventListeners();
        this.newGame();
    }

    initializeGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.className = 'cell';
            cell.maxLength = 1;
            cell.id = `cell-${i}`;

            cell.addEventListener('input', (e) => this.handleCellInput(e, i));
            cell.addEventListener('keydown', (e) => this.handleKeyDown(e, i));

            gridElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.difficulty button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
            });
        });
    }

    handleCellInput(e, index) {
        const value = e.target.value;
        if (value && (isNaN(value) || value < 1 || value > 9)) {
            e.target.value = '';
            return;
        }

        const row = Math.floor(index / 9);
        const col = index % 9;
        this.grid[row][col] = value ? parseInt(value) : 0;

        this.clearErrors();
        this.checkCompletion();
    }

    handleKeyDown(e, index) {
        const row = Math.floor(index / 9);
        const col = index % 9;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (row > 0) document.getElementById(`cell-${index - 9}`).focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (row < 8) document.getElementById(`cell-${index + 9}`).focus();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (col > 0) document.getElementById(`cell-${index - 1}`).focus();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (col < 8) document.getElementById(`cell-${index + 1}`).focus();
                break;
            case 'Backspace':
            case 'Delete':
                this.grid[row][col] = 0;
                break;
        }
    }

    newGame() {
        this.isComplete = false;
        this.generatePuzzle();
        this.renderGrid();
        this.startTimer();
        this.updateStatus('');
    }

    generatePuzzle() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));

        this.fillGrid(this.solution);

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }

        const cellsToRemove = {
            easy: 40,
            medium: 50,
            hard: 60
        }[this.difficulty];

        this.removeNumbers(cellsToRemove);
    }

    fillGrid(grid) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    this.shuffleArray(numbers);

                    for (let num of numbers) {
                        if (this.isValidMove(grid, row, col, num)) {
                            grid[row][col] = num;

                            if (this.fillGrid(grid)) {
                                return true;
                            }

                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    removeNumbers(count) {
        const positions = [];
        for (let i = 0; i < 81; i++) {
            positions.push(i);
        }
        this.shuffleArray(positions);

        for (let i = 0; i < count; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            this.grid[row][col] = 0;
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    isValidMove(grid, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    renderGrid() {
        for (let i = 0; i < 81; i++) {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const cell = document.getElementById(`cell-${i}`);
            const value = this.grid[row][col];

            cell.value = value || '';
            cell.className = 'cell';

            if (value) {
                cell.classList.add('given');
                cell.readOnly = true;
            } else {
                cell.readOnly = false;
            }
        }
    }

    validatePuzzle() {
        if (this.isComplete) return;

        this.clearErrors();
        let hasErrors = false;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                if (value && !this.isValidMove(this.grid, row, col, value)) {
                    const index = row * 9 + col;
                    document.getElementById(`cell-${index}`).classList.add('error');
                    hasErrors = true;
                }
            }
        }

        if (hasErrors) {
            this.updateStatus('❌ There are errors in your solution!', 'error');
        } else {
            this.updateStatus('✅ Looking good so far!', 'success');
        }
    }

    solvePuzzle() {
        if (this.isComplete) return;

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }

        for (let i = 0; i < 81; i++) {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const cell = document.getElementById(`cell-${i}`);
            cell.value = this.grid[row][col];
            cell.classList.add('solved');
        }

        this.isComplete = true;
        this.stopTimer();
        this.updateStatus('🎉 Puzzle solved! Try a new one!', 'success');
    }

    checkCompletion() {
        let isFull = true;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    isFull = false;
                    break;
                }
            }
            if (!isFull) break;
        }

        if (isFull) {
            let isCorrect = true;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.grid[row][col] !== this.solution[row][col]) {
                        isCorrect = false;
                        break;
                    }
                }
                if (!isCorrect) break;
            }

            if (isCorrect) {
                this.isComplete = true;
                this.stopTimer();
                this.updateStatus('🎉 Congratulations! You completed the puzzle!', 'success');

                document.querySelectorAll('.cell:not(.given)').forEach(cell => {
                    cell.classList.add('solved');
                });
            }
        }
    }

    clearErrors() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('error');
        });
    }

    startTimer() {
        this.startTime = Date.now();
        this.stopTimer();

        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            document.getElementById('timer').textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStatus(message, type = '') {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }
}

let game;

function newGame() {
    game.newGame();
}

function validatePuzzle() {
    game.validatePuzzle();
}

function solvePuzzle() {
    game.solvePuzzle();
}

document.addEventListener('DOMContentLoaded', () => {
    game = new SudokuGame();
});
