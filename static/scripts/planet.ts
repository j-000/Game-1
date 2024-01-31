import { Game } from './main'
import { Position } from './interfaces';

export class Planet {
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

