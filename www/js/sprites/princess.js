// ============================================================
// SPRITE: Princess — run cycle, dress shading, hands, hair flow
// ============================================================

import { C } from '../constants';

const RUN_FREQ = 0.42;
const IDLE_FREQ = 0.06;
const HAIR_BACK = '#E8841A';
const DRESS_DARK = '#D14F90';
const SASH = '#E8B33B';
const SHOE_HI = '#FFB3D9';
const CHIN_SHADOW = 'rgba(214,140,110,0.25)';
const BROW = '#7a3a14';

export function drawPrincess(
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
  if (crouching) ctx.scale(1.05, 0.65);
  ctx.scale(scaleX, scaleY);
  ctx.translate(0, -56);

  const runT = frame * (RUN_FREQ + speed * 0.1);
  const idleT = frame * IDLE_FREQ;
  const breathe = jumping || running ? 0 : Math.sin(idleT) * 1.4;
  const bob = breathe;
  const runSwing = running ? Math.sin(runT) : 0;

  // Hair back layer (flows back when running)
  const hairFlow = running ? Math.min(speed * 7, 7) : 0;
  ctx.fillStyle = HAIR_BACK;
  ctx.beginPath();
  ctx.ellipse(-3 - hairFlow, -16 + bob, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair tail tip
  if (running) {
    ctx.beginPath();
    ctx.moveTo(-12 - hairFlow, -10 + bob);
    ctx.quadraticCurveTo(-26 - hairFlow, 0, -18 - hairFlow * 0.6, 8 + bob);
    ctx.quadraticCurveTo(-12, 4, -12 - hairFlow, -10 + bob);
    ctx.fill();
  }

  // Back arm (drawn behind body)
  const armBack = jumping ? -1.3 : -runSwing * 0.85 - 0.2;
  drawArm(ctx, -16, 6 + bob, armBack, true);

  // Dress
  const dressBob = jumping ? -2 : bob;
  ctx.fillStyle = C.dress;
  ctx.beginPath();
  ctx.moveTo(-15, 4 + dressBob);
  ctx.lineTo(15, 4 + dressBob);
  ctx.lineTo(24, 36 + dressBob);
  ctx.lineTo(-24, 36 + dressBob);
  ctx.closePath();
  ctx.fill();
  // Right-side shading
  ctx.fillStyle = DRESS_DARK;
  ctx.beginPath();
  ctx.moveTo(4, 4 + dressBob);
  ctx.lineTo(15, 4 + dressBob);
  ctx.lineTo(24, 36 + dressBob);
  ctx.lineTo(8, 36 + dressBob);
  ctx.closePath();
  ctx.fill();
  // Hem highlight
  ctx.fillStyle = C.dressLight;
  ctx.fillRect(-23, 33 + dressBob, 46, 3);
  // Sash
  ctx.fillStyle = SASH;
  ctx.fillRect(-15, 4 + dressBob, 30, 4);
  // Sash bow
  ctx.fillStyle = '#C99319';
  ctx.beginPath();
  ctx.arc(0, 6 + dressBob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const legL = jumping ? -0.55 : runSwing * 0.55;
  const legR = jumping ? 0.55 : -runSwing * 0.55;
  drawLeg(ctx, -7, 36 + dressBob, legL);
  drawLeg(ctx, 7, 36 + dressBob, legR);

  // Front arm
  const armFront = jumping ? -0.9 : runSwing * 0.85 + 0.2;
  drawArm(ctx, 16, 6 + bob, armFront, false);

  // Head
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(0, -18 + bob, 17, 0, Math.PI * 2);
  ctx.fill();
  // Chin shadow
  ctx.fillStyle = CHIN_SHADOW;
  ctx.beginPath();
  ctx.ellipse(0, -8 + bob, 13, 3.5, 0, 0, Math.PI);
  ctx.fill();

  // Hair front
  ctx.fillStyle = C.hair;
  ctx.beginPath();
  ctx.ellipse(0, -28 + bob, 20, 12, 0, Math.PI, 0);
  ctx.fill();
  // Side bang strands
  ctx.beginPath();
  ctx.moveTo(-15, -22 + bob);
  ctx.quadraticCurveTo(-12, -10 + bob, -7, -16 + bob);
  ctx.quadraticCurveTo(-10, -20 + bob, -15, -22 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, -22 + bob);
  ctx.quadraticCurveTo(12, -10 + bob, 7, -16 + bob);
  ctx.quadraticCurveTo(10, -20 + bob, 15, -22 + bob);
  ctx.fill();

  // Crown
  drawCrown(ctx, 0, -42 + bob);

  // Face
  drawFace(ctx, bob, jumping, frame);

  ctx.restore();
}

function drawLeg(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = C.skin;
  ctx.fillRect(-4, 0, 8, 14);
  // Shoe
  ctx.fillStyle = C.shoe;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(-6, 12, 14, 7, [3, 6, 3, 1]);
    ctx.fill();
  } else {
    ctx.fillRect(-6, 12, 14, 7);
  }
  ctx.fillStyle = SHOE_HI;
  ctx.fillRect(-4, 13, 10, 1.5);
  ctx.restore();
}

function drawArm(ctx, x, y, rot, back) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // Puffed sleeve (slightly darker if back arm)
  ctx.fillStyle = back ? DRESS_DARK : C.dressLight;
  ctx.beginPath();
  ctx.ellipse(0, 4, 6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = C.skin;
  ctx.fillRect(-3, 8, 6, 14);
  // Hand
  ctx.beginPath();
  ctx.arc(0, 23, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCrown(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#C28F0E';
  ctx.fillRect(-15, 8, 30, 10);
  ctx.fillStyle = C.crown;
  ctx.fillRect(-15, 8, 30, 6);
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = C.crown;
    ctx.beginPath();
    ctx.moveTo(i * 10 - 5, 8);
    ctx.lineTo(i * 10, -2);
    ctx.lineTo(i * 10 + 5, 8);
    ctx.closePath();
    ctx.fill();
    // tip jewel
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(i * 10, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = C.gem;
  ctx.beginPath();
  ctx.arc(0, 11, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-1, 10, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFace(ctx, bob, jumping, frame) {
  // Blink every ~3 sec for ~6 frames
  const blink = frame % 180 > 174;
  // Eyes
  if (blink) {
    ctx.strokeStyle = C.eyes;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -20 + bob);
    ctx.lineTo(-4, -20 + bob);
    ctx.moveTo(4, -20 + bob);
    ctx.lineTo(10, -20 + bob);
    ctx.stroke();
  } else {
    ctx.fillStyle = C.eyes;
    ctx.beginPath();
    ctx.ellipse(-7, -20 + bob, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7, -20 + bob, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-6, -21 + bob, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -21 + bob, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Brows
  ctx.strokeStyle = BROW;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (jumping) {
    ctx.moveTo(-10, -26 + bob);
    ctx.lineTo(-4, -27 + bob);
    ctx.moveTo(4, -27 + bob);
    ctx.lineTo(10, -26 + bob);
  } else {
    ctx.moveTo(-10, -25 + bob);
    ctx.lineTo(-4, -25 + bob);
    ctx.moveTo(4, -25 + bob);
    ctx.lineTo(10, -25 + bob);
  }
  ctx.stroke();
  // Blush
  ctx.fillStyle = C.blush;
  ctx.beginPath();
  ctx.ellipse(-11, -14 + bob, 4.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(11, -14 + bob, 4.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.fillStyle = C.mouth;
  if (jumping) {
    ctx.beginPath();
    ctx.ellipse(0, -10 + bob, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -11 + bob, 4, 0, Math.PI);
    ctx.fill();
  }
}
