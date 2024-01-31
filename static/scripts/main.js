"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var planet_1 = require("./planet");
var player_1 = require("./player");
var Game = /** @class */ (function () {
    function Game(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.planet = new planet_1.Planet(80, this);
        this.mouse = {
            x: 0,
            y: 0
        };
        this.player = new player_1.Player(this);
        this.debug = false;
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }
    Game.prototype.handleKeyup = function (e) {
        if (e.key === "d") {
            this.debug = !this.debug;
        }
        console.log(this.debug);
    };
    Game.prototype.handleMouseMove = function (e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    };
    Game.prototype.calcAim = function (a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        var aimX = dx / dist * -1;
        var aimY = dy / dist * -1;
        return [aimX, aimY, dx, dy];
    };
    Game.prototype.render = function (ctx) {
        this.player.draw(ctx);
        this.planet.draw(ctx);
        this.player.update();
    };
    return Game;
}());
exports.Game = Game;
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
