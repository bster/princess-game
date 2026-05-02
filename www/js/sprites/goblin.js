// ============================================================
// SPRITE: Goblin
// ============================================================

import { C } from '../constants';

export function drawGoblin(ctx, x, y, frame, squished) {
  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1, 0.3);

  const bob = Math.sin(frame * 0.1) * 2;

  // Body
  ctx.fillStyle = C.gobBody;
  ctx.beginPath();
  ctx.roundRect(-20, 0 + bob, 40, 32, [0, 0, 12, 12]);
  ctx.fill();

  // Head
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.roundRect(-22, -30 + bob, 44, 34, [12, 12, 8, 8]);
  ctx.fill();

  // Horns
  ctx.fillStyle = C.gobHorn;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 14, -28 + bob);
    ctx.lineTo(side * 14 - 5, -40 + bob);
    ctx.lineTo(side * 14 + 5, -28 + bob);
    ctx.fill();
  }

  // Eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(side * 10, -16 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.gobEyePupil;
    ctx.beginPath();
    ctx.arc(side * 10 + 1, -15 + bob, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -6 + bob, 8, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Feet
  ctx.fillStyle = C.gobFeet;
  const footSpread = Math.sin(frame * 0.15) * 3;
  ctx.beginPath();
  ctx.roundRect(-14 - footSpread, 30 + bob, 14, 8, [0, 0, 6, 6]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(footSpread, 30 + bob, 14, 8, [0, 0, 6, 6]);
  ctx.fill();

  ctx.restore();
}
