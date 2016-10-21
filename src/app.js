"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const Laser = require('./laser.js');
const Vector = require('./vector');
/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var score = 0;
var lives = 3;
var level = 1;
var asteroids = [];
var lasersFired = [];
var curId = 4;
var asteroid = new Asteroid({x: 600, y: 400}, 1, 1, canvas, 3, {x: -2, y: 1});//new Asteroid({x: 70, y: 70}, 1, 0, canvas, 1, {x: 4, y: 2});
asteroids.push(asteroid);
asteroid = new Asteroid({x: 300, y: 200}, 2, 2, canvas, 2, {x: 3, y: 2});
asteroids.push(asteroid);
var asteroid = new Asteroid({x: 200, y: 140}, 3, 1, canvas, 3, {x: 0, y: 3});
asteroids.push(asteroid);
asteroid = new Asteroid({x: 200, y: 400}, 1, 2, canvas, 4, {x: 0, y: -2});
asteroids.push(asteroid);
var potentiallyColliding = [];
var collisions = [];
var collided = [];
var laser = new Laser({x: 400, y: 300}, canvas, 45);
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
  for(var i = 0; i < asteroids.length; i++)
  {
    asteroidCollisionCheck(asteroids[i]);
    isShot(asteroids[i]);
    handleCollisions();
  }
  laser.update();
  if(player.firedLaser)
  {
    lasersFired.push(new Laser(player.position, canvas, player.angle));
  }
  for(var j =0; j < lasersFired.length; j++)
  {
    lasersFired[j].update();
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
  
    var overlapA = collisions[i].a.radius + collisions[i].b.radius + 2 - Vector.magnitude(collisionNormal);    
		collisionNormal = Vector.normalize(collisionNormal);

		collisions[i].a.position.x += collisionNormal.x * overlapA / 2;
		collisions[i].a.position.y += collisionNormal.y * overlapA / 2;
		collisions[i].b.position.x -= collisionNormal.x * overlapA / 2;
		collisions[i].b.position.y -= collisionNormal.y * overlapA / 2;

		var angle = Math.atan2(collisionNormal.y, collisionNormal.x);
		var a = Vector.rotate(collisions[i].a.velocity, angle);
		var b = Vector.rotate(collisions[i].b.velocity, angle);

		var s = a.x;
		a.x = b.x;
		b.x = s;
		a = Vector.rotate(a, -angle);
		b = Vector.rotate(b, -angle);
		collisions[i].a.velocity.x = a.x;
		collisions[i].a.velocity.y = a.y;
		collisions[i].b.velocity.x = b.x;
		collisions[i].b.velocity.y = b.y;   
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
      score++;
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
  var temp = array[0];
  array[0] = array[index];
  array[index] = temp;
  array.shift();
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
      break;
  }
}

function playerHit(asteroid)
{
  var distance = Math.sqrt( Math.pow((player.position.x - asteroid.position.x), 2)
     + Math.pow((player.position.y - asteroid.position.y), 2));
  if (distance2 < (asteroid.radius + 7))
  {
    lives--;
  }
}