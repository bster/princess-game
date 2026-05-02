// ============================================================
// SPRITE: Shooter Enemy (turret goblin)
// ============================================================

import { C } from '../constants.js';

export function drawShooterEnemy(ctx, x, y, frame, facing, squished) {
  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1, 0.3);
  if (facing < 0) ctx.scale(-1, 1);

  const bob = Math.sin(frame * 0.08) * 1;

  // Base/pedestal
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.roundRect(-18, 16 + bob, 36, 14, [0, 0, 8, 8]);
  ctx.fill();

  // Body (armored)
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.roundRect(-16, -8 + bob, 32, 26, [4, 4, 0, 0]);
  ctx.fill();

  // Head
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.roundRect(-14, -28 + bob, 28, 22, [8, 8, 4, 4]);
  ctx.fill();

  // Helmet
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.roundRect(-16, -32 + bob, 32, 10, [6, 6, 0, 0]);
  ctx.fill();
  // Helmet spike
  ctx.beginPath();
  ctx.moveTo(0, -38 + bob);
  ctx.lineTo(-4, -32 + bob);
  ctx.lineTo(4, -32 + bob);
  ctx.fill();

  // Eye slit
  ctx.fillStyle = C.gobEyePupil;
  ctx.fillRect(-10, -22 + bob, 20, 4);
  // Eye dots
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-5, -20 + bob, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -20 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Cannon arm
  ctx.fillStyle = '#555';
  ctx.save();
  ctx.translate(14, 0 + bob);
  ctx.fillRect(0, -4, 16, 8);
  // Cannon tip
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(16, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
