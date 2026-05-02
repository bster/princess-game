// ============================================================
// SPRITE: Tiara (collectible)
// ============================================================

import { C } from '../constants.js';

export function drawTiara(ctx, x, y, frame) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(frame * 0.08) * 4;
  const scale = 0.9 + Math.sin(frame * 0.12) * 0.1;
  ctx.translate(0, bob);
  ctx.scale(scale, scale);

  // Glow
  ctx.fillStyle = 'rgba(255,215,0,0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // Base
  ctx.fillStyle = C.tiara;
  ctx.fillRect(-12, 2, 24, 6);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8 - 4, 2);
    ctx.lineTo(i * 8, -8);
    ctx.lineTo(i * 8 + 4, 2);
    ctx.fill();
  }
  // Gem
  ctx.fillStyle = C.gem;
  ctx.beginPath();
  ctx.arc(0, 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Side gems
  ctx.fillStyle = '#88f';
  ctx.beginPath();
  ctx.arc(-7, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
