"use strict";

/**
 * @module exports the Laser class
 */
module.exports = exports = Laser;


function Laser(position, canvas, angle)
{
    this.worldWidth = canvas.width;
    this.worldHeight = canvas.height;
    this.position = {
        x: position.x,
        y: position.y
    };
    this.velocity = {
        x: -(Math.sin(angle)),
        y: -Math.cos(angle)
    };
    this.angle = -angle;
    this.radius  = 64;
    this.sprite = new Image();
    this.sprite.src = 'assets/laser.png';
}

Laser.prototype.update = function()
{
    this.position.x += this.velocity.x * 3;
    this.position.y += this.velocity.y * 3;
}

Laser.prototype.render = function(ctx)
{
    ctx.strokeStyle = "#FF4500";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + 10*(-this.velocity.x), this.position.y - 10*(this.velocity.y));
    ctx.stroke();
    ctx.lineWidth = 1;
}