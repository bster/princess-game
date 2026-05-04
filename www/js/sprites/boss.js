// ============================================================
// SPRITE: Boss — Goblin King with stateful animation + glow
// ============================================================

import { C } from '../constants';

const ARMOR_BASE = '#5C3A6E';
const ARMOR_RAGE = '#8B2252';
const ARMOR_PLATE = '#777';
const ARMOR_PLATE_HI = '#999';
const ARMOR_RIVET = '#3A2A48';
const HORN = '#3D254F';
const HORN_HI = '#9A7AB4';
const FANG = '#FFF8E1';
const HAMMER_HEAD = '#5A5A60';
const HAMMER_HEAD_HI = '#9090A0';
const HAMMER_HANDLE = '#7A4A20';
const HAMMER_HANDLE_HI = '#A8753D';

// opts: { state, stateTimer }
export function drawBoss(ctx, x, y, frame, phase, hp, maxHp, dazed, facing, opts) {
  const state = opts && opts.state;
  const stateTimer = opts && typeof opts.stateTimer === 'number' ? opts.stateTimer : 0;

  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);

  const enraged = phase >= 3;
  const charging = state === 'charge';
  const slamming = state === 'slam';
  const summoning = state === 'summon';

  const stomp = charging ? Math.abs(Math.sin(frame * 0.45)) * 4 : 0;
  const bob = dazed ? 0 : Math.sin(frame * 0.08) * 3 - stomp;
  const flashAlpha = frame % 6 < 3 && dazed ? 0.5 : 0;
  const aura = enraged ? 0.5 + Math.sin(frame * 0.18) * 0.2 : 0;

  // Aura glow when enraged
  if (aura > 0) {
    ctx.fillStyle = `rgba(255,80,80,${aura * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(0, -10 + bob, 70, 80, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body (armored)
  ctx.fillStyle = enraged ? ARMOR_RAGE : ARMOR_BASE;
  ctx.beginPath();
  ctx.roundRect(-36, 0 + bob, 72, 58, [0, 0, 16, 16]);
  ctx.fill();

  // Armor plates (only in non-rage form)
  if (!enraged) {
    ctx.fillStyle = ARMOR_PLATE;
    ctx.fillRect(-30, 6 + bob, 60, 8);
    ctx.fillRect(-30, 20 + bob, 60, 8);
    ctx.fillStyle = ARMOR_PLATE_HI;
    ctx.fillRect(-28, 7 + bob, 56, 2);
    ctx.fillRect(-28, 21 + bob, 56, 2);
    // Rivets
    ctx.fillStyle = ARMOR_RIVET;
    for (const rx of [-24, -12, 0, 12, 24]) {
      ctx.beginPath();
      ctx.arc(rx, 10 + bob, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rx, 24 + bob, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Rage tribal markings
    ctx.fillStyle = '#5A0F2F';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 12 - 4, 8 + bob);
      ctx.lineTo(i * 12, 18 + bob);
      ctx.lineTo(i * 12 + 4, 8 + bob);
      ctx.fill();
    }
  }

  // Shoulder pauldrons (with spikes)
  for (const side of [-1, 1]) {
    ctx.fillStyle = ARMOR_PLATE;
    ctx.beginPath();
    ctx.ellipse(side * 36, 4 + bob, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ARMOR_PLATE_HI;
    ctx.beginPath();
    ctx.ellipse(side * 34, 1 + bob, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pauldron spike
    ctx.fillStyle = HORN;
    ctx.beginPath();
    ctx.moveTo(side * 36, -3 + bob);
    ctx.lineTo(side * 32, -16 + bob);
    ctx.lineTo(side * 40, -16 + bob);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.roundRect(-40, -56 + bob, 80, 60, [16, 16, 10, 10]);
  ctx.fill();
  // Head shadow under helmet
  ctx.fillStyle = '#7B4BA0';
  ctx.fillRect(-38, -16 + bob, 76, 6);

  // Spiked crown
  ctx.fillStyle = '#C7A20A';
  ctx.fillRect(-36, -64 + bob, 72, 14);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(-36, -64 + bob, 72, 8);
  const spikes = 5;
  for (let i = 0; i < spikes; i++) {
    const sx = -28 + i * 14;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(sx, -64 + bob);
    ctx.lineTo(sx + 7, -82 + bob);
    ctx.lineTo(sx + 14, -64 + bob);
    ctx.fill();
    // Spike highlight
    ctx.fillStyle = '#FFF2A8';
    ctx.beginPath();
    ctx.moveTo(sx + 6, -65 + bob);
    ctx.lineTo(sx + 7, -78 + bob);
    ctx.lineTo(sx + 8, -65 + bob);
    ctx.fill();
  }
  // Crown gems
  for (let i = 0; i < spikes; i++) {
    ctx.fillStyle = enraged ? '#FF0000' : '#FF4466';
    ctx.beginPath();
    ctx.arc(-21 + i * 14, -57 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-22 + i * 14, -58 + bob, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horns (curved)
  for (const side of [-1, 1]) {
    ctx.fillStyle = HORN;
    ctx.beginPath();
    ctx.moveTo(side * 30, -50 + bob);
    ctx.quadraticCurveTo(side * 38, -68 + bob, side * 32, -78 + bob);
    ctx.quadraticCurveTo(side * 28, -64 + bob, side * 22, -50 + bob);
    ctx.fill();
    // Horn ridge highlight
    ctx.fillStyle = HORN_HI;
    ctx.beginPath();
    ctx.moveTo(side * 26, -52 + bob);
    ctx.quadraticCurveTo(side * 32, -64 + bob, side * 30, -74 + bob);
    ctx.lineTo(side * 28, -68 + bob);
    ctx.quadraticCurveTo(side * 26, -60 + bob, side * 24, -52 + bob);
    ctx.fill();
  }

  // Eyes (glowing — bigger glow when enraged or charging)
  const eyeGlow = enraged ? 1 : charging ? 0.7 : summoning ? 0.5 : 0.2;
  for (const side of [-1, 1]) {
    // Outer halo
    ctx.fillStyle = `rgba(255,${enraged ? 0 : 80},${enraged ? 0 : 0},${eyeGlow * 0.4})`;
    ctx.beginPath();
    ctx.arc(side * 16, -32 + bob, 14, 0, Math.PI * 2);
    ctx.fill();
    // Eye white socket
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(side * 16, -32 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    // Pupil — glowing
    ctx.fillStyle = enraged ? '#FF0000' : C.gobEyePupil;
    ctx.beginPath();
    ctx.arc(side * 16 + 2, -30 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    // Inner pupil
    ctx.fillStyle = enraged ? '#FFFF00' : '#fff';
    ctx.beginPath();
    ctx.arc(side * 16 + 3, -31 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Brow (angry V)
  ctx.fillStyle = HORN;
  ctx.beginPath();
  ctx.moveTo(-26, -42 + bob);
  ctx.lineTo(-6, -36 + bob);
  ctx.lineTo(-26, -38 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(26, -42 + bob);
  ctx.lineTo(6, -36 + bob);
  ctx.lineTo(26, -38 + bob);
  ctx.fill();

  // Snarling mouth + fangs
  ctx.strokeStyle = '#2a1a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -14 + bob, 14, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.fillStyle = '#1a0a25';
  ctx.beginPath();
  ctx.ellipse(0, -10 + bob, 12, 4, 0, 0, Math.PI);
  ctx.fill();
  // Fangs (4)
  ctx.fillStyle = FANG;
  for (const fx of [-10, -4, 4, 10]) {
    ctx.beginPath();
    ctx.moveTo(fx - 1, -14 + bob);
    ctx.lineTo(fx, -4 + bob);
    ctx.lineTo(fx + 1, -14 + bob);
    ctx.fill();
  }

  // Feet
  ctx.fillStyle = C.gobFeet;
  const footSpread = charging
    ? Math.abs(Math.sin(frame * 0.45)) * 6
    : Math.sin(frame * 0.12) * 3;
  ctx.beginPath();
  ctx.roundRect(-26 - footSpread, 56 + bob, 26, 14, [0, 0, 8, 8]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(footSpread, 56 + bob, 26, 14, [0, 0, 8, 8]);
  ctx.fill();
  // Toe nails
  ctx.fillStyle = FANG;
  for (const tx of [-22, -16, -10, 4, 10, 16]) {
    ctx.beginPath();
    ctx.moveTo(tx + (tx < 0 ? -footSpread : footSpread), 70 + bob);
    ctx.lineTo(tx + 1.5 + (tx < 0 ? -footSpread : footSpread), 73 + bob);
    ctx.lineTo(tx + 3 + (tx < 0 ? -footSpread : footSpread), 70 + bob);
    ctx.fill();
  }

  // War hammer
  if (!enraged) {
    drawHammer(ctx, frame, bob, dazed, slamming, stateTimer);
  } else {
    // In rage form, fists clenched (phase 3)
    drawFist(ctx, 38, 14 + bob, 0.2);
    drawFist(ctx, -38, 14 + bob, -0.2);
  }

  // Summoning portal under boss (if summoning state)
  if (summoning) {
    ctx.save();
    ctx.translate(0, 70 + bob);
    const portalAlpha = Math.min(1, (40 - stateTimer) / 20);
    ctx.fillStyle = `rgba(180,40,200,${portalAlpha * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sparkles
    for (let i = 0; i < 5; i++) {
      const a = frame * 0.2 + (i * Math.PI * 2) / 5;
      ctx.fillStyle = '#FF80FF';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 30, Math.sin(a * 2) * 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Dazed stars
  if (dazed) {
    for (let i = 0; i < 4; i++) {
      const a = frame * 0.1 + (i * Math.PI * 2) / 4;
      const sx = Math.cos(a) * 32;
      const sy = -76 + Math.sin(a * 2) * 5;
      ctx.fillStyle = '#FFD700';
      drawStarShape(ctx, sx, sy, 5);
    }
  }

  // Phase 3 sparks/embers
  if (enraged && frame % 4 === 0) {
    for (let i = 0; i < 3; i++) {
      const ex = (Math.sin(frame * 0.4 + i * 2) + 1) * 30 - 30;
      const ey = -70 + (frame * 0.5 + i * 30) % 80;
      ctx.fillStyle = `rgba(255,${100 + i * 40},0,0.8)`;
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flash overlay
  if (flashAlpha > 0) {
    ctx.fillStyle = `rgba(255,0,0,${flashAlpha})`;
    ctx.fillRect(-40, -80 + bob, 80, 150);
  }

  ctx.restore();
}

function drawHammer(ctx, frame, bob, dazed, slamming, stateTimer) {
  ctx.save();
  ctx.translate(36, -10 + bob);
  let rot;
  if (dazed) {
    rot = 1.3; // dropped
  } else if (slamming) {
    // Wind-up: rises then slams down
    const t = stateTimer; // counting down from ~30
    if (t > 18) {
      rot = -1.4 + (30 - t) * 0.05;
    } else {
      const slamT = (18 - t) / 18;
      rot = -0.8 + slamT * 1.6;
    }
  } else {
    rot = Math.sin(frame * 0.06) * 0.3;
  }
  ctx.rotate(rot);
  // Handle
  ctx.fillStyle = HAMMER_HANDLE;
  ctx.fillRect(-3, -40, 6, 50);
  ctx.fillStyle = HAMMER_HANDLE_HI;
  ctx.fillRect(-3, -40, 1.5, 50);
  // Wrap
  ctx.fillStyle = '#3A1F0A';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-3, -28 + i * 6, 6, 1.5);
  }
  // Hammer head
  ctx.fillStyle = HAMMER_HEAD;
  ctx.fillRect(-14, -52, 28, 18);
  ctx.fillStyle = HAMMER_HEAD_HI;
  ctx.fillRect(-14, -52, 28, 4);
  // Center band
  ctx.fillStyle = ARMOR_RIVET;
  ctx.fillRect(-2, -52, 4, 18);
  // Spikes
  ctx.fillStyle = '#999';
  ctx.beginPath();
  ctx.moveTo(-14, -44);
  ctx.lineTo(-22, -44);
  ctx.lineTo(-14, -38);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -44);
  ctx.lineTo(22, -44);
  ctx.lineTo(14, -38);
  ctx.fill();
  ctx.restore();
}

function drawFist(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7B4BA0';
  ctx.fillRect(-9, -2, 18, 1.5);
  ctx.fillRect(-9, 2, 18, 1.5);
  ctx.restore();
}

function drawStarShape(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](x + Math.cos(a) * r, y + Math.sin(a) * r);
    const b = a + (2 * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(b) * r * 0.4, y + Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}
