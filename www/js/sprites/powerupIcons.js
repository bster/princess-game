// ============================================================
// SPRITES: Power-up rose icons (in-world collectibles + HUD)
// ============================================================

import { C } from '../constants';

const TYPES = {
  fire: { primary: C.firePrimary, secondary: C.fireSecondary, petal: '#FF69B4', center: '#FFD700' },
  flight: {
    primary: C.flightPrimary,
    secondary: C.flightSecondary,
    petal: '#FF85C8',
    center: '#FFFFFF',
  },
  shield: {
    primary: C.shieldPrimary,
    secondary: C.shieldSecondary,
    petal: '#FF5C9E',
    center: '#FFB6D9',
  },
  growth: {
    primary: C.growthPrimary,
    secondary: C.growthSecondary,
    petal: '#FF6EB4',
    center: '#FFDDF0',
  },
};

function drawRoseShape(ctx, size, petalColor, centerColor) {
  const petals = 5;
  const petalR = size * 0.7;
  const centerR = size * 0.32;

  // Petals
  ctx.fillStyle = petalColor;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -petalR * 0.5, petalR * 0.42, petalR * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Inner petals (lighter, smaller, offset rotation)
  ctx.fillStyle = petalColor;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2 - Math.PI / 2 + Math.PI / petals;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -petalR * 0.3, petalR * 0.28, petalR * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Center
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, centerR, 0, Math.PI * 2);
  ctx.fill();

  // Center highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(-centerR * 0.25, -centerR * 0.25, centerR * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPowerUpOrb(ctx, x, y, type, frame) {
  const t = TYPES[type] || TYPES.fire;
  const bob = Math.sin(frame * 0.08) * 4;
  const pulse = 0.9 + Math.sin(frame * 0.12) * 0.1;
  const spin = frame * 0.015;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(pulse, pulse);

  // Outer glow
  ctx.fillStyle = t.primary + '33';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Stem hint
  ctx.strokeStyle = '#2d8855';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(2, 14, 0, 18);
  ctx.stroke();
  // Small leaves
  ctx.fillStyle = '#3a8';
  ctx.beginPath();
  ctx.ellipse(3, 13, 4, 2, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-2, 15, 3, 1.5, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Rose
  ctx.save();
  ctx.rotate(spin);
  drawRoseShape(ctx, 13, t.petal, t.center);
  ctx.restore();

  ctx.restore();
}

export function drawAbilityHUD(ctx, x, y, type, remaining, total, frame) {
  const t = TYPES[type] || TYPES.fire;
  const r = 14;

  ctx.save();
  ctx.translate(x, y);

  // Background circle
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
  ctx.fill();

  // Radial timer ring
  const pct = remaining / total;
  ctx.strokeStyle = t.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
  ctx.stroke();

  // Mini rose inside
  ctx.globalAlpha = 0.6 + pct * 0.4;
  ctx.save();
  ctx.rotate(frame * 0.02);
  drawRoseShape(ctx, 9, t.petal, t.center);
  ctx.restore();

  ctx.globalAlpha = 1;
  ctx.restore();
}
