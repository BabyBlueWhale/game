const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('gameOver');

const whaleImage = new Image();
whaleImage.src = 'whale.png'; // Make sure to replace this with the path to your whale image

const trashImage = new Image();
trashImage.src = 'trash.png'; // Make sure to replace this with the path to your trash image

const obstacleImage = new Image();
obstacleImage.src = 'obstacle.png'; // Make sure to replace this with the path to your obstacle image

const whale = {
    x: 100,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    dy: 0,
};

const trashItems = [];
const obstacles = [];

function createTrash() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - 20) + 10;
    trashItems.push({ x, y, width: 30, height: 30 });
}

function createObstacle() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - 30) + 15;
    obstacles.push({ x, y, width: 40, height: 40 });
}

function update() {
    whale.y += whale.dy;
    whale.y = Math.min(Math.max(whale.y, 0), canvas.height - whale.height);

    trashItems.forEach((item, index) => {
        item.x -= 4;
        if (item.x + item.width < 0) {
            trashItems.splice(index, 1);
        }
        if (checkCollision(whale, item)) {
            trashItems.splice(index, 1);
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    });

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
        if (checkCollision(whale, obstacle)) {
            gameOver = true;
        }
    });

    if (gameOver) {
        gameOverDisplay.style.display = 'block';
        cancelAnimationFrame(loop);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(whaleImage, whale.x, whale.y, whale.width, whale.height);

    trashItems.forEach(item => {
        ctx.drawImage(trashImage, item.x, item.y, item.width, item.height);
    });

    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function loop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(loop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') whale.dy = -5;
    if (e.key === 'ArrowDown') whale.dy = 5;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') whale.dy = 0;
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function restartGame() {
    score = 0;
    whale.y = canvas.height / 2;
    trashItems.length = 0;
    obstacles.length = 0;
    gameOver = false;
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverDisplay.style.display = 'none';
    loop();
}

setInterval(createTrash, 2000);
setInterval(createObstacle, 3000);

whaleImage.onload = () => {
    loop();
};
