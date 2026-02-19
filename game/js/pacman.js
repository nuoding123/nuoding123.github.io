// Game Constants
const GRID_SIZE = 20;
const ROWS = 14;
const COLS = 14;
const DOT_SIZE = 2;
const PELLET_POINTS = 10;
const ROSE_POINTS = 50;
const GHOST_EATEN_POINTS = 200;
const POWER_UP_DURATION = 8000; // 8 seconds
const GHOST_COUNT = 4;
const ROSE_SPAWN_INTERVAL = 10000; // 10 seconds

// Game States
const GAME_STATE = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LEVEL_COMPLETE: 'levelComplete'
};

// Direction vectors
const DIRECTIONS = {
    UP: { x: 0, y: -1, char: '↑' },
    DOWN: { x: 0, y: 1, char: '↓' },
    LEFT: { x: -1, y: 0, char: '←' },
    RIGHT: { x: 1, y: 0, char: '→' },
    NONE: { x: 0, y: 0, char: '○' }
};

class Maze {
    constructor() {
        this.grid = this.generateMaze();
    }

    generateMaze() {
        // Create a maze with walls and open paths
        const maze = Array(ROWS).fill(null).map(() => Array(COLS).fill(1));
        
        // Create paths
        for (let row = 1; row < ROWS - 1; row += 2) {
            for (let col = 1; col < COLS - 1; col += 2) {
                maze[row][col] = 0; // Path
            }
        }

        // Connect paths with horizontal corridors
        for (let row = 1; row < ROWS - 1; row += 2) {
            for (let col = 2; col < COLS - 1; col += 2) {
                maze[row][col] = 0;
            }
        }

        // Connect paths with vertical corridors
        for (let row = 2; row < ROWS - 1; row += 2) {
            for (let col = 1; col < COLS - 1; col += 2) {
                maze[row][col] = 0;
            }
        }

        // Create some additional open areas
        for (let row = 2; row < ROWS - 1; row += 2) {
            for (let col = 2; col < COLS - 1; col += 2) {
                maze[row][col] = 0;
            }
        }

        // Add tunnels on sides
        maze[ROWS - 2][0] = 0;
        maze[ROWS - 2][COLS - 1] = 0;

        return maze;
    }

    isWall(x, y) {
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
        return this.grid[y][x] === 1;
    }

    isValid(x, y) {
        return x >= 0 && x < COLS && y >= 0 && y < ROWS && !this.isWall(x, y);
    }
}

class PacMan {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        this.speed = 1;
        this.isPoweredUp = false;
        this.powerUpTimeRemaining = 0;
    }

    update(maze) {
        // Try to move in the next direction
        if (maze.isValid(this.x + this.nextDirection.x, this.y + this.nextDirection.y)) {
            this.direction = this.nextDirection;
        }

        // Move in current direction
        if (maze.isValid(this.x + this.direction.x, this.y + this.direction.y)) {
            this.x += this.direction.x;
            this.y += this.direction.y;
        }

        // Handle wrap-around for tunnels
        if (this.x < 0) this.x = COLS - 1;
        if (this.x >= COLS) this.x = 0;

        // Update power-up timer
        if (this.isPoweredUp) {
            this.powerUpTimeRemaining -= 16; // Roughly 60fps
            if (this.powerUpTimeRemaining <= 0) {
                this.isPoweredUp = false;
                this.powerUpTimeRemaining = 0;
            }
        }
    }

    activatePowerUp() {
        this.isPoweredUp = true;
        this.powerUpTimeRemaining = POWER_UP_DURATION;
    }

    setNextDirection(dir) {
        this.nextDirection = dir;
    }
}

class Ghost {
    constructor(x, y, color, speed = 1) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.direction = DIRECTIONS.RIGHT;
        this.moveCounter = 0;
        this.isAlive = true;
    }

    update(maze, pacMan) {
        if (!this.isAlive) return;

        this.moveCounter++;
        if (this.moveCounter < this.speed) return;
        this.moveCounter = 0;

        // Simple AI: chase Pac-Man with some randomness
        const dx = pacMan.x - this.x;
        const dy = pacMan.y - this.y;
        const distance = Math.abs(dx) + Math.abs(dy);

        // If close to Pac-Man, chase directly
        if (distance < 8) {
            // Chase logic
            let nextX = this.x;
            let nextY = this.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                nextX += dx > 0 ? 1 : -1;
            } else {
                nextY += dy > 0 ? 1 : -1;
            }

            if (maze.isValid(nextX, nextY)) {
                this.x = nextX;
                this.y = nextY;
            }
        } else {
            // Random movement
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];

            for (let attempt = 0; attempt < 4; attempt++) {
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const nextX = this.x + dir.x;
                const nextY = this.y + dir.y;

                if (maze.isValid(nextX, nextY)) {
                    this.x = nextX;
                    this.y = nextY;
                    break;
                }
            }
        }

        // Handle wrap-around
        if (this.x < 0) this.x = COLS - 1;
        if (this.x >= COLS) this.x = 0;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.isAlive = true;
    }
}

class Heart {
    constructor(x, y, dirX, dirY) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = 2;
    }

    update() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
    }

    isOutOfBounds() {
        return this.x < 0 || this.x >= COLS || this.y < 0 || this.y >= ROWS;
    }
}

class PacManGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.maze = new Maze();
        this.score = 0;
        this.lives = 3;
        this.state = GAME_STATE.IDLE;
        this.dots = new Set();  // 基础豆子 (pellets)
        this.hearts = [];       // 心形投射物
        this.roseSpawnTime = 0;
        this.rose = null;       // 玫瑰能量豆
        this.heartShootCounter = 0;
        this.totalInitialDots = 0;  // 记录初始豆子数量

        // Initialize game
        this.initializeDots();
        this.pacMan = new PacMan(7, 7);
        this.ghosts = [
            new Ghost(5, 5, '#ff69b4', 1),
            new Ghost(8, 5, '#ff1493', 1),
            new Ghost(5, 9, '#ff69b4', 1),
            new Ghost(8, 9, '#ff1493', 1)
        ];

        // Event listeners
        this.setupEventListeners();
    }

    initializeDots() {
        // 在所有路径上放置豆子（pellets），Pac-Man 需要吃掉它们
        this.dots.clear();
        for (let row = 1; row < ROWS - 1; row++) {
            for (let col = 1; col < COLS - 1; col++) {
                if (!this.maze.isWall(col, row)) {
                    if (Math.random() > 0.15) { // 85% 的路径上放置豆子
                        this.dots.add(`${col},${row}`);
                    }
                }
            }
        }
        this.totalInitialDots = this.dots.size;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        const arrowUp = ['arrowup', 'w'].includes(key);
        const arrowDown = ['arrowdown', 's'].includes(key);
        const arrowLeft = ['arrowleft', 'a'].includes(key);
        const arrowRight = ['arrowright', 'd'].includes(key);

        if (arrowUp) {
            e.preventDefault();
            this.pacMan.setNextDirection(DIRECTIONS.UP);
        } else if (arrowDown) {
            e.preventDefault();
            this.pacMan.setNextDirection(DIRECTIONS.DOWN);
        } else if (arrowLeft) {
            e.preventDefault();
            this.pacMan.setNextDirection(DIRECTIONS.LEFT);
        } else if (arrowRight) {
            e.preventDefault();
            this.pacMan.setNextDirection(DIRECTIONS.RIGHT);
        }
    }

    start() {
        if (this.state === GAME_STATE.IDLE || this.state === GAME_STATE.GAME_OVER || 
            this.state === GAME_STATE.LEVEL_COMPLETE) {
            this.state = GAME_STATE.PLAYING;
            this.updateUI();
            this.gameLoop();
        }
    }

    togglePause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.updateUI();
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.updateUI();
            this.gameLoop();
        }
    }

    reset() {
        this.state = GAME_STATE.IDLE;
        this.score = 0;
        this.lives = 3;
        this.initializeDots();
        this.totalInitialDots = this.dots.size;  // 记录初始豆子数
        this.pacMan = new PacMan(7, 7);
        this.ghosts.forEach((g, i) => {
            const startPositions = [[5, 5], [8, 5], [5, 9], [8, 9]];
            g.reset(startPositions[i][0], startPositions[i][1]);
        });
        this.hearts = [];
        this.rose = null;
        this.heartShootCounter = 0;
        this.updateUI();
        this.draw();
    }

    update() {
        if (this.state !== GAME_STATE.PLAYING) return;

        // Update Pac-Man
        this.pacMan.update(this.maze);

        // Update hearts
        this.hearts = this.hearts.filter(h => !h.isOutOfBounds());
        this.hearts.forEach(h => h.update());

        // Shoot hearts when powered up
        if (this.pacMan.isPoweredUp) {
            this.heartShootCounter++;
            if (this.heartShootCounter % 5 === 0) { // Shoot every 5 frames
                const heart = new Heart(
                    this.pacMan.x,
                    this.pacMan.y,
                    this.pacMan.direction.x,
                    this.pacMan.direction.y
                );
                this.hearts.push(heart);
            }
        }

        // Update ghosts
        this.ghosts.forEach(ghost => ghost.update(this.maze, this.pacMan));

        // Update rose spawn
        this.roseSpawnTime++;
        if (this.roseSpawnTime > ROSE_SPAWN_INTERVAL / 16) {
            if (!this.rose && Math.random() < 0.3) {
                this.spawnRose();
            }
            this.roseSpawnTime = 0;
        }

        // Check collisions
        this.checkCollisions();

        // Check win condition: all pellets eaten
        if (this.dots.size === 0) {
            this.state = GAME_STATE.LEVEL_COMPLETE;
            this.updateUI();
            return;
        }

        // Check game over condition
        if (this.lives <= 0) {
            this.state = GAME_STATE.GAME_OVER;
            this.updateUI();
        }

        this.updateUI();
    }

    checkCollisions() {
        // 豆子碰撞：Pac-Man 吃豆子得分
        const dotKey = `${this.pacMan.x},${this.pacMan.y}`;
        if (this.dots.has(dotKey)) {
            this.dots.delete(dotKey);
            this.score += PELLET_POINTS;
        }

        // 玫瑰碰撞：Pac-Man 吃玫瑰激活能力，可以射心消灭幽灵
        if (this.rose && this.pacMan.x === this.rose.x && this.pacMan.y === this.rose.y) {
            this.pacMan.activatePowerUp();
            this.score += ROSE_POINTS;
            this.rose = null;
        }

        // 心形投射物碰撞：心形消灭幽灵
        this.hearts.forEach((heart, hIdx) => {
            this.ghosts.forEach((ghost, gIdx) => {
                if (ghost.isAlive && heart.x === ghost.x && heart.y === ghost.y) {
                    ghost.isAlive = false;
                    this.score += GHOST_EATEN_POINTS;
                    this.hearts.splice(hIdx, 1);
                }
            });
        });

        // 幽灵碰撞：幽灵接触 Pac-Man，Pac-Man 失去生命
        this.ghosts.forEach(ghost => {
            if (ghost.isAlive && this.pacMan.x === ghost.x && this.pacMan.y === ghost.y) {
                this.lives--;
                if (this.lives > 0) {
                    // 重置位置重试
                    this.pacMan = new PacMan(7, 7);
                    this.ghosts.forEach((g, i) => {
                        const startPositions = [[5, 5], [8, 5], [5, 9], [8, 9]];
                        g.reset(startPositions[i][0], startPositions[i][1]);
                    });
                    this.hearts = [];
                }
                // 当生命 = 0 时，游戏结束
            }
        });
    }

    spawnRose() {
        let validPosition = false;
        let x, y;
        while (!validPosition) {
            x = Math.floor(Math.random() * COLS);
            y = Math.floor(Math.random() * ROWS);
            if (!this.maze.isWall(x, y) && 
                !(x === this.pacMan.x && y === this.pacMan.y)) {
                validPosition = true;
            }
        }
        this.rose = { x, y };
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        this.ctx.fillStyle = '#4a5568';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.maze.isWall(col, row)) {
                    this.ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
        }

        // Draw dots
        this.ctx.fillStyle = '#ffb6c1';
        this.dots.forEach(dotKey => {
            const [col, row] = dotKey.split(',').map(Number);
            this.ctx.fillRect(
                col * GRID_SIZE + GRID_SIZE / 2 - DOT_SIZE,
                row * GRID_SIZE + GRID_SIZE / 2 - DOT_SIZE,
                DOT_SIZE * 2,
                DOT_SIZE * 2
            );
        });

        // Draw rose
        if (this.rose) {
            this.ctx.font = `${GRID_SIZE * 0.8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🌹', this.rose.x * GRID_SIZE + GRID_SIZE / 2, this.rose.y * GRID_SIZE + GRID_SIZE / 2);
        }

        // Draw hearts
        this.ctx.font = `${GRID_SIZE * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.hearts.forEach(heart => {
            this.ctx.fillText('💕', heart.x * GRID_SIZE + GRID_SIZE / 2, heart.y * GRID_SIZE + GRID_SIZE / 2);
        });

        // Draw Pac-Man
        this.ctx.font = `${GRID_SIZE * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const pacManEmoji = this.pacMan.isPoweredUp ? '🤩' : '🟡';
        this.ctx.fillText(pacManEmoji, this.pacMan.x * GRID_SIZE + GRID_SIZE / 2, this.pacMan.y * GRID_SIZE + GRID_SIZE / 2);

        // Draw ghosts
        const ghostEmojis = ['👻', '👽', '🎃', '💀'];
        this.ghosts.forEach((ghost, i) => {
            if (ghost.isAlive) {
                this.ctx.fillText(ghostEmojis[i % 4], ghost.x * GRID_SIZE + GRID_SIZE / 2, ghost.y * GRID_SIZE + GRID_SIZE / 2);
            }
        });
    }

    gameLoop = () => {
        this.update();
        this.draw();

        if (this.state === GAME_STATE.PLAYING) {
            requestAnimationFrame(this.gameLoop);
        }
    };

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;

        const powerUpTime = Math.max(0, Math.ceil(this.pacMan.powerUpTimeRemaining / 1000));
        document.getElementById('powerUpTimer').textContent = 
            this.pacMan.isPoweredUp ? `${powerUpTime}s` : '--';

        let status = 'Ready';
        if (this.state === GAME_STATE.PLAYING) status = 'Playing';
        else if (this.state === GAME_STATE.PAUSED) status = 'Paused';
        else if (this.state === GAME_STATE.GAME_OVER) status = 'Game Over!';
        else if (this.state === GAME_STATE.LEVEL_COMPLETE) status = 'Level Complete!';

        document.getElementById('gameStatus').textContent = status;

        document.getElementById('startBtn').disabled = this.state === GAME_STATE.PLAYING;
        document.getElementById('pauseBtn').disabled = this.state !== GAME_STATE.PLAYING && this.state !== GAME_STATE.PAUSED;
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new PacManGame('gameCanvas');
    game.draw();
});
