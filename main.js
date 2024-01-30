var Planet = /** @class */ (function () {
    function Planet(radius, game) {
        this.img = document.getElementById('planet');
        this.game = game;
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5;
        this.radius = radius;
    }
    Planet.prototype.draw = function (ctx) {
        ctx.drawImage(this.img, this.x - 100, this.y - 100);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    };
    return Planet;
}());
var Game = /** @class */ (function () {
    function Game(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.planet = new Planet(80, this);
        this.mouse = {
            x: 0,
            y: 0
        };
        this.canvas.addEventListener('mousemove', this.handleMousemove.bind(this));
    }
    Game.prototype.handleMousemove = function (e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    };
    Game.prototype.render = function (ctx) {
        this.planet.draw(ctx);
        ctx.moveTo(this.planet.x, this.planet.y);
        ctx.lineTo(this.mouse.x, this.mouse.y);
        ctx.stroke();
    };
    return Game;
}());
window.addEventListener('load', function () {
    var canvas = document.getElementById('canvas1');
    canvas.width = 800;
    canvas.height = 800;
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    var game = new Game(canvas);
    game.render(ctx);
    function animate() {
        ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});
