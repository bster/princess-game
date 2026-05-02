// ============================================================
// DEBUG — Overlay for tuning (toggle with backtick key)
// ============================================================
//
// Backtick (`) toggles the text overlay.
// Tilde (~, Shift+`) toggles the visual debug overlay
// (shadow bounding boxes, parallax offset markers).

import { PARALLAX_FAR_SPEED, PARALLAX_MID_SPEED } from './constants';

export function renderDebug(ctx, game) {
  const p = game.player;
  if (!p) return;

  const lines = [
    `vx: ${p.vx.toFixed(2)}  vy: ${p.vy.toFixed(2)}`,
    `ground: ${p.onGround}  crouch: ${p.crouching}`,
    `coyote: ${p.coyoteTime}  buffer: ${p.jumpBuffer}`,
    `pos: ${p.x.toFixed(0)}, ${p.y.toFixed(0)}`,
    `scale: ${p.scaleX.toFixed(2)}, ${p.scaleY.toFixed(2)}`,
    `facing: ${p.facing}  dead: ${p.dead}`,
    `hp: ${p.hp}/${p.maxHp}  inv: ${p.invincible}  flash: ${p.flashTimer}`,
    `freeze: ${game.freezeTimer}  slowmo: ${game.slowMoTimer}`,
    `trauma: ${game.camera._trauma.toFixed(3)}`,
    `cam: ${game.camera.x.toFixed(0)}  shake: ${game.camera.shakeX.toFixed(1)},${game.camera.shakeY.toFixed(1)}`,
    `parallax far: ${(game.camera.x * PARALLAX_FAR_SPEED).toFixed(0)}  mid: ${(game.camera.x * PARALLAX_MID_SPEED).toFixed(0)}`,
    `abilities: ${p.abilities.length ? p.abilities.map((a) => a.type + ':' + a.remaining).join(', ') : 'none'}`,
    `enemies: ${game.enemies.filter((e) => e.alive).length}  projs: ${game.projectiles.length}`,
  ];

  ctx.save();
  ctx.font = '11px monospace';
  const lineH = 14;
  const padX = 4,
    padY = 4;
  const boxW = 280;
  const boxH = lines.length * lineH + padY * 2;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, boxW, boxH);

  ctx.fillStyle = '#0f0';
  lines.forEach((l, i) => ctx.fillText(l, padX, padY + lineH + i * lineH));

  ctx.restore();
}

/**
 * Visual debug overlay — draws bounding boxes, shadow zones, parallax markers.
 * Drawn in world space (after ctx.translate for camera).
 */
export function renderVisualDebug(ctx, game) {
  const p = game.player;
  if (!p) return;
  const camX = game.camera.renderX;
  const ld = game.levelData;
  const groundY = ld.groundY;

  ctx.save();
  ctx.translate(0, game.camera.renderY);

  // Player hitbox
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(p.x - p.w / 2 - camX, p.y, p.w, p.h);

  // Player shadow zone (max height range)
  ctx.strokeStyle = 'rgba(0,255,255,0.4)';
  ctx.setLineDash([4, 4]);
  const shadowBottomY = p.y + p.h;
  const shadowGroundY = ld.hasGround ? groundY : 9999;
  if (shadowGroundY < 9999) {
    ctx.strokeRect(p.x - 20 - camX, shadowGroundY - 2, 40, 4);
    // Height line
    ctx.beginPath();
    ctx.moveTo(p.x - camX, shadowBottomY);
    ctx.lineTo(p.x - camX, shadowGroundY);
    ctx.stroke();
    // Height label
    ctx.fillStyle = 'cyan';
    ctx.font = '9px monospace';
    ctx.fillText(
      `h:${(shadowGroundY - shadowBottomY).toFixed(0)}`,
      p.x - camX + 4,
      (shadowBottomY + shadowGroundY) / 2
    );
  }
  ctx.setLineDash([]);

  // Enemy hitboxes
  ctx.strokeStyle = '#f00';
  for (const en of game.enemies) {
    if (!en.alive) continue;
    const ex = en.x - camX;
    ctx.strokeRect(ex - en.w / 2, en.y, en.w, en.h);
  }

  // Platform outlines
  ctx.strokeStyle = 'rgba(255,255,0,0.3)';
  for (const pl of ld.platforms) {
    const px = pl.x - camX;
    ctx.strokeRect(px, pl.y, pl.w, 16);
  }

  // Parallax offset markers (top of screen)
  ctx.fillStyle = 'rgba(255,100,255,0.5)';
  ctx.font = '9px monospace';
  const farOx = (camX * PARALLAX_FAR_SPEED).toFixed(0);
  const midOx = (camX * PARALLAX_MID_SPEED).toFixed(0);
  ctx.fillText(`FAR ox:${farOx}`, 4, 12);
  ctx.fillText(`MID ox:${midOx}`, 4, 22);

  ctx.restore();
}
