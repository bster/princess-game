// ============================================================
// SPRITE: Shooter Enemy — turret with charge glow + recoil
// ============================================================

import { C } from '../constants';

const ARMOR = '#5C5C66';
const ARMOR_HI = '#8A8A95';
const ARMOR_DK = '#3A3A44';
const HELMET = '#7A7A85';
const RIVET = '#3A3A40';
const CANNON = '#3F3F48';
const CANNON_HI = '#7B7B85';
const MUZZLE = '#FF4500';

// opts: { facing, shootCooldown }
export function drawShooterEnemy(ctx, x, y, frame, facing, squished, opts) {
  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1, 0.3);
  if (facing < 0) ctx.scale(-1, 1);

  const cd = opts && typeof opts.shootCooldown === 'number' ? opts.shootCooldown : 50;
  // Recoil right after firing (cd just reset to ~95 → recoil for first 18 frames)
  const recoilT = Math.max(0, Math.min(1, (cd - 77) / 18));
  const recoil = recoilT * 6;
  // Charging glow when about to fire (last 18 frames)
  const charge = Math.max(0, Math.min(1, (18 - cd) / 18));

  const bob = Math.sin(frame * 0.08) * 1;

  // Pedestal
  ctx.fillStyle = ARMOR_DK;
  ctx.beginPath();
  ctx.roundRect(-19, 16 + bob, 38, 16, [0, 0, 9, 9]);
  ctx.fill();
  ctx.fillStyle = ARMOR;
  ctx.beginPath();
  ctx.roundRect(-18, 16 + bob, 36, 13, [0, 0, 8, 8]);
  ctx.fill();
  // Rivets on pedestal
  ctx.fillStyle = RIVET;
  for (const rx of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.arc(rx, 22 + bob, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body (armored)
  ctx.fillStyle = ARMOR;
  ctx.beginPath();
  ctx.roundRect(-16, -8 + bob, 32, 26, [4, 4, 0, 0]);
  ctx.fill();
  // Body chest plate
  ctx.fillStyle = ARMOR_HI;
  ctx.beginPath();
  ctx.roundRect(-12, -4 + bob, 24, 14, [3, 3, 3, 3]);
  ctx.fill();
  // Chest insignia (red dot, glows when charging)
  ctx.fillStyle = charge > 0 ? `rgba(255,${69 - charge * 50},0,${0.6 + charge * 0.4})` : '#882';
  ctx.beginPath();
  ctx.arc(0, 4 + bob, 2.5 + charge * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Head (goblin face inside helmet)
  ctx.fillStyle = C.gobHead;
  ctx.beginPath();
  ctx.roundRect(-13, -28 + bob, 26, 22, [8, 8, 4, 4]);
  ctx.fill();

  // Helmet
  ctx.fillStyle = HELMET;
  ctx.beginPath();
  ctx.roundRect(-16, -34 + bob, 32, 12, [6, 6, 0, 0]);
  ctx.fill();
  ctx.fillStyle = ARMOR_HI;
  ctx.fillRect(-14, -33 + bob, 28, 2);
  // Helmet spike
  ctx.fillStyle = HELMET;
  ctx.beginPath();
  ctx.moveTo(0, -42 + bob);
  ctx.lineTo(-4, -34 + bob);
  ctx.lineTo(4, -34 + bob);
  ctx.fill();
  ctx.fillStyle = ARMOR_HI;
  ctx.beginPath();
  ctx.moveTo(0, -42 + bob);
  ctx.lineTo(-1, -38 + bob);
  ctx.lineTo(1, -38 + bob);
  ctx.fill();
  // Side rivets
  ctx.fillStyle = RIVET;
  ctx.beginPath();
  ctx.arc(-13, -28 + bob, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(13, -28 + bob, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Eye slit (inset)
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(-10, -22 + bob, 20, 5);
  // Scanning eye dots (sweep horizontally)
  const scan = Math.sin(frame * 0.1) * 4;
  ctx.fillStyle = charge > 0.2 ? '#FF6600' : '#FF2222';
  ctx.beginPath();
  ctx.arc(-5 + scan, -19.5 + bob, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5 + scan, -19.5 + bob, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow
  if (charge > 0.2) {
    ctx.fillStyle = `rgba(255,80,0,${charge * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(scan, -19.5 + bob, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cannon arm (recoils along firing axis when shooting)
  ctx.save();
  ctx.translate(14 - recoil, 0 + bob);
  // Cannon mount
  ctx.fillStyle = ARMOR;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  // Barrel
  ctx.fillStyle = CANNON;
  ctx.fillRect(0, -4, 16, 8);
  ctx.fillStyle = CANNON_HI;
  ctx.fillRect(0, -4, 16, 1.5);
  // Reinforcement ring
  ctx.fillStyle = ARMOR_DK;
  ctx.fillRect(8, -5, 2, 10);
  // Muzzle / glow
  if (charge > 0.05) {
    // Charging glow
    ctx.fillStyle = `rgba(255,${100 + charge * 100},0,${0.4 + charge * 0.5})`;
    ctx.beginPath();
    ctx.arc(16, 0, 4 + charge * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = MUZZLE;
  ctx.beginPath();
  ctx.arc(16, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Muzzle flash on recoil
  if (recoilT > 0.6) {
    const flash = (recoilT - 0.6) / 0.4;
    ctx.fillStyle = `rgba(255,220,80,${flash})`;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(16 + 14 * flash, -6 * flash);
    ctx.lineTo(16 + 22 * flash, 0);
    ctx.lineTo(16 + 14 * flash, 6 * flash);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}
