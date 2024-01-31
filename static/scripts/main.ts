import { Planet } from "./planet";
import { Player } from "./player";
import { Position } from "./interfaces";

export class Game {
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