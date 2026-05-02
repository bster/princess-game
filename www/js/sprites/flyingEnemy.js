// ============================================================
// SPRITE: Flying Enemy (bat-goblin)
// ============================================================

import { C } from '../constants';

export function drawFlyingEnemy(ctx, x, y, frame, squished) {
  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1, 0.3);

  const wingFlap = Math.sin(frame * 0.3) * 0.6;
  const bob = Math.sin(frame * 0.15) * 2;

  // Wings
  ctx.fillStyle = '#8B3A9F';
  ctx.save();
  ctx.translate(-14, -8 + bob);
  ctx.rotate(-wingFlap);
  ctx.beginPath();
  ctx.ellipse(-12, 0, 18, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(14, -8 + bob);
  ctx.rotate(wingFlap);
  ctx.beginPath();
  ctx.ellipse(12, 0, 18, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears (bat-like)
  ctx.fillStyle = '#7B4BA0';
  ctx.beginPath();
  ctx.moveTo(-10, -10 + bob);
  ctx.lineTo(-16, -22 + bob);
  ctx.lineTo(-4, -12 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -10 + bob);
  ctx.lineTo(16, -22 + bob);
  ctx.lineTo(4, -12 + bob);
  ctx.fill();

  // Eyes (angry/red)
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.ellipse(-5, -2 + bob, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, -2 + bob, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  ctx.fillStyle = '#220000';
  ctx.beginPath();
  ctx.arc(-5, -1 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -1 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Fangs
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-4, 6 + bob);
  ctx.lineTo(-2, 12 + bob);
  ctx.lineTo(0, 6 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 6 + bob);
  ctx.lineTo(2, 12 + bob);
  ctx.lineTo(4, 6 + bob);
  ctx.fill();

  ctx.restore();
}
