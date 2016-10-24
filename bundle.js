(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const Laser = require('./laser.js');
const Vector = require('./vector');
const inv = 2000;
/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var score = 0;
var lives = 3;
var level = 1;
var asteroids = [];
var lasersFired = [];
var curId = 1;
var iTime = 0;
var safe = false;
var numberToPop = 10;
var potentiallyColliding = [];
var collisions = [];
var collided = [];
var gameOver = false;
var lasSound = new Audio('assets/laser.wav'); //
var bounce = new Audio('assets/bounce.wav');
var hit = new Audio('assets/hit.wav');
hit.volume = .5; //
var explosion = new Audio('assets/explosion.wav');
var laser = new Laser({x: 400, y: 300}, canvas, 45);
//populateLevel();
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
  updateAsteroids();
  if(lives <= 0)
  {
    gameOver = true;
  }
  checkLevelUp();
  for(var i = 0; i < asteroids.length; i++)
  {
    asteroidCollisionCheck(asteroids[i]);
    handleCollisions();
    playerHit(asteroids[i]); 
    isShot(asteroids[i]);   
  }
  laser.update();
  if(player.state == "fire")
  {
    lasersFired.push(new Laser(player.position, canvas, player.angle));
    lasSound.play();
    player.state = "idle";
  }
  for(var j =0; j < lasersFired.length; j++)
  {
    lasersFired[j].update();
    if(lasersFired[j].position.x < 0 || lasersFired[j].position.x > canvas.width || lasersFired[j].position.y < 0 || lasersFired[j].position.y > canvas.height)
    {
      removeItem(lasersFired, lasersFired[j]);
    }
  }
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
  if(gameOver)
  {
    ctx.fillStyle = "white";
    ctx.font = "100px Arial";
    ctx.fillText("Game Over", 100, 100);
    ctx.font = "20px Arial";
    ctx.fillText("score: "+score, 30, canvas.height - 30);
  }
  else
  {  
    player.render(elapsedTime, ctx);
    renderText(ctx);
    for(var i = 0; i < asteroids.length; i++)
    {
      asteroids[i].render(ctx);
    }
    for(var j =0; j < lasersFired.length; j++)
    {
      lasersFired[j].render(ctx); 
    }
  }
  
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

function asteroidCollisionCheck(asteroid)
{
  collisions = [];
  findNearby(asteroid);
  for(var i = 0; i <potentiallyColliding.length; i++)
  {
    var cur = potentiallyColliding[i];
    var dist = Math.sqrt(Math.pow((cur.position.x) - (asteroid.position.x), 2) 
      + Math.pow((cur.position.y) - (asteroid.position.y), 2));
    if(dist < asteroid.radius + cur.radius)
    {
      var pair = {a: cur, b: asteroid};
      collisions.push(pair);    
    } 
  } 
}

function findNearby(ast)
{
  potentiallyColliding = [];
  for(var i = 0; i<asteroids.length; i++)
  {
    if(asteroids[i].position.x - ast.position.x < 64 || ast.position.x - asteroids[i].position.x < 64)
    {
      if(asteroids[i].position.y - ast.position.y < 64|| ast.position.y - asteroids[i].position.y < 64)
      {
        if(ast != asteroids[i])
        {
          potentiallyColliding.push(asteroids[i]);
        }
      }
    }
  }
}

function handleCollisions()
{
  for(var i = 0; i<collisions.length; i++)
  {    
    var collisionNormal = {
			x: (collisions[i].a.position.x) - (collisions[i].b.position.x),
			y: (collisions[i].a.position.y) - (collisions[i].b.position.y)
		};
  
    var overlapA = collisions[i].a.radius + collisions[i].b.radius - Vector.magnitude(collisionNormal);    
		collisionNormal = Vector.normalize(collisionNormal);

		collisions[i].a.position.x += collisionNormal.x * overlapA / 2;
		collisions[i].a.position.y += collisionNormal.y * overlapA / 2;
		collisions[i].b.position.x -= collisionNormal.x * overlapA / 2;
		collisions[i].b.position.y -= collisionNormal.y * overlapA / 2;

		var angle = Math.atan2(collisionNormal.y, collisionNormal.x);
		var a = Vector.rotate(collisions[i].a.velocity, angle);
		var b = Vector.rotate(collisions[i].b.velocity, angle);

		var aTemp1 = a.x;
    var bTemp1 = b.x;
    var aTemp2 = a.y;
    var bTemp2 = b.y;

    a.x = (aTemp1 * (collisions[i].a.mass - collisions[i].b.mass) + 2 * collisions[i].a.mass * bTemp1)/(collisions[i].a.mass + collisions[i].b.mass);
    b.x = (bTemp1 * (collisions[i].b.mass - collisions[i].a.mass) + 2 * collisions[i].b.mass * aTemp1)/(collisions[i].a.mass + collisions[i].b.mass);
    a.y = (aTemp2 * (collisions[i].a.mass - collisions[i].b.mass) + 2 * collisions[i].a.mass * bTemp2)/(collisions[i].a.mass + collisions[i].b.mass);
    b.y = (bTemp2 * (collisions[i].b.mass - collisions[i].a.mass) + 2 * collisions[i].b.mass * aTemp2)/(collisions[i].a.mass + collisions[i].b.mass);

		a = Vector.rotate(a, -angle);
		b = Vector.rotate(b, -angle);
		collisions[i].a.velocity.x = a.x;
		collisions[i].a.velocity.y = a.y;
		collisions[i].b.velocity.x = b.x;
		collisions[i].b.velocity.y = b.y;  
    bounce.play();
  }
}

function updateAsteroids()
{
  for(var i = 0; i < asteroids.length; i++)
  {
    asteroids[i].update();
  }
}

function isShot(asteroid)
{
  for (var i = 0; i < lasersFired.length; i++)
  {
    var cur = lasersFired[i];
    var d1 = Math.sqrt( Math.pow(((cur.position.x - 10*(cur.velocity.x))
       - asteroid.position.x), 2) + Math.pow(((cur.position.y + 10*(asteroid.velocity.y))
       - asteroid.position.y), 2));
    var d2 = Math.sqrt( Math.pow(((cur.position.x - asteroid.position.x), 2)) 
      + Math.pow((cur.position.y + asteroid.position.y), 2));
    if (d1 < asteroid.radius+5 || d2 < asteroid.radius+5)
    {
      asteroidShot(asteroid);
      removeItem(lasersFired, cur);
    }
  }
}

function removeItem(array, item)
{
  var index;
  for (var i = 0; i < array.length; i++)
  {
    if (array[i] == item) 
    {
      index = i;
    }
  }
  array.splice(index, 1);
}

function asteroidShot(asteroid)
{
  switch(asteroid.size)
  {
    case 64:
      asteroids.push(new Asteroid ({x: asteroid.position.x + asteroid.velocity.x, y: asteroid.position.y + asteroid.velocity.y}, 2, 
        asteroid.color, canvas, curId++, {x: asteroid.velocity.x, y: asteroid.velocity.y}));
      removeItem(asteroids, asteroid);
      asteroids.push(new Asteroid ({x: asteroid.position.x + asteroid.velocity.x, y: asteroid.position.y}, 3, 
        asteroid.color, canvas, curId++, {x: asteroid.velocity.x, y: asteroid.velocity.y + .25}));
      asteroids.push(new Asteroid ({x: asteroid.position.x, y: asteroid.position.y + asteroid.velocity.y}, 3, 
        asteroid.color, canvas, curId++, {x: asteroid.velocity.x, y: asteroid.velocity.y + -.25}));
      score += 16;
      break;
    case 32:
      asteroids.push(new Asteroid ({x: asteroid.position.x + asteroid.velocity.x, y: asteroid.position.y}, 3, 
        asteroid.color, canvas, curId++, {x: asteroid.velocity.x, y: asteroid.velocity.y + .25}));
      asteroids.push(new Asteroid ({x: asteroid.position.x, y: asteroid.position.y + asteroid.velocity.y}, 3, 
        asteroid.color, canvas, curId++, {x: asteroid.velocity.x, y: asteroid.velocity.y + -.25}));
      score += 32;
      removeItem(asteroids, asteroid);
      break;
    case 16:
      removeItem(asteroids, asteroid);
      score += 64;
      break;   
  }
  explosion.play();
}

function playerHit(asteroid)
{
  var distance = Math.sqrt( Math.pow((player.position.x - asteroid.position.x), 2)
     + Math.pow((player.position.y - asteroid.position.y), 2));
  if (distance < (asteroid.radius + 7) && player.state != "inv")
  {
    lives--;
    hit.play();
    player.state = "inv";
    player.iTimer = inv;
    player.position = {x: canvas.width/2, y: canvas.height/2};
    player.velocity = {x: 0, y: 0};
  }
}

function populateLevel()
{
  score += level * 100;
  var temp; //new Asteroid({x: 70, y: 70}, 1, 0, canvas, 1, {x: 4, y: 2});
  for(var i = 0; i < numberToPop; i++)
  {
    temp = new Asteroid({x: getRandomInt(64, (canvas.width - 64)), y: getRandomInt(64, (canvas.height - 64))}, getRandomInt(1, 3), 
      getRandomInt(1, 3), canvas, curId, {x: getRandomInt(-2, 2), y: getRandomInt(-2, 2)});
    curId++;
    asteroids.push(temp);
  }
  numberToPop++;
  player.position = {x: canvas.width/2, y: canvas.height/2};
  player.velocity = {x: 0, y: 0};
  level++;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkLevelUp()
{
  if(asteroids.length == 0)
  {
    populateLevel();
  }
}
},{"./asteroid.js":2,"./game.js":3,"./laser.js":4,"./player.js":5,"./vector":6}],2:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"./laser.js":4}],6:[function(require,module,exports){
/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(dotProduct(a, a));
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}
},{}]},{},[1]);
