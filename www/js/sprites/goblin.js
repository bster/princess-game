// ============================================================
// SPRITE: Goblin — walk cycle, blink, body shading, ear wiggle
// ============================================================

import { C } from '../constants';

const HEAD_HI = '#B17BC9';
const BODY_DARK = '#5C3680';
const TUSK = '#FFF8E1';

export function drawGoblin(ctx, x, y, frame, squished, opts) {
  const facing = opts && typeof opts.facing === 'number' ? opts.facing : 1;
  const moving = !opts || opts.moving !== false;

  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1, 0.3);
  if (facing < 0) ctx.scale(-1, 1);

  const walkT = frame * 0.18;
  const bob = moving ? Math.abs(Math.sin(walkT)) * 2 : Math.sin(frame * 0.06) * 1;
  const swing = moving ? Math.sin(walkT) : 0;

  // Belly (drawn behind for shading)
  ctx.fillStyle = BODY_DARK;
  ctx.beginPath();
  ctx.roundRect(-20, 0 + bob, 40, 32, [0, 0, 12, 12]);
  ctx.fill();
  // Body main
  ctx.fillStyle = C.gobBody;
  ctx.beginPath();
  ctx.roundRect(-20, 0 + bob, 40, 28, [0, 0, 12, 12]);
  ctx.fill();
  // Body highlight strip
  ctx.fillStyle = HEAD_HI;
  ctx.beginPath();
  ctx.roundRect(-18, 2 + bob, 8, 18, [4, 4, 4, 4]);
  ctx.fill();

  // Arms (swing opposite to legs)
  ctx.fillStyle = C.gobBody;
  drawArm(ctx, -18, 8 + bob, -swing * 0.5);
  drawArm(ctx, 18, 8 + bob, swing * 0.5);

  // Head
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.roundRect(-22, -30 + bob, 44, 34, [12, 12, 8, 8]);
  ctx.fill();
  // Head highlight
  ctx.fillStyle = HEAD_HI;
  ctx.beginPath();
  ctx.ellipse(-8, -22 + bob, 6, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  const earTwitch = Math.sin(frame * 0.12) * 0.04;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 14, -28 + bob);
    ctx.rotate(side * earTwitch);
    ctx.fillStyle = C.gobHorn;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -12);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();
    // horn highlight
    ctx.fillStyle = HEAD_HI;
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.lineTo(-3, -8);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Eyes (blink every ~2.5s for 6 frames)
  const blink = frame % 150 > 144;
  if (blink) {
    ctx.strokeStyle = C.gobEyePupil;
    ctx.lineWidth = 1.6;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 10 - 4, -16 + bob);
      ctx.lineTo(side * 10 + 4, -16 + bob);
      ctx.stroke();
    }
  } else {
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(side * 10, -16 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.gobEyePupil;
      ctx.beginPath();
      ctx.arc(side * 10 + 1, -15 + bob, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(side * 10 + 1.8, -15.6 + bob, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Brow (angry)
  ctx.fillStyle = BODY_DARK;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 4, -22 + bob);
    ctx.lineTo(side * 14, -24 + bob);
    ctx.lineTo(side * 14, -21 + bob);
    ctx.closePath();
    ctx.fill();
  }

  // Mouth + tusks
  ctx.strokeStyle = '#2a1a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -6 + bob, 8, 0.1, Math.PI - 0.1);
  ctx.stroke();
  // Tusks
  ctx.fillStyle = TUSK;
  ctx.beginPath();
  ctx.moveTo(-5, -3 + bob);
  ctx.lineTo(-3, 4 + bob);
  ctx.lineTo(-1, -3 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1, -3 + bob);
  ctx.lineTo(3, 4 + bob);
  ctx.lineTo(5, -3 + bob);
  ctx.fill();

  // Feet — alternating step
  ctx.fillStyle = C.gobFeet;
  const footL = moving ? Math.max(0, swing) * 6 : 0;
  const footR = moving ? Math.max(0, -swing) * 6 : 0;
  ctx.beginPath();
  ctx.roundRect(-14, 28 + bob - footL, 14, 8 + footL, [0, 0, 6, 6]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(0, 28 + bob - footR, 14, 8 + footR, [0, 0, 6, 6]);
  ctx.fill();
  // Toe nails
  ctx.fillStyle = TUSK;
  for (const fx of [-12, -6, 2, 8]) {
    ctx.beginPath();
    ctx.moveTo(fx, 36 + bob);
    ctx.lineTo(fx + 1.5, 38 + bob);
    ctx.lineTo(fx + 3, 36 + bob);
    ctx.fill();
  }

  ctx.restore();
}

function drawArm(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = C.gobBody;
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 16, [3, 3, 3, 3]);
  ctx.fill();
  // hand
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.arc(0, 17, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
