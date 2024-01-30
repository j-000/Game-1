class Planet {
    public x: number;
    public y: number;
    private game: Game;
    private radius: number;
    private img : CanvasImageSource;

    constructor(radius: number, game: Game){
        this.img = document.getElementById('planet') as CanvasImageSource;
        this.game = game;
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5;
        this.radius = radius;          
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.img, this.x - 100, this.y - 100);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Game {
    public canvas : HTMLCanvasElement;
    public width : number;
    public height : number;
    private planet : Planet;
    public mouse : {
        x: number,
        y: number
    }

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.planet = new Planet(80, this);
        this.mouse = {
            x: 0,
            y: 0
        }
        this.canvas.addEventListener('mousemove', this.handleMousemove.bind(this));

    }
    private handleMousemove(e: MouseEvent){
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    render(ctx: CanvasRenderingContext2D){
        this.planet.draw(ctx);
        ctx.moveTo(this.planet.x, this.planet.y);
        ctx.lineTo(this.mouse.x, this.mouse.y);
        ctx.stroke();
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