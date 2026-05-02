// ============================================================
// SPRITE: Princess — Enhanced with squash-stretch
// ============================================================

import { C } from '../constants';

export function drawPrincess(ctx, x, y, facing, frame, jumping, crouching, scaleX, scaleY) {
  scaleX = scaleX || 1;
  scaleY = scaleY || 1;

  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);
  if (crouching) ctx.scale(1, 0.6);
  // Squash-stretch
  ctx.scale(scaleX, scaleY);
  ctx.translate(0, -56);

  const bob = jumping ? 0 : Math.sin(frame * 0.15) * 2;
  const legAnim = jumping ? 0 : Math.sin(frame * 0.3) * 8;

  // Hair sides
  ctx.fillStyle = C.hair;
  ctx.fillRect(-20, -28 + bob, 6, 28);
  ctx.fillRect(14, -28 + bob, 6, 28);

  // Dress
  ctx.fillStyle = C.dress;
  ctx.beginPath();
  ctx.moveTo(-16, 4 + bob);
  ctx.lineTo(16, 4 + bob);
  ctx.lineTo(22, 34 + bob);
  ctx.lineTo(-22, 34 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.dressLight;
  ctx.beginPath();
  ctx.ellipse(0, 34 + bob, 22, 6, 0, 0, Math.PI);
  ctx.fill();

  // Legs
  ctx.fillStyle = C.skin;
  ctx.save();
  ctx.translate(-7, 34 + bob);
  ctx.rotate(jumping ? -0.2 : legAnim * 0.015);
  ctx.fillRect(-5, 0, 10, 16);
  ctx.fillStyle = C.shoe;
  ctx.fillRect(-5, 14, 14, 6);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = C.skin;
  ctx.translate(7, 34 + bob);
  ctx.rotate(jumping ? 0.2 : -legAnim * 0.015);
  ctx.fillRect(-5, 0, 10, 16);
  ctx.fillStyle = C.shoe;
  ctx.fillRect(-5, 14, 14, 6);
  ctx.restore();

  // Arms
  const armSwing = jumping ? 0.7 : Math.sin(frame * 0.3) * 0.4;
  ctx.fillStyle = C.skin;
  ctx.save();
  ctx.translate(-16, 6 + bob);
  ctx.rotate(-0.3 - armSwing);
  ctx.fillRect(-4, 0, 8, 22);
  ctx.restore();
  ctx.save();
  ctx.translate(16, 6 + bob);
  ctx.rotate(0.3 + armSwing);
  ctx.fillRect(-4, 0, 8, 22);
  ctx.restore();

  // Head
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(0, -18 + bob, 18, 0, Math.PI * 2);
  ctx.fill();

  // Hair top
  ctx.fillStyle = C.hair;
  ctx.beginPath();
  ctx.ellipse(0, -28 + bob, 22, 14, 0, Math.PI, 0);
  ctx.fill();

  // Crown
  const crownY = -42 + bob;
  ctx.fillStyle = C.crown;
  ctx.fillRect(-15, crownY + 8, 30, 10);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 10 - 5, crownY + 8);
    ctx.lineTo(i * 10, crownY);
    ctx.lineTo(i * 10 + 5, crownY + 8);
    ctx.fill();
  }
  ctx.fillStyle = C.gem;
  ctx.beginPath();
  ctx.arc(0, crownY + 11, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = C.eyes;
  ctx.beginPath();
  ctx.ellipse(-7, -20 + bob, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7, -20 + bob, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-5.5, -21 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8.5, -21 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Blush
  ctx.fillStyle = C.blush;
  ctx.beginPath();
  ctx.ellipse(-12, -14 + bob, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, -14 + bob, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.fillStyle = C.mouth;
  ctx.beginPath();
  ctx.arc(0, -10 + bob, 4, 0, Math.PI);
  ctx.fill();

  ctx.restore();
}
