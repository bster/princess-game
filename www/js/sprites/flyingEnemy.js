// ============================================================
// SPRITE: Flying Enemy (bat) — membrane wings, glow eyes, body sway
// ============================================================

import { C } from '../constants';

const WING_DARK = '#4A1F5C';
const WING_MEMBRANE = '#8B3A9F';
const BODY_DARK = '#5B2A75';
const FANG = '#FFF8E1';

export function drawFlyingEnemy(ctx, x, y, frame, squished, opts) {
  const facing = opts && typeof opts.facing === 'number' ? opts.facing : 1;

  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1, 0.3);
  if (facing < 0) ctx.scale(-1, 1);

  // Smooth-pumped flap (sin^3 gives sharper down-beat)
  const flapRaw = Math.sin(frame * 0.3);
  const flap = Math.sign(flapRaw) * Math.pow(Math.abs(flapRaw), 0.75);
  const flapAngle = flap * 0.85;
  const bob = -flap * 4 + Math.sin(frame * 0.06) * 1;
  const sway = Math.sin(frame * 0.09) * 0.05;

  ctx.rotate(sway);

  // Wings (drawn behind body)
  drawWing(ctx, -1, frame, flapAngle);
  drawWing(ctx, 1, frame, -flapAngle);

  // Body with shading
  ctx.fillStyle = BODY_DARK;
  ctx.beginPath();
  ctx.ellipse(0, 1 + bob, 14, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.ellipse(0, -1 + bob, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly fur tuft
  ctx.fillStyle = '#A877C4';
  ctx.beginPath();
  ctx.ellipse(0, 4 + bob, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears (bat-like, jagged)
  ctx.fillStyle = WING_DARK;
  ctx.beginPath();
  ctx.moveTo(-9, -10 + bob);
  ctx.lineTo(-15, -22 + bob);
  ctx.lineTo(-3, -12 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -10 + bob);
  ctx.lineTo(15, -22 + bob);
  ctx.lineTo(3, -12 + bob);
  ctx.closePath();
  ctx.fill();
  // Inner ear
  ctx.fillStyle = '#9F4FBA';
  ctx.beginPath();
  ctx.moveTo(-8, -11 + bob);
  ctx.lineTo(-12, -19 + bob);
  ctx.lineTo(-5, -13 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -11 + bob);
  ctx.lineTo(12, -19 + bob);
  ctx.lineTo(5, -13 + bob);
  ctx.fill();

  // Eyes (glowing red)
  // Outer glow
  ctx.fillStyle = 'rgba(255,68,68,0.35)';
  ctx.beginPath();
  ctx.arc(-5, -2 + bob, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -2 + bob, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // Eye whites (red)
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
  // Glints
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4.4, -1.6 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5.6, -1.6 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Snarl mouth + fangs
  ctx.strokeStyle = '#2a0a1a';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-3, 5 + bob);
  ctx.lineTo(0, 7 + bob);
  ctx.lineTo(3, 5 + bob);
  ctx.stroke();
  ctx.fillStyle = FANG;
  ctx.beginPath();
  ctx.moveTo(-4, 6 + bob);
  ctx.lineTo(-2, 11 + bob);
  ctx.lineTo(0, 6 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 6 + bob);
  ctx.lineTo(2, 11 + bob);
  ctx.lineTo(4, 6 + bob);
  ctx.fill();

  // Little feet hanging
  ctx.fillStyle = WING_DARK;
  ctx.beginPath();
  ctx.arc(-5, 13 + bob, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, 13 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWing(ctx, side, frame, angle) {
  ctx.save();
  ctx.translate(side * 11, -6);
  ctx.rotate(angle * side);
  // Membrane (scalloped) — three bone segments with curved trailing edges
  const sign = side; // 1 right, -1 left
  ctx.fillStyle = WING_MEMBRANE;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // top edge to wing tip
  ctx.quadraticCurveTo(sign * 12, -10, sign * 22, -2);
  // scalloped trailing edge back to body
  ctx.quadraticCurveTo(sign * 18, 4, sign * 14, 2);
  ctx.quadraticCurveTo(sign * 11, 6, sign * 8, 3);
  ctx.quadraticCurveTo(sign * 5, 7, sign * 2, 3);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  // Bone struts
  ctx.strokeStyle = WING_DARK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sign * 22, -2);
  ctx.moveTo(0, 0);
  ctx.lineTo(sign * 14, 2);
  ctx.moveTo(0, 0);
  ctx.lineTo(sign * 8, 3);
  ctx.stroke();
  // Tiny shimmer on top edge during downbeat
  if (Math.sin(frame * 0.3) < -0.3) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sign * 4, -3);
    ctx.quadraticCurveTo(sign * 12, -8, sign * 20, -2);
    ctx.stroke();
  }
  ctx.restore();
}
