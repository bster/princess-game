// ============================================================
// SPRITE: Frank the Pug — diagonal gait, ear flop, expressive
// ============================================================

import { C } from '../constants';

const BODY_DARK = '#B98C58';
const BANDANA = '#FF69B4';
const BANDANA_DOT = '#FFC8E0';

// Idle/run signature: drawFrank(ctx, x, y, frame, happy)
export function drawFrank(ctx, x, y, frame, happy) {
  ctx.save();
  ctx.translate(x, y);

  const wagFreq = happy ? 0.55 : 0.25;
  const wag = Math.sin(frame * wagFreq) * (happy ? 0.5 : 0.3);
  const bob = happy ? Math.sin(frame * 0.18) * 2.5 : Math.sin(frame * 0.07) * 1;

  drawFrankBody(ctx, frame, bob, wag, false, false, happy);
  ctx.restore();
}

// Playable Frank — supports facing, jumping, crouching, squash-stretch, vx
export function drawFrankPlayer(
  ctx,
  x,
  y,
  facing,
  frame,
  jumping,
  crouching,
  scaleX,
  scaleY,
  vx
) {
  scaleX = scaleX || 1;
  scaleY = scaleY || 1;
  vx = vx || 0;
  const speed = Math.min(Math.abs(vx) / 4.5, 1);
  const running = !jumping && speed > 0.12;

  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);
  if (crouching) ctx.scale(1.2, 0.6);
  ctx.scale(scaleX, scaleY);
  ctx.translate(0, -28);

  const wag = Math.sin(frame * (running ? 0.6 : 0.3)) * (running ? 0.6 : 0.3);
  const bob = jumping ? 0 : Math.sin(frame * (running ? 0.4 : 0.12)) * (running ? 1.5 : 1.2);

  drawFrankBody(ctx, frame, bob, wag, jumping, running, true);

  ctx.restore();
}

function drawFrankBody(ctx, frame, bob, wag, jumping, running, hero) {
  // Tail (curled, wagging)
  ctx.save();
  ctx.translate(-22, -8 + bob);
  ctx.rotate(wag);
  ctx.strokeStyle = C.pugBody;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 8, -Math.PI * 0.85, -Math.PI * 0.05);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.restore();

  // Body
  ctx.fillStyle = C.pugBody;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 22, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly highlight
  ctx.fillStyle = '#E6BC8E';
  ctx.beginPath();
  ctx.ellipse(0, 6 + bob, 14, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Back shading
  ctx.fillStyle = BODY_DARK;
  ctx.beginPath();
  ctx.ellipse(0, -5 + bob, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs — diagonal gait when running (front-left + back-right vs front-right + back-left)
  ctx.fillStyle = C.pugLeg;
  if (jumping) {
    // Tucked
    ctx.fillRect(-14, 8 + bob, 9, 9);
    ctx.fillRect(-3, 8 + bob, 9, 9);
    ctx.fillRect(8, 8 + bob, 9, 9);
    ctx.fillRect(17, 8 + bob, 9, 9);
  } else if (running) {
    const t = Math.sin(frame * 0.45);
    const a = Math.max(0, t) * 6;
    const b = Math.max(0, -t) * 6;
    // back-left + front-right pair
    ctx.fillRect(-16, 10 + bob - a, 9, 14 + a);
    ctx.fillRect(8, 10 + bob - a, 9, 14 + a);
    // back-right + front-left pair
    ctx.fillRect(-4, 10 + bob - b, 9, 14 + b);
    ctx.fillRect(16, 10 + bob - b, 9, 14 + b);
  } else {
    const legAnim = Math.sin(frame * 0.2) * 2;
    ctx.fillRect(-16, 10 + bob, 9, 14 + legAnim);
    ctx.fillRect(-4, 10 + bob, 9, 14 - legAnim);
    ctx.fillRect(8, 10 + bob, 9, 14 + legAnim);
    ctx.fillRect(16, 10 + bob, 9, 14 - legAnim);
  }
  // Paw pads
  ctx.fillStyle = '#3a2818';
  for (const px of [-12, 0, 12, 20]) {
    ctx.beginPath();
    ctx.ellipse(px, 23 + bob, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = C.pugBody;
  ctx.beginPath();
  ctx.arc(20, -14 + bob, 16, 0, Math.PI * 2);
  ctx.fill();
  // Forehead wrinkles
  ctx.strokeStyle = BODY_DARK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(14, -22 + bob);
  ctx.quadraticCurveTo(20, -19 + bob, 26, -22 + bob);
  ctx.moveTo(15, -18 + bob);
  ctx.quadraticCurveTo(20, -16 + bob, 25, -18 + bob);
  ctx.stroke();

  // Ears (flop downward when jumping/running)
  const earTilt = jumping ? 0.8 : running ? 0.45 + Math.sin(frame * 0.4) * 0.1 : 0.0;
  drawEar(ctx, 10, -26 + bob, -0.3 - earTilt);
  drawEar(ctx, 30, -26 + bob, 0.3 + earTilt);

  // Muzzle
  ctx.fillStyle = C.pugFace;
  ctx.beginPath();
  ctx.ellipse(22, -8 + bob, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (whites)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(14, -18 + bob, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(26, -18 + bob, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupils — track slightly when running
  const pupilOff = running ? 1.2 : 0.5;
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(14 + pupilOff, -18 + bob, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26 + pupilOff, -18 + bob, 2.6, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(15 + pupilOff, -19 + bob, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(27 + pupilOff, -19 + bob, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(22, -10 + bob, 4, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.ellipse(21, -11 + bob, 1.4, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (always when hero)
  if (hero || frame % 120 < 60) {
    const tonguePulse = 1 + Math.sin(frame * 0.25) * 0.18;
    ctx.fillStyle = C.pugTongue;
    ctx.beginPath();
    ctx.ellipse(22, -3 + bob, 3 * tonguePulse, 4 * tonguePulse, 0, 0, Math.PI);
    ctx.fill();
    // Tongue mid-line
    ctx.strokeStyle = '#d8556a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(22, -3 + bob);
    ctx.lineTo(22, 0 + bob);
    ctx.stroke();
  }

  if (hero) {
    // Hero bandana
    ctx.fillStyle = BANDANA;
    ctx.beginPath();
    ctx.ellipse(20, -24 + bob, 13, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Polka dots
    ctx.fillStyle = BANDANA_DOT;
    for (const dx of [-8, -2, 4, 10]) {
      ctx.beginPath();
      ctx.arc(20 + dx, -24 + bob, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Knot
    ctx.fillStyle = BANDANA;
    ctx.beginPath();
    ctx.moveTo(8, -25 + bob);
    ctx.lineTo(2, -30 + bob);
    ctx.lineTo(6, -22 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -25 + bob);
    ctx.lineTo(1, -20 + bob);
    ctx.lineTo(6, -22 + bob);
    ctx.fill();
  }
}

function drawEar(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = C.pugEar;
  ctx.beginPath();
  ctx.ellipse(0, 6, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,180,180,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
