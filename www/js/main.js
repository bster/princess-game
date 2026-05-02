// ============================================================
// MAIN — Entry point: canvas setup, fixed timestep game loop
// ============================================================

import { W, H } from './constants';
import { InputManager } from './input';
import { Game } from './game';
import { Renderer } from './renderer';
import { renderDebug, renderVisualDebug } from './debug';

// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

function resize() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = W * s + 'px';
  canvas.style.height = H * s + 'px';
}
resize();
window.addEventListener('resize', resize);

// Polyfill roundRect if needed
if (!ctx.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    const r =
      typeof radii === 'number'
        ? [radii, radii, radii, radii]
        : Array.isArray(radii)
          ? radii.concat([0, 0, 0, 0]).slice(0, 4)
          : [0, 0, 0, 0];
    this.moveTo(x + r[0], y);
    this.lineTo(x + w - r[1], y);
    this.arcTo(x + w, y, x + w, y + r[1], r[1]);
    this.lineTo(x + w, y + h - r[2]);
    this.arcTo(x + w, y + h, x + w - r[2], y + h, r[2]);
    this.lineTo(x + r[3], y + h);
    this.arcTo(x, y + h, x, y + h - r[3], r[3]);
    this.lineTo(x, y + r[0]);
    this.arcTo(x, y, x + r[0], y, r[0]);
    this.closePath();
  };
}

// Init
const input = new InputManager(canvas);
const game = new Game();
const renderer = new Renderer(ctx);

// Debug overlay toggles
let debugMode = false; // text overlay (backtick)
let visualDebugMode = false; // bounding boxes + shadows (tilde)
window.addEventListener('keydown', (e) => {
  if (e.key === '`') debugMode = !debugMode;
  if (e.key === '~') visualDebugMode = !visualDebugMode;
});

// Fixed timestep game loop — eliminates physics jitter
const FIXED_DT = 1000 / 60; // 16.667ms
let accumulator = 0;
let lastTime = 0;

function gameLoop(timestamp) {
  if (lastTime === 0) lastTime = timestamp;
  accumulator += timestamp - lastTime;
  lastTime = timestamp;

  // Cap to prevent spiral of death (e.g., after tab switch)
  if (accumulator > FIXED_DT * 5) accumulator = FIXED_DT * 5;

  // Run physics at fixed 60hz regardless of display refresh rate
  while (accumulator >= FIXED_DT) {
    game.update(input);
    accumulator -= FIXED_DT;
  }

  render();
  requestAnimationFrame(gameLoop);
}

function render() {
  renderer.clear();

  switch (game.state) {
    case 'title':
      renderer.renderTitle(game);
      break;

    case 'leaderboard':
      renderer.renderLeaderboard(game);
      break;

    case 'overworld':
      renderer.renderOverworld(game);
      renderer.renderWorldHud(game);
      break;

    case 'minigame':
      renderer.renderMinigame(game);
      renderer.renderWorldHud(game);
      break;

    case 'gameOver':
      renderer.renderGameOver(game);
      break;

    case 'playing':
    case 'levelComplete':
    case 'victory':
      renderer.renderLevel(game);
      if (game.state === 'levelComplete') {
        renderer.renderLevelComplete(game);
      } else if (game.state === 'victory') {
        renderer.renderVictory(game);
      }
      renderer.renderHUD(game);
      renderer.renderAbilityFanfare(game);
      if (game.state === 'playing' && !game.player.dead) {
        renderer.renderControls();
      }
      break;
  }

  // Debug overlays
  if (game.state === 'playing') {
    if (visualDebugMode) renderVisualDebug(ctx, game);
    if (debugMode) renderDebug(ctx, game);
  }
}

requestAnimationFrame(gameLoop);
