"use strict";

const laserCD = 1000;
const Laser = require('./laser.js');
const iTime = 2000;
var lcd = false;
/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "inv";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.iTimer = 2000;
  this.radius  = 64;
  this.laserTimer = 0;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.firedLaser = false;
  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'f':
        if(!lcd) 
        {
          self.state = "fire";
          lcd = true;
          self.laserTimer = laserCD;
          self.iTimer = 0;
        }       
        break;
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case 't':
        self.position = {x: getRandomInt(10, self.worldWidth), y: getRandomInt(10, self.worldHeight)};
        self.velocity = { x: 0, y: 0};
        self.iTimer = iTime;
        self.state = "inv";
        break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'f':
        self.firedLaser = false;
        break;
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
      case 't':
        break;
    }
  }
}



/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  if(this.state == "inv")
  {
    this.iTimer -= time;
    if (this.iTimer <= 0)
    {
      this.state = "idle";
    }
  }
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.005;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    }
    this.velocity.x -= acceleration.x/3.5;
  	if(this.velocity.x <= -5.5)
	  {
	  	this.velocity.x = -5.5;
  	}
	  else if(this.velocity.x >= 5.5)
  	{
	  	this.velocity.x = 5.5;
	  }
    this.velocity.y -= acceleration.y/3.5;
	  if(this.velocity.y <= -5.5)
	  {
	    this.velocity.y = -5.5;
	  }
	  else if(this.velocity.y >= 5.5)
	  {
	  	this.velocity.y = 5.5;
    }  
  }
  if(lcd)
  {
    this.laserTimer -= time;
    if(this.laserTimer <= 0)
    {
      lcd = false;
    }
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
  
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();
  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  if(this.state == "inv")
  {
    ctx.strokeStyle = 'red';
  }
  else{
    ctx.strokeStyle = 'white';
  }
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}