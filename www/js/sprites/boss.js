// ============================================================
// SPRITE: Boss — Goblin King (3x size, armored, spiked crown)
// ============================================================

import { C } from '../constants';

export function drawBoss(ctx, x, y, frame, phase, hp, maxHp, dazed, facing) {
  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);

  const bob = dazed ? 0 : Math.sin(frame * 0.08) * 3;

  // Flash red when hit
  const flashAlpha = frame % 6 < 3 && dazed ? 0.5 : 0;

  // Body (armored)
  ctx.fillStyle = phase >= 3 ? '#8B2252' : '#5C3A6E';
  ctx.beginPath();
  ctx.roundRect(-36, 0 + bob, 72, 58, [0, 0, 16, 16]);
  ctx.fill();

  // Armor plates
  if (phase < 3) {
    ctx.fillStyle = '#777';
    ctx.fillRect(-30, 6 + bob, 60, 8);
    ctx.fillRect(-30, 20 + bob, 60, 8);
    ctx.fillStyle = '#888';
    ctx.fillRect(-28, 7 + bob, 56, 3);
    ctx.fillRect(-28, 21 + bob, 56, 3);
  }

  // Head
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.roundRect(-40, -56 + bob, 80, 60, [16, 16, 10, 10]);
  ctx.fill();

  // Spiked crown
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(-36, -64 + bob, 72, 14);
  const spikes = 5;
  for (let i = 0; i < spikes; i++) {
    const sx = -28 + i * 14;
    ctx.beginPath();
    ctx.moveTo(sx, -64 + bob);
    ctx.lineTo(sx + 7, -80 + bob);
    ctx.lineTo(sx + 14, -64 + bob);
    ctx.fill();
  }
  // Crown gems
  ctx.fillStyle = '#FF0000';
  for (let i = 0; i < spikes; i++) {
    ctx.beginPath();
    ctx.arc(-21 + i * 14, -57 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horns (bigger)
  ctx.fillStyle = C.gobHorn;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 30, -50 + bob);
    ctx.lineTo(side * 30 - 8, -72 + bob);
    ctx.lineTo(side * 30 + 8, -50 + bob);
    ctx.fill();
  }

  // Eyes (angry, glow in phase 3)
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(side * 16, -32 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = phase >= 3 ? '#FF0000' : C.gobEyePupil;
    ctx.beginPath();
    ctx.arc(side * 16 + 2, -30 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth (snarl)
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -14 + bob, 14, 0.1, Math.PI - 0.1);
  ctx.stroke();
  // Fangs
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-10, -14 + bob);
  ctx.lineTo(-8, -4 + bob);
  ctx.lineTo(-6, -14 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -14 + bob);
  ctx.lineTo(8, -4 + bob);
  ctx.lineTo(10, -14 + bob);
  ctx.fill();

  // Feet
  ctx.fillStyle = C.gobFeet;
  const footSpread = Math.sin(frame * 0.12) * 4;
  ctx.beginPath();
  ctx.roundRect(-24 - footSpread, 56 + bob, 24, 14, [0, 0, 8, 8]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(footSpread, 56 + bob, 24, 14, [0, 0, 8, 8]);
  ctx.fill();

  // War hammer (phase 1 & 2)
  if (phase < 3) {
    ctx.save();
    ctx.translate(36, -10 + bob);
    ctx.rotate(dazed ? 0.8 : Math.sin(frame * 0.06) * 0.3);
    // Handle
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(-3, -40, 6, 50);
    // Hammer head
    ctx.fillStyle = '#666';
    ctx.fillRect(-12, -52, 24, 16);
    ctx.fillStyle = '#777';
    ctx.fillRect(-10, -50, 20, 4);
    // Spikes
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(-12, -44);
    ctx.lineTo(-18, -44);
    ctx.lineTo(-12, -40);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -44);
    ctx.lineTo(18, -44);
    ctx.lineTo(12, -40);
    ctx.fill();
    ctx.restore();
  }

  // Dazed stars
  if (dazed) {
    for (let i = 0; i < 3; i++) {
      const a = frame * 0.1 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(a) * 30;
      const sy = -70 + Math.sin(a * 2) * 5;
      ctx.fillStyle = '#FFD700';
      drawStarShape(ctx, sx, sy, 5);
    }
  }

  // Flash overlay
  if (flashAlpha > 0) {
    ctx.fillStyle = `rgba(255,0,0,${flashAlpha})`;
    ctx.fillRect(-40, -80 + bob, 80, 150);
  }

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
