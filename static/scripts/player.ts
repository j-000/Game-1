import { Position } from "./interfaces";
import { Game } from "./main";

export class Player{ 
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