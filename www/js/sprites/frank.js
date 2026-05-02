// ============================================================
// SPRITE: Frank the Pug
// ============================================================

import { C } from '../constants';

export function drawFrank(ctx, x, y, frame, happy) {
  ctx.save();
  ctx.translate(x, y);

  const wag = Math.sin(frame * 0.3) * 0.3;
  const bob = happy ? Math.sin(frame * 0.15) * 3 : 0;

  // Tail
  ctx.save();
  ctx.translate(-22, -8 + bob);
  ctx.rotate(wag);
  ctx.strokeStyle = C.pugBody;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 8, -Math.PI * 0.8, -Math.PI * 0.1);
  ctx.stroke();
  ctx.restore();

  // Body
  ctx.fillStyle = C.pugBody;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 22, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = C.pugLeg;
  const legAnim = Math.sin(frame * 0.2) * 3;
  ctx.fillRect(-16, 10 + bob, 10, 14 + legAnim);
  ctx.fillRect(-4, 10 + bob, 10, 14 - legAnim);
  ctx.fillRect(8, 10 + bob, 10, 14 + legAnim);
  ctx.fillRect(16, 10 + bob, 10, 14 - legAnim);

  // Head
  ctx.fillStyle = C.pugBody;
  ctx.beginPath();
  ctx.arc(20, -14 + bob, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = C.pugEar;
  ctx.beginPath();
  ctx.ellipse(10, -26 + bob, 6, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(30, -26 + bob, 6, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = C.pugFace;
  ctx.beginPath();
  ctx.ellipse(22, -8 + bob, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = C.pugFace;
  ctx.beginPath();
  ctx.ellipse(14, -18 + bob, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(26, -18 + bob, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(15.5, -19 + bob, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(27.5, -19 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(22, -10 + bob, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue
  if (happy || frame % 120 < 60) {
    ctx.fillStyle = C.pugTongue;
    ctx.beginPath();
    ctx.ellipse(22, -3 + bob, 3, 4, 0, 0, Math.PI);
    ctx.fill();
  }

  ctx.restore();
}

// Playable Frank — supports facing, jumping, crouching, squash-stretch
export function drawFrankPlayer(ctx, x, y, facing, frame, jumping, crouching, scaleX, scaleY) {
  scaleX = scaleX || 1;
  scaleY = scaleY || 1;

  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);
  if (crouching) ctx.scale(1.2, 0.6);
  ctx.scale(scaleX, scaleY);
  // Offset up so sprite draws above feet
  ctx.translate(0, -28);

  const bob = jumping ? 0 : Math.sin(frame * 0.15) * 1.5;
  const wag = Math.sin(frame * 0.3) * 0.4;

  // Tail
  ctx.save();
  ctx.translate(-22, -8 + bob);
  ctx.rotate(wag);
  ctx.strokeStyle = C.pugBody;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 8, -Math.PI * 0.8, -Math.PI * 0.1);
  ctx.stroke();
  ctx.restore();

  // Body
  ctx.fillStyle = C.pugBody;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 22, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = C.pugLeg;
  const legAnim = jumping ? 0 : Math.sin(frame * 0.3) * 4;
  if (jumping) {
    // Legs tucked
    ctx.fillRect(-14, 8 + bob, 10, 10);
    ctx.fillRect(-2, 8 + bob, 10, 10);
    ctx.fillRect(8, 8 + bob, 10, 10);
    ctx.fillRect(16, 8 + bob, 10, 10);
  } else {
    ctx.fillRect(-16, 10 + bob, 10, 14 + legAnim);
    ctx.fillRect(-4, 10 + bob, 10, 14 - legAnim);
    ctx.fillRect(8, 10 + bob, 10, 14 + legAnim);
    ctx.fillRect(16, 10 + bob, 10, 14 - legAnim);
  }

  // Head
  ctx.fillStyle = C.pugBody;
  ctx.beginPath();
  ctx.arc(20, -14 + bob, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = C.pugEar;
  ctx.beginPath();
  ctx.ellipse(10, -26 + bob, 6, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(30, -26 + bob, 6, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Face (dark muzzle)
  ctx.fillStyle = C.pugFace;
  ctx.beginPath();
  ctx.ellipse(22, -8 + bob, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = C.pugFace;
  ctx.beginPath();
  ctx.ellipse(14, -18 + bob, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(26, -18 + bob, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(15.5, -19 + bob, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(27.5, -19 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(22, -10 + bob, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (always out when playing — he's excited!)
  ctx.fillStyle = C.pugTongue;
  ctx.beginPath();
  ctx.ellipse(22, -3 + bob, 3, 4, 0, 0, Math.PI);
  ctx.fill();

  // Hero bandana
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(20, -24 + bob, 12, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Bandana knot
  ctx.beginPath();
  ctx.moveTo(8, -25 + bob);
  ctx.lineTo(3, -30 + bob);
  ctx.lineTo(6, -22 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -25 + bob);
  ctx.lineTo(2, -20 + bob);
  ctx.lineTo(6, -22 + bob);
  ctx.fill();

  ctx.restore();
}
