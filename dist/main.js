class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2D(0, 0); // Handle zero vector case
        }
        return new Vector2D(this.x / mag, this.y / mag);
    }
    dotProduct(other) {
        return this.x * other.x + this.y * other.y;
    }
    crossProduct(other) {
        return this.x * other.y - this.y * other.x;
    }
    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    angleTo(other) {
        const dot = this.dotProduct(other);
        const magProduct = this.magnitude() * other.magnitude();
        return Math.acos(dot / magProduct);
    }
    projectOnto(other) {
        const mag = other.magnitude();
        const scalarProjection = this.dotProduct(other) / (mag * mag);
        return other.normalize().scale(scalarProjection);
    }
    rotate(angle) {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const newX = this.x * cosAngle - this.y * sinAngle;
        const newY = this.x * sinAngle + this.y * cosAngle;
        return new Vector2D(newX, newY);
    }
    perpendicularTo(clockwise = false) {
        const sign = clockwise ? 1 : -1;
        return new Vector2D(-sign * this.y, sign * this.x);
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    divide(scalar) {
        if (scalar === 0) {
            throw new Error("Division by zero");
        }
        return new Vector2D(this.x / scalar, this.y / scalar);
    }
    getAngle() {
        return Math.atan2(this.y, this.x);
    }
    getDirection() {
        return this.normalize();
    }
    toArray() {
        return [this.x, this.y];
    }
    scale(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
}
class Planet {
    constructor(radius, game) {
        this.img = document.getElementById('planet');
        this.game = game;
        this.pos = new Vector2D(this.game.width * 0.5, this.game.height * 0.5);
        this.radius = radius;
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.pos.x - 100, this.pos.y - 100);
        if (this.game.debug) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    update() {
    }
}
class Player {
    constructor(game) {
        this.game = game;
        this.pos = new Vector2D(this.game.canvas.width * 0.5, this.game.canvas.height * 0.5);
        this.radius = 40;
        this.image = document.getElementById('player');
        this.angle = 0;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.radius, -this.radius);
        if (this.game.debug) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    update() {
        this.aim = this.game.calcAim(this.game.planet.pos, this.game.mouse);
        this.pos.x = this.game.planet.pos.x + (this.game.planet.radius + this.radius) * this.aim[0];
        this.pos.y = this.game.planet.pos.y + (this.game.planet.radius + this.radius) * this.aim[1];
        this.angle = Math.atan2(this.aim[3], this.aim[2]);
    }
    shoot() {
        const projectile = this.game.getProjectile();
        if (projectile) {
            projectile.start(this.pos.x + this.radius * this.aim[0], this.pos.y + this.radius * this.aim[1], this.aim[0], this.aim[1]);
        }
    }
}
class Enemy {
    constructor(game) {
        this.game = game;
        this.pos = new Vector2D(0, 0);
        this.radius = 40;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.vel = new Vector2D(0, 0);
        this.free = true;
    }
    start() {
        this.free = false;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * this.game.width;
            y = Math.random() < 0.5 ? -this.radius : this.game.height + this.radius;
        }
        else {
            x = Math.random() < 0.5 ? -this.radius : this.game.width + this.radius;
            y = Math.random() * this.game.height;
        }
        this.pos = new Vector2D(x, y);
        let aim = this.game.calcAim(this.pos, this.game.planet.pos);
        this.vel = new Vector2D(aim[0], aim[1]);
    }
    reset() {
        // free = true (enemy is available)
        this.free = true;
    }
    draw(ctx) {
        if (!this.free) {
            if (this.game.debug) {
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    update() {
    }
}
class Asteroid extends Enemy {
    constructor(game) {
        super(game);
        this.image = document.getElementById('asteroid');
        this.frameX = 0;
        this.frameY = Math.floor(Math.random() * 4);
        this.lives = 5;
        this.maxFrame = 7;
        this.collided = false;
    }
    hit(damage) {
        this.lives -= damage;
    }
    update() {
        if (!this.free) {
            this.pos = this.pos.add(this.vel);
            // Check collisions with enemy / planet
            if (this.game.checkCollision(this, this.game.planet) ||
                this.game.checkCollision(this, this.game.player)) {
                this.vel = this.vel.multiply(0); // stop enemy velocity
                this.collided = true;
            }
            // Check collisions with enemy / projectiles
            this.game.projectilePool.all.forEach(projectile => {
                if (!projectile.free) {
                    if (this.game.checkCollision(this, projectile) && this.lives > 0) {
                        projectile.reset();
                        this.hit(1);
                    }
                }
            });
            // Sprite animation - if lives = 0 and 
            if (this.lives < 1 && this.game.spriteAnimationTimer.ready) {
                this.frameX++;
            }
            // one all explosion animation is done
            // reset enemy back to enemy pool
            // add score/
            if (this.frameX > this.maxFrame) {
                this.game.addScore(2);
                this.reset();
            }
        }
    }
    start() {
        this.lives = 5;
        this.frameX = 0;
        this.frameY = Math.floor(Math.random() * 4);
        super.start();
    }
    draw(ctx) {
        if (!this.free) {
            ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.pos.x - this.radius, this.pos.y - this.radius, this.width, this.height);
            if (this.game.debug) {
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = '50px Helvetica';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillText(this.lives.toString(), this.pos.x, this.pos.y);
                ctx.restore();
            }
            super.draw(ctx);
        }
    }
}
class Projectile {
    constructor(game) {
        this.game = game;
        this.pos = new Vector2D(0, 0);
        this.vel = new Vector2D(0, 0);
        this.radius = 5;
        this.free = true;
        this.velScalar = 5;
    }
    start(x, y, speedX, speedY) {
        this.free = false;
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(speedX, speedY).scale(this.velScalar);
    }
    reset() {
        this.free = true;
    }
    draw(ctx) {
        if (!this.free) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'gold';
            ctx.fill();
            ctx.restore();
        }
    }
    update() {
        if (!this.free) {
            this.pos = this.pos.add(this.vel);
        }
        if (this.pos.x < 0
            || this.pos.x > this.game.width
            || this.pos.y < 0
            || this.pos.y > this.game.height) {
            this.reset();
        }
    }
}
class Timer {
    constructor(targetInterval) {
        this.counter = 0;
        this.interval = targetInterval;
    }
    get ready() {
        return this.counter > this.interval;
    }
    add(deltaTime) {
        this.counter += deltaTime;
    }
    reset() {
        this.counter = 0;
    }
}
class Pool {
    constructor(itemClass, maxItems, game) {
        this.items = [];
        this.game = game;
        this.maxItems = maxItems;
        for (let i = 0; i < maxItems; i++) {
            this.items.push(new itemClass(game));
        }
    }
    // @property
    get all() {
        return this.items;
    }
    add(item) {
        this.items.push(item);
    }
    get(index) {
        if (index > this.items.length)
            throw new Error("Index out of range.");
        return this.items[index];
    }
}
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.planet = new Planet(80, this);
        this.mouse = new Vector2D(0, 0);
        this.player = new Player(this);
        this.debug = false;
        this.score = 0;
        this.projectilePool = new Pool(Projectile, 5, this);
        this.enemyPool = new Pool(Asteroid, 5, this);
        this.enemyPool.get(0).start(); // start first enemy        
        this.enemyTimer = new Timer(1700);
        this.spriteAnimationTimer = new Timer(90);
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }
    addScore(amt) {
        this.score += amt;
        if (this.score % 50 == 0) { // if game score is multiple of 100s
            // this.enemyInterval *= 0.95            // reduce enemy interval rate by 5%
            this.enemyPool.add(new Enemy(this)); // add 1 extra enemy to pool
        }
    }
    getEnemy() {
        for (let enemy of this.enemyPool.all) {
            if (enemy.free) {
                return enemy;
            }
        }
    }
    getProjectile() {
        for (let projectile of this.projectilePool.all) {
            if (projectile.free) {
                return projectile;
            }
        }
    }
    handleKeyup(e) {
        if (e.key === "d") {
            this.debug = !this.debug;
        }
        console.log(`[debug] is ${this.debug ? 'ON' : 'OFF'}`);
    }
    handleMouseMove(e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }
    handleMouseDown(e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.player.shoot();
    }
    drawStatusText(ctx) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.font = '30px Impact';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${this.score}`, 20, 30);
        ctx.restore();
    }
    checkCollision(a, b) {
        let dist = a.pos.distanceTo(b.pos);
        return dist <= (a.radius + b.radius);
    }
    calcAim(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        const aimX = dx / dist * -1;
        const aimY = dy / dist * -1;
        return [aimX, aimY, dx, dy];
    }
    render(ctx, deltaTime) {
        // draw player
        this.player.draw(ctx);
        this.player.update();
        // draw status text
        this.drawStatusText(ctx);
        // draw planer
        this.planet.draw(ctx);
        // draw projectiles
        this.projectilePool.all.forEach(projectile => {
            projectile.draw(ctx);
            projectile.update();
        });
        // draw enemies
        for (let i = 0; i < this.enemyPool.all.length; i++) {
            let enemy = this.enemyPool.get(i);
            enemy.draw(ctx);
            enemy.update();
        }
        // periodic activate an enemy
        if (this.enemyTimer.ready) {
            const enemy = this.getEnemy();
            if (enemy)
                enemy.start();
            this.enemyTimer.reset();
        }
        else {
            this.enemyTimer.add(deltaTime);
        }
        // periodic activate explosion sprite
        if (this.spriteAnimationTimer.ready) {
            this.spriteAnimationTimer.reset();
        }
        else {
            this.spriteAnimationTimer.add(deltaTime);
        }
        // Debug mode if pressed "d" key
        if (this.debug) {
            ctx.font = '20px Sans Serif';
            ctx.textAlign = 'right';
            ctx.strokeText(`[debug]`, this.canvas.width - 10, 20);
            ctx.strokeText(`hit border ON`, this.canvas.width - 10, 40);
            ctx.strokeText(`${(1000 / deltaTime).toFixed(0)} FPS`, this.canvas.width - 10, 60);
            ctx.strokeText(`Enemies every ${this.enemyTimer.interval} ms`, this.canvas.width - 10, 80);
            ctx.strokeText(`${this.enemyPool.all.length} enemies`, this.canvas.width - 10, 100);
        }
    }
}
window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    const game = new Game(canvas);
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});
