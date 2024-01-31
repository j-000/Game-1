"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
var Planet = /** @class */ (function () {
    function Planet(radius, game) {
        this.img = document.getElementById('planet');
        this.game = game;
        this.pos = {
            x: this.game.width * 0.5,
            y: this.game.width * 0.5
        };
        this.radius = radius;
    }
    Planet.prototype.draw = function (ctx) {
        ctx.drawImage(this.img, this.pos.x - 100, this.pos.y - 100);
        if (this.game.debug) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    };
    Planet.prototype.update = function () {
    };
    return Planet;
}());
exports.Planet = Planet;
