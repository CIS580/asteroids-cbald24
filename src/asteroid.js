"use strict";

/**
 * @module exports the Asteroid class
 */
module.exports = exports = Asteroid;

var rInt = getRandomInt(1, 12);

function Asteroid(position, size, color, canvas, id, velocity)
{
    switch(size)
    {
        case 1:
            this.id = id;
            this.worldWidth = canvas.width;
            this.worldHeight = canvas.height;
            this.mass = 4;
            this.position = {
                x: position.x,
       	        y: position.y
            };
            this.velocity = {
                x: velocity.x,
                y: velocity.y
            }
            this.angle = 0;
            this.size = 64;  
            this.radius  = 32;
            this.spritesheet = new Image();
            this.spritesheet.src = 'assets/l'+rInt+'.png';
            this.color = determineColor();
            break;
        case 2:
            this.id = id;
            this.worldWidth = canvas.width;
            this.worldHeight = canvas.height;
            this.mass = 2;
            this.position = {
                x: position.x,
                y: position.y
            };
            this.velocity = {
                x: velocity.x,
                y: velocity.y
            }
            this.angle = 0;
            this.size =32;  
            this.radius  = 16;
            this.spritesheet = new Image();
            this.spritesheet.src = 'assets/m'+findMedAstImg(color)+'.png';
            this.color = color;
            break;
        case 3:
            this.id = id;
            this.worldWidth = canvas.width;
            this.worldHeight = canvas.height;
            this.mass = 1;
            this.position = {
                x: position.x,
                y: position.y
            };
            this.velocity = {
                x: velocity.x,
                y: velocity.y
            }
            this.size = 16;  
            this.angle = 0;
            this.radius  = 8;
            this.spritesheet = new Image();
            this.color = color;
            this.spritesheet.src = 'assets/s'+findSmallAstImg(color)+'.png';
            break;
    }
    this.center = {
        x: position.x+this.radius,
        y: position.y+this.radius
    };

}

/**
 * @getRandomInt
 * calculates the a random whole number between a min and max value
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @findMedAstImg
 * calculates a random image to used based on the color of the large astroid it was created from
 * @param {color} the color of the large astroid
 */
function findMedAstImg(color)
{
    switch (color)
    {
        case 1:
            return getRandomInt(1, 3);
        case 2:
            return getRandomInt(4, 6);
        case 3:
            return getRandomInt(7, 9);
    }
}

/**
 * @findSmallAstImg
 * calculates a random image to used based on the color of the parent astroid it was created from
 * @param {color} the color of the parent astroid
 */
function findSmallAstImg(color)
{
    switch (color)
    {
        case 1:
            return getRandomInt(1, 2);
        case 2:
            return getRandomInt(3, 4);
        case 3:
            return getRandomInt(5, 6);
    }
}

Asteroid.prototype.update = function(time)
{
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if(this.position.x < -this.size) this.position.x += (this.worldWidth + this.size);
    if(this.position.x > this.worldWidth) this.position.x -= (this.worldWidth + this.size);
    if(this.position.y < -this.size) this.position.y += (this.worldHeight + this.size);
    if(this.position.y > this.worldHeight) this.position.y -= (this.worldHeight + this.size);
}

/**
 * @render
 * renders the astroid to the screen
 */
Asteroid.prototype.render = function(ctx)
{
    ctx.drawImage(this.spritesheet, 0, 0, this.size, this.size, this.position.x - this.radius, this.position.y - this.radius, this.size, this.size);
}


function determineColor()
{
    switch(rInt)
    {
        case 1:
        case 2:
        case 3:
        case 4:
            return 1;
        case 5:
        case 6:
        case 7: 
        case 8:
            return 2;
        case 9:
        case 10:
        case 11:
        case 12:
            return 3;
    }
}