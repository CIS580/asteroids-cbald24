(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var score = 0;
var lives = 3;
var level = 1;
var astroid1 = new Asteroid({x: 70, y: 70}, 1, 0, canvas);
var astroid2 = new Asteroid({x: 200, y: 200}, 2, 2, canvas);
var astroid3 = new Asteroid({x: 200, y: 70}, 3, 1, canvas);
var astroid4 = new Asteroid({x: 70, y: 200}, 3, 3, canvas);
/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime);
  astroid1.update(elapsedTime);
  astroid2.update(elapsedTime);
  astroid3.update(elapsedTime);
  astroid4.update(elapsedTime);
  // TODO: Update the game objects
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  renderText(ctx);
  astroid1.render(ctx);
  astroid2.render(ctx);
  astroid3.render(ctx);
  astroid4.render(ctx);
}

/**
 * @function renderText
 * Renders the score, lives, and level, text in the top left corner
 * @param ctx: the context to render
 */
function renderText(ctx) {
  ctx.fillStyle = "white";
  ctx.font = "9px Arial";
  ctx.fillText("Score: " +score, 2, 19);
  ctx.fillText("Level: " +level, 2, 9);
  ctx.fillText("Lives: " +lives, 2, 29)
}
},{"./asteroid.js":2,"./game.js":3,"./player.js":4}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Asteroid class
 */
module.exports = exports = Asteroid;

var rInt = getRandomInt(1, 12);

function Asteroid(position, size, color, canvas, velocity)
{
    switch(size)
    {
        case 1:
            this.worldWidth = canvas.width;
            this.worldHeight = canvas.height;
            this.position = {
                x: position.x,
       	        y: position.y
            };
            this.velocity = {
                x: 4,
                y: 0
            }
            this.angle = 0;
            this.size = 64;  
            this.radius  = 64;
            this.spritesheet = new Image();
            this.spritesheet.src = 'assets/l'+rInt+'.png';
            this.color = determineColor();
            break;
        case 2:
            this.worldWidth = canvas.width;
            this.worldHeight = canvas.height;
            this.position = {
                x: position.x,
                y: position.y
            };
            this.velocity = {
            x: 2,
            y: 2
            }
            this.angle = 0;
            this.size =32;  
            this.radius  = 64;
            this.spritesheet = new Image();
            this.spritesheet.src = 'assets/m'+findMedAstImg(color)+'.png';
            break;
        case 3:
            this.worldWidth = canvas.width;
            this.worldHeight = canvas.height;
            this.position = {
                x: position.x,
                y: position.y
            };
            this.velocity = {
                x: 1,
                y: 0
            }
            this.size = 16;  
            this.angle = 0;
            this.radius  = 64;
            this.spritesheet = new Image();
            this.spritesheet.src = 'assets/s'+findSmallAstImg(color)+'.png';
            break;
    }
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
    ctx.drawImage(this.spritesheet, 0, 0, this.size, this.size, this.position.x, this.position.y, this.size, this.size);
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
},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

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
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
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
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
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
    }
  }
}



/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
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
  ctx.strokeStyle = 'white';
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

},{}]},{},[1]);
