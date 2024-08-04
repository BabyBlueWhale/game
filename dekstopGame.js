document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('gameOver');
    const collectSound = document.getElementById('collectSound');
    const gameOverSound = document.getElementById('gameOverSound');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let score = 0;
    let gameInterval;
    let obstacles = [];
    let trashItems = [];
    let player;

    const images = {
        background: new Image(),
        obstacle: new Image(),
        trash: new Image(),
        whale: new Image()
    };

    images.background.src = 'blue ocean.webp';
    images.obstacle.src = 'obstacle.png';
    images.trash.src = 'trash.png';
    images.whale.src = 'whale.png';

    class Player {
        constructor() {
            this.x = canvas.width / 2;
            this.y = canvas.height - 100;
            this.width = 50;
            this.height = 50;
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

            if (this.x < 0) {
                this.x = 0;
            }
            if (this.x + this.width > canvas.width) {
                this.x = canvas.width - this.width;
            }
            if (this.y < 0) {
                this.y = 0;
            }
            if (this.y + this.height > canvas.height) {
                this.y = canvas.height - this.height;
            }
        }

        move(dir) {
            switch (dir) {
                case 'ArrowUp':
                    this.dy = -this.speed;
                    break;
                case 'ArrowDown':
                    this.dy = this.speed;
                    break;
                case 'ArrowLeft':
                    this.dx = -this.speed;
                    break;
                case 'ArrowRight':
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
            this.width = 50;
            this.height = 50;
            this.speed = 2;
        }

        draw() {
            ctx.drawImage(images.obstacle, this.x, this.y, this.width, this.height);
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
            this.width = 30;
            this.height = 30;
            this.speed = 3;
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

    function init() {
        player = new Player();
        for (let i = 0; i < 5; i++) {
            obstacles.push(new Obstacle(Math.random() * canvas.width, Math.random() * canvas.height - canvas.height));
            trashItems.push(new Trash(Math.random() * canvas.width, Math.random() * canvas.height - canvas.height));
        }
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        gameInterval = setInterval(updateGame, 1000 / 60);
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
        player.update();
        player.draw();

        obstacles.forEach(obstacle => {
            obstacle.update();
            obstacle.draw();
            if (collision(player, obstacle)) {
                gameOver();
            }
        });

        trashItems.forEach(trash => {
            trash.update();
            trash.draw();
            if (collision(player, trash)) {
                collectSound.play();
                score++;
                scoreElement.textContent = `Score: ${score}`;
                trash.y = -trash.height;
                trash.x = Math.random() * canvas.width;
            }
        });
    }

    function collision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    }

    function gameOver() {
        clearInterval(gameInterval);
        gameOverSound.play();
        gameOverElement.style.display = 'block';
    }

    function restartGame() {
        gameOverElement.style.display = 'none';
        obstacles = [];
        trashItems = [];
        init();
    }

    window.addEventListener('keydown', e => player.move(e.key));
    window.addEventListener('keyup', () => player.stop());

    init();
});
