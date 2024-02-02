class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize(): Vector2D {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2D(0, 0); // Handle zero vector case
        }
        return new Vector2D(this.x / mag, this.y / mag);
    }

    dotProduct(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }

    crossProduct(other: Vector2D): number {
        return this.x * other.y - this.y * other.x;
    }

    distanceTo(other: Vector2D): number {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    angleTo(other: Vector2D): number {
        const dot = this.dotProduct(other);
        const magProduct = this.magnitude() * other.magnitude();
        return Math.acos(dot / magProduct);
    }

    projectOnto(other: Vector2D): Vector2D {
        const mag = other.magnitude();
        const scalarProjection = this.dotProduct(other) / (mag * mag);
        return other.normalize().scale(scalarProjection);
    }

    rotate(angle: number): Vector2D {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const newX = this.x * cosAngle - this.y * sinAngle;
        const newY = this.x * sinAngle + this.y * cosAngle;
        return new Vector2D(newX, newY);
    }

    perpendicularTo(clockwise: boolean = false): Vector2D {
        const sign = clockwise ? 1 : -1;
        return new Vector2D(-sign * this.y, sign * this.x);
    }

    equals(other: Vector2D): boolean {
        return this.x === other.x && this.y === other.y;
    }

    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector2D {
        if (scalar === 0) {
            throw new Error("Division by zero");
        }
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    getAngle(): number {
        return Math.atan2(this.y, this.x);
    }

    getDirection(): Vector2D {
        return this.normalize();
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }

    scale(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
}


class CircleEntity {
    game: Game;
    pos: Vector2D;
    vel: Vector2D;
    img: CanvasImageSource;
    radius: number;

    constructor(game: Game, img: CanvasImageSource, pos: Vector2D, radius: number, vel?: Vector2D){
        this.game = game;
        this.pos = pos;
        this.vel = vel;
        this.img = img;
        this.radius = radius;
    }

    draw(ctx: CanvasRenderingContext2D){
        let im = this.img as HTMLImageElement;
        if(im){
            ctx.drawImage(this.img, this.pos.x - im.width / 2, this.pos.y - im.height / 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // Allow the following to be overriden in child classes
        this.displayDebugInfo(ctx);
    }


    displayDebugInfo(ctx: CanvasRenderingContext2D){
        if(this.game.debug) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}


class Planet extends CircleEntity{

    constructor(radius: number, game: Game){
        let img = document.getElementById('planet') as CanvasImageSource;
        let pos = new Vector2D(game.width * 0.5, game.height * 0.5);
        super(game, img, pos, radius)
    }

}


class Player extends CircleEntity{ 
    aim: Array<number>;
    angle: number;

    constructor(game: Game){
        let img = document.getElementById('player') as CanvasImageSource;
        let pos = new Vector2D(game.canvas.width * 0.5, game.canvas.height * 0.5);
        let radius = 40;
        super(game, img, pos, radius)

        // Custom properties
        this.angle = 0;
        this.aim = []
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Overriding draw() method.
        // The spaceship needs to be oriented away from the planet as the 
        // mouse moves. 
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.img, -this.radius, -this.radius);
        ctx.restore();
        
        // Ensure debug is still shown.
        this.displayDebugInfo(ctx);
    }
 
    update(){
        this.aim = this.game.calcAim(this.game.planet.pos, this.game.mouse);
        this.pos.x = this.game.planet.pos.x + (this.game.planet.radius + this.radius) * this.aim[0];
        this.pos.y = this.game.planet.pos.y + (this.game.planet.radius + this.radius) * this.aim[1];
        this.angle = Math.atan2(this.aim[3], this.aim[2]);
    }

    shoot(){
        const projectile = this.game.getProjectile();        
        if (projectile){
            projectile.start(
                this.pos.x + this.radius * this.aim[0], 
                this.pos.y + this.radius * this.aim[1], 
                this.aim[0], 
                this.aim[1]
            );
        }
    }
}


class Asteroid {
    frameX: number;
    frameY: number;
    maxFrame: number;
    image: CanvasImageSource;
    lives: number;
    collided: boolean;
    game: Game;
    pos: Vector2D;
    radius: number;
    width: number;
    height: number;
    vel: Vector2D;
    free: boolean;

    constructor(game: Game){
        this.game = game;
        this.pos = new Vector2D(0, 0);
        this.radius = 40;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.vel = new Vector2D(0, 0);
        this.free = true;
        this.image = document.getElementById('asteroid') as CanvasImageSource;
        this.frameX = 0;
        this.frameY = Math.floor(Math.random() * 4);
        this.lives = 5;
        this.maxFrame = 7;
        this.collided = false;
    }
    reset(){
        this.free = true;
    }

    hit(damage: number) {
        this.lives -= damage;
    }

    update(){
        if(!this.free){
            this.pos = this.pos.add(this.vel);
            
            // Check collisions with enemy / planet
            if(this.game.checkCollision(this, this.game.planet) ||
                this.game.checkCollision(this, this.game.player))
            {
                this.vel = this.vel.multiply(0); // stop enemy velocity
                this.collided = true;  
                
                this.reset()
                // reduce live count after resetting enemy
                // to ensure only 1 live is deducted
                this.game.lives--;
            }

            // Check collisions with enemy / projectiles
            for(let projectile of this.game.projectilePool){
                if(!projectile.free){
                    if(this.game.checkCollision(this, projectile) && this.lives > 0){
                        projectile.reset();
                        this.hit(1);
                        this.vel = this.vel.multiply(0.9);
                    }
                }
            }

            // Sprite animation - if lives = 0 and 
            if(this.lives < 1 && this.game.spriteAnimationTimer.ready) {
                this.frameX++;
            }
            // one all explosion animation is done
            // reset enemy back to enemy pool
            // add score/
            if(this.frameX > this.maxFrame) {
                let scoreValue = Number((this.pos.distanceTo(this.game.player.pos) * 0.10).toFixed(0));
                this.game.addScore(scoreValue);
                this.reset();
            }
        }
    }

    start() {
        this.lives = 5;
        this.frameX = 0;
        this.frameY = Math.floor(Math.random() * 4);
        this.free = false;
        let x: number, y : number;

        if(Math.random() < 0.5) {
            x = Math.random() * this.game.width;
            y = Math.random() < 0.5 ? -this.radius : this.game.height + this.radius;
        } else {
            x = Math.random() < 0.5 ? -this.radius : this.game.width + this.radius;
            y = Math.random() * this.game.height;
        }

        this.pos = new Vector2D(x, y)
        let aim = this.game.calcAim(this.pos, this.game.planet.pos);
        this.vel = new Vector2D(aim[0], aim[1]);
    }

    draw(ctx: CanvasRenderingContext2D){
        if(!this.free){
            ctx.drawImage(
                this.image, 
                this.frameX * this.width, this.frameY * this.height, 
                this.width, this.height,
                this.pos.x - this.radius, this.pos.y - this.radius, 
                this.width, this.height
            )
            if(this.game.debug){
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = '50px Helvetica';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillText(this.lives.toString(), this.pos.x, this.pos.y);
                ctx.restore();
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

    }
    
}


class Projectile extends CircleEntity{
    velScalar: number;
    free: boolean;
    
    constructor(game: Game) {
        let img = null;
        let pos = new Vector2D(0, 0)
        let vel = new Vector2D(0, 0);
        let radius = 5;
        super(game, img, pos, radius, vel)

        // Custom properties
        this.free = true;
        this.velScalar = 5;
    }

    start(x: number, y: number, speedX: number, speedY: number){
        this.free = false;
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(speedX, speedY).scale(this.velScalar)      
    }

    reset(){
        this.free = true;
        this.pos = this.pos.multiply(-1); // set position to offcanvas
    }

    draw(ctx: CanvasRenderingContext2D){     
        if(!this.free) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2); 
            ctx.fillStyle = 'gold';
            ctx.fill();
            ctx.restore();
            this.displayDebugInfo(ctx);
        }
    }

    update(){
        // Only update projectiles that have been shot (NOT in the pool);
        if(!this.free) {
            // Update the projectile position acording to its velocity
            this.pos = this.pos.add(this.vel)


            // If the same is STOP, check if start button is triggered
            // triggering the button is done by shooting at it
            if(this.game.stop && this.game.checkCollision(this, this.game.btn)){
                // Reset projectile
                this.reset();
                // Reset game
                this.game.reset();            
            }

            // If projectile goes off canvas, reset it
            if(this.pos.x < 0 || this.pos.x > this.game.width || 
               this.pos.y < 0 || this.pos.y > this.game.height){
                this.reset();
            }
        }
    }
    
}


class Timer {
    counter: number;
    interval: number;

    constructor(targetInterval: number){
        this.counter = 0;
        this.interval = targetInterval;
    }
    
    public get ready() : boolean {
        return this.counter > this.interval;
    }
    
    add(deltaTime: number) {
        this.counter += deltaTime;
    }    
    
    reset(){
        this.counter = 0;
    }
}


class Pool<T> {
    items: Array<T>;
    game: Game;
    maxItems: number;
    
    constructor(itemClass: typeof Asteroid | typeof Projectile, maxItems: number, game: Game){
        this.items = [];
        this.game = game;
        this.maxItems = maxItems;
        for(let i = 0; i < maxItems; i++){
            if(itemClass === Asteroid){
                this.items.push(new Asteroid(game) as unknown as T)
            } else if(itemClass === Projectile) {
                this.items.push(new Projectile(game) as unknown as T)
            }
        }
    }

    *[Symbol.iterator]() {
        for(let item of this.items) {
            yield item
        }
    }
    
    public get length(): number {
        return this.items.length;
    }

    add(item: T): void{
        this.items.push(item);
    }

    get(index: number): T{
        if(index > this.items.length) throw new Error("Index out of range.");
        return this.items[index]
    }
}


class Button extends CircleEntity {
    constructor(game: Game, pos: Vector2D) {
        let img = null;
        let radius = 50;
        super(game, img, pos, radius);
    }
    
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '30px Impact';
        ctx.fillStyle = 'white';
        ctx.fillText('Start', this.pos.x, this.pos.y);
        ctx.restore();
    }
}


class Game {
    canvas: HTMLCanvasElement;
    width: number;
    height: number; 
    planet: Planet;
    player: Player;
    mouse: Vector2D;
    debug: boolean;

    projectilePool: Pool<Projectile>;
    
    enemyPool: Pool<Asteroid>;

    enemyTimer: Timer
    spriteAnimationTimer: Timer;

    score: number;
    lives: number;
    stop: boolean;

    btn: Button

    shootAudio: HTMLElement
    explosionAudio: HTMLElement

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.planet = new Planet(80, this);
        this.mouse = new Vector2D(0, 0);
        this.player = new Player(this);
        this.debug = false;
        this.score = 0;
        this.lives = 10;
        this.projectilePool = new Pool(Projectile, 10, this);

        this.enemyPool = new Pool(Asteroid, 5, this);
        (this.enemyPool.get(0) as Asteroid).start();            // start first enemy        

        this.enemyTimer = new Timer(1700);
        this.spriteAnimationTimer = new Timer(90);
        this.stop = false;
        this.btn =  new Button(this, new Vector2D(this.width / 2, this.height - 150));
        this.shootAudio = document.getElementById('shootAudio');
        this.explosionAudio = document.getElementById('explosionAudio');

        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
        window.addEventListener('resize', e => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = 800;
        })
    }

    addScore(amt: number){
        this.score += amt;
    }

    getEnemy(): Asteroid {
        for(let enemy of this.enemyPool){
            if(enemy.free){
                return enemy as Asteroid;
            }
        }
    }

    getProjectile(): Projectile{
        for(let projectile of this.projectilePool){
            if(projectile.free){
                return projectile as Projectile;
            }
        }
    }

    handleKeyup(e: KeyboardEvent){
        if(e.key === "d") {
            this.debug = !this.debug;
            console.log(`[debug] is ${this.debug ? 'ON' : 'OFF'}`);
            if(this.debug){
                console.log({
                    'd': 'Toggle debug mode.',
                    'g': 'Log <Game> class.'
                });
            }
        }

        if(e.key === "g"){
            if(this.debug) {
                console.log(this);
            }
        }
    }

    handleMouseMove(e: MouseEvent){
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    handleMouseDown(e: MouseEvent) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.player.shoot();
    }

    drawStatusText(ctx: CanvasRenderingContext2D){
        ctx.save();
        ctx.textAlign = 'left';
        ctx.font = '30px Impact';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${this.score}`, 20, 30);
        ctx.restore();
    }

    drawLives(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = 'white';
        for(let i = 0; i < this.lives; i++){
            ctx.fillRect(20 + 15 * i, 50, 10, 30);
        }
        if(this.lives < 1) {
            this.stop = true;
            ctx.font = '60px Impact'
            ctx.textAlign = 'center'
            ctx.fillText('You Loose!', this.width * 0.5, this.height * 0.25);
        }
        ctx.restore();
    }

    checkCollision(a, b): boolean{
        let dist = a.pos.distanceTo(b.pos);
        return dist <= (a.radius + b.radius)
    }

    calcAim(a: Vector2D, b : Vector2D): Array<number>{
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx**2 + dy**2);
        const aimX = dx / dist * -1;
        const aimY = dy / dist * -1;
        return [aimX, aimY, dx, dy];
    }

    reset(){
        this.lives = 10;
        this.stop = false;
        this.score = 0;
        // Ensure that enemies positions are reset. 
        // This avoids the case when restarting the game with enemies too close from 
        // last game.
        for(let enemy of this.enemyPool) {
            enemy.reset();
        }
    }

    render(ctx: CanvasRenderingContext2D, deltaTime: number){
        // draw player
        this.player.draw(ctx);
        this.player.update();   

        // draw status text
        this.drawStatusText(ctx);

        // draw lives
        this.drawLives(ctx);

        // draw planet
        this.planet.draw(ctx);

        // draw projectiles
        for(let i = 0; i < this.projectilePool.length; i++) {
            let projectile = this.projectilePool.get(i) as Projectile;
            projectile.draw(ctx);
            projectile.update()
        }

        // draw projectile pool
        ctx.save();
        ctx.font = '15px Impact';
        ctx.fillStyle = 'white';
        // let s = 'Projectiles:'
        // ctx.fillText(s, this.width - 200, this.height - 100);
        let freeProjectiles = this.projectilePool.items.filter(p => p.free).length;
        for(let i = 0; i < freeProjectiles; i++){
            ctx.beginPath();
            ctx.arc((this.width - 24 * this.projectilePool.maxItems) + (24 * i), 20, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'gold';
            ctx.fill();
        }
        ctx.restore();

        // Only draw enemies if the game is not over
        if(!this.stop){
            // draw enemies
            for(let i = 0; i < this.enemyPool.length; i++) {
                let enemy = this.enemyPool.get(i) as Asteroid;
                enemy.draw(ctx);
                enemy.update()
            }

            // periodic activate an enemy
            if(this.enemyTimer.ready){
                const enemy = this.getEnemy() as Asteroid;
                if(enemy) enemy.start();
                this.enemyTimer.reset();
            } else {
                this.enemyTimer.add(deltaTime)
            }

            // periodic activate explosion sprite
            if(this.spriteAnimationTimer.ready){
                this.spriteAnimationTimer.reset()
            } else {
                this.spriteAnimationTimer.add(deltaTime);
            }
        } else {
            this.btn.draw(ctx);
        } 
            

        // Debug mode if pressed "d" key
        if(this.debug) {
            ctx.font = '20px Sans Serif';
            ctx.textAlign = 'right';
            ctx.strokeText(`[debug]`, this.canvas.width - 10, 20);
            ctx.strokeText(`hit border ON`, this.canvas.width - 10, 40);
            ctx.strokeText(`${(1000 / deltaTime).toFixed(0)} FPS`, this.canvas.width - 10, 60);
            ctx.strokeText(`Enemies every ${this.enemyTimer.interval} ms`, this.canvas.width - 10, 80);
            ctx.strokeText(`${this.enemyPool.length} enemies`, this.canvas.width - 10, 100);
        }

    }

}


// Once all HTML and images are loaded
window.addEventListener('load', () => {

    // Get canvas and set dimensions
    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = 800;

    // Get canvas context and set some global defaults
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // Instanciate a Game instance
    const game = new Game(canvas); 

    let lastTime = 0;
    function animate(timeStamp: number){
        // [Helper] calculate time it takes to animate 1 frame.
        // Used to calculate FPS metric, for example.
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        // Reset canvas
        ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

        // Render new frame
        game.render(ctx, deltaTime);

        // Loop
        requestAnimationFrame(animate);        
    }
    // Loop
    requestAnimationFrame(animate);
})