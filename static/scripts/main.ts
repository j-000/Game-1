interface Position {
    x: number,
    y: number
}

class Planet {
    pos: Position;
    game: Game;
    radius: number;
    img : CanvasImageSource;

    constructor(radius: number, game: Game){
        this.img = document.getElementById('planet') as CanvasImageSource;
        this.game = game;
        this.pos = {
            x: this.game.width * 0.5,
            y: this.game.width * 0.5
        }
        this.radius = radius;          
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.img, this.pos.x - 100, this.pos.y - 100);
        if(this.game.debug) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    update(){
    }
}

class Player{ 
    pos: Position;
    game: Game; 
    radius : number;
    image : CanvasImageSource;
    aim: Array<number>;
    angle: number;

    constructor(game: Game){
        this.game = game;
        this.pos = {
            x: this.game.canvas.width * 0.5,
            y: this.game.canvas.height * 0.5
        };
        this.radius = 40;
        this.image = document.getElementById('player') as CanvasImageSource;
        this.angle = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.radius, -this.radius);
        
        if(this.game.debug) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
 
    update(){
        this.aim = this.game.calcAim(this.game.planet.pos, this.game.mouse);
        this.pos.x = this.game.planet.pos.x + (this.game.planet.radius + this.radius) * this.aim[0];
        this.pos.y = this.game.planet.pos.y + (this.game.planet.radius + this.radius) * this.aim[1];
        this.angle = Math.atan2(this.aim[3], this.aim[2]);
    }
}

class Game {
    canvas : HTMLCanvasElement;
    width : number;
    height : number; 
    planet : Planet;
    player: Player;
    mouse : Position;
    debug : boolean;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.planet = new Planet(80, this);
        this.mouse = {
            x: 0,
            y: 0
        }
        this.player = new Player(this);
        this.debug = false;
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    private handleKeyup(e: KeyboardEvent){
        if(e.key === "d") {
            this.debug = !this.debug;
        }
        console.log(this.debug);
    }

    private handleMouseMove(e: MouseEvent){
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    calcAim(a: Position, b : Position): Array<number>{
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx**2 + dy**2);
        const aimX = dx / dist * -1;
        const aimY = dy / dist * -1;
        return [aimX, aimY, dx, dy];
    }

    render(ctx: CanvasRenderingContext2D){
        this.player.draw(ctx);
        this.planet.draw(ctx);
        this.player.update();   
    }

}


window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    const game = new Game(canvas); 
    game.render(ctx);

    function animate(){
        ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})