const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const leaderboardElement = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboardList');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let timeElapsed = 0;
let player;
let obstacles = [];
let trashItems = [];
let gameInterval;
let timerInterval;
let difficultyInterval;
let isGameOver = false;
let trashSpeed = 3;
let obstacleSpeed = 2;

const images = {
    background: new Image(),
    octopus: new Image(),
    trash: new Image(),
    whale: new Image()
};

images.background.src = 'blue ocean.webp';
images.octopus.src = 'octupus.png';
images.trash.src = 'trash.png';
images.whale.src = 'whale.png';

class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.width = 83;
        this.height = 83;
        this.speed = 10;
        this.dx = 0;
        this.dy = 0;
    }

    draw() {
        ctx.drawImage(images.whale, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }

    move(dir) {
        switch (dir) {
            case 'ArrowUp':
            case 'touchUp':
                this.dy = -this.speed;
                break;
            case 'ArrowDown':
            case 'touchDown':
                this.dy = this.speed;
                break;
            case 'ArrowLeft':
            case 'touchLeft':
                this.dx = -this.speed;
                break;
            case 'ArrowRight':
            case 'touchRight':
                this.dx = this.speed;
                break;
        }
    }

    stop() {
        this.dx = 0;
        this.dy = 0;
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.speed = obstacleSpeed;
    }

    draw() {
        ctx.drawImage(images.octopus, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }
}

class Trash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = trashSpeed;
    }

    draw() {
        ctx.drawImage(images.trash, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }
}

function startGame() {
    isGameOver = false;
    score = 0;
    timeElapsed = 0;
    trashSpeed = 3;
    obstacleSpeed = 2;
    scoreElement.textContent = `Score: ${score}`;
    timerElement.textContent = `Time: ${timeElapsed}`;
    leaderboardElement.style.display = 'none';
    obstacles = [];
    trashItems = [];
    player = new Player();
    for (let i = 0; i < 5; i++) {
        obstacles.push(new Obstacle(Math.random() * canvas.width, Math.random() * canvas.height - canvas.height));
        trashItems.push(new Trash(Math.random() * canvas.width, Math.random() * canvas.height - canvas.height));
    }
    gameInterval = setInterval(updateGame, 1000 / 60);
    timerInterval = setInterval(updateTimer, 1000);
    difficultyInterval = setInterval(() => {
        increaseDifficulty(true);
    }, 15000); // Every 15 seconds
}

function updateGame() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();

    obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
        if (collision(player, obstacle)) {
            endGame();
        }
    });

    trashItems.forEach(trash => {
        trash.update();
        trash.draw();
        if (collision(player, trash)) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            trash.y = -trash.height;
            trash.x = Math.random() * canvas.width;

            if (score % 10 === 0) {
                increaseDifficulty(false); // Every 10 points
            }
        }
    });
}

function updateTimer() {
    if (isGameOver) return;

    timeElapsed++;
    timerElement.textContent = `Time: ${timeElapsed}`;
}

function increaseDifficulty(fromTimer) {
    if (isGameOver) return;

    if (fromTimer || score % 10 === 0) {
        trashSpeed += 0.5;
        obstacleSpeed += 0.5;

        obstacles.forEach(obstacle => {
            obstacle.speed = obstacleSpeed;
        });

        trashItems.forEach(trash => {
            trash.speed = trashSpeed;
        });
    }
}

function collision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(difficultyInterval);
    isGameOver = true;
    saveScore(score, timeElapsed);
    displayLeaderboard();
}

function saveScore(score, time) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ score, time });
    leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `#${index + 1}: ${entry.score} points in ${entry.time} seconds`;
        leaderboardList.appendChild(li);
    });
    leaderboardElement.style.display = 'block';
}

// Event listeners for keyboard controls
window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        player.move(e.key);
    }
});
window.addEventListener('keyup', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        player.stop();
    }
});

// Event listeners for touch controls
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', handleTouchEnd);

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    if (touchY < player.y) {
        player.move('touchUp');
    } else if (touchY > player.y + player.height) {
        player.move('touchDown');
    }

    if (touchX < player.x) {
        player.move('touchLeft');
    } else if (touchX > player.x + player.width) {
        player.move('touchRight');
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    player.stop();
}

startGame();
