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