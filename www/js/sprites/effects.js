// ============================================================
// SPRITES: Visual effects — stars, hearts, fireballs, shield, wings
// ============================================================

export function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
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

export function drawHeart(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y - size * 0.3, x - size, y - size * 0.3, x - size, y + size * 0.1);
  ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
  ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.1);
  ctx.bezierCurveTo(x + size, y - size * 0.3, x, y - size * 0.3, x, y + size * 0.3);
  ctx.fill();
}

export function drawFireball(ctx, x, y, frame, facing) {
  ctx.save();
  ctx.translate(x, y);
  // Core
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  // Inner glow
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  // White hot center
  ctx.fillStyle = '#FFF8DC';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  // Flame trail
  const trailDir = facing < 0 ? 1 : -1;
  ctx.fillStyle = 'rgba(255,69,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(trailDir * 8, 0, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawEnemyShot(ctx, x, y, _frame) {
  ctx.save();
  ctx.translate(x, y);
  // Purple energy ball
  ctx.fillStyle = '#8B00FF';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#CC88FF';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  ctx.fillStyle = 'rgba(139,0,255,0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawShieldBubble(ctx, x, y, w, h, hits, frame) {
  ctx.save();
  const pulse = 1 + Math.sin(frame * 0.1) * 0.03;
  const alpha = 0.15 + hits * 0.05;
  ctx.translate(x, y + h / 2);
  ctx.scale(pulse, pulse);
  // Outer bubble
  ctx.strokeStyle = `rgba(65,105,225,${0.4 + hits * 0.1})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.8 + 8, h * 0.6 + 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Fill
  ctx.fillStyle = `rgba(135,206,250,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.8 + 6, h * 0.6 + 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.2, -h * 0.2, w * 0.3, h * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawWings(ctx, x, y, frame) {
  const flap = Math.sin(frame * 0.2) * 0.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  // Left wing
  ctx.save();
  ctx.rotate(-0.3 - flap);
  ctx.beginPath();
  ctx.ellipse(-18, -5, 16, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Right wing
  ctx.save();
  ctx.rotate(0.3 + flap);
  ctx.beginPath();
  ctx.ellipse(18, -5, 16, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** Hidden collectible — faceted amethyst */
export function drawSecretGem(ctx, x, y, frame, reveal) {
  const pulse = 0.85 + Math.sin(frame * 0.11) * 0.15;
  const a = Math.min(1, reveal) * (0.55 + 0.45 * pulse);
  ctx.save();
  ctx.translate(x, y + Math.sin(frame * 0.07) * 2);
  ctx.globalAlpha = a;
  ctx.rotate(frame * 0.02);
  ctx.fillStyle = 'rgba(160,80,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(10, -4);
  ctx.lineTo(10, 8);
  ctx.lineTo(0, 14);
  ctx.lineTo(-10, 8);
  ctx.lineTo(-10, -4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(-3, -8);
  ctx.lineTo(4, 2);
  ctx.lineTo(-2, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
