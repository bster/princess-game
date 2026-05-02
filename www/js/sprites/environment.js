// ============================================================
// SPRITES: Environment — clouds, bushes, trees, castle, flag, cage
// ============================================================

import { C, CROUCH_H } from '../constants';

export function drawCloud(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 5, w * 0.5, w * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, w * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.2, y - w * 0.1, w * 0.28, w * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w * 0.15, y - w * 0.12, w * 0.25, w * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - w * 0.05, y - w * 0.16, w * 0.2, w * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.1, y - w * 0.15, w * 0.15, w * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBush(ctx, x, y, w) {
  ctx.fillStyle = '#2d8855';
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, w * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a8';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.15, y - w * 0.05, w * 0.3, w * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTree(ctx, x, y) {
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(x - 8, y - 50, 16, 50);
  ctx.fillStyle = '#2d8';
  ctx.beginPath();
  ctx.arc(x, y - 60, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e9';
  ctx.beginPath();
  ctx.arc(x, y - 75, 20, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCastleBg(ctx, x, y) {
  ctx.fillStyle = C.castle;
  ctx.fillRect(x, y - 80, 30, 80);
  ctx.fillStyle = '#9980b8';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + i * 9, y - 88, 6, 8);
  }
  ctx.fillStyle = C.castleDoor;
  ctx.beginPath();
  ctx.arc(x + 15, y - 10, 7, Math.PI, 0);
  ctx.fillRect(x + 8, y - 10, 14, 10);
  ctx.fill();
  ctx.fillStyle = C.castle;
  ctx.fillRect(x - 30, y - 50, 35, 50);
  ctx.fillStyle = '#9980b8';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - 30 + i * 10, y - 58, 6, 8);
  }
  ctx.fillStyle = C.flagColor;
  ctx.beginPath();
  ctx.moveTo(x + 28, y - 88);
  ctx.lineTo(x + 40, y - 82);
  ctx.lineTo(x + 28, y - 76);
  ctx.fill();
}

// New environment sprites for themed levels

export function drawCrystal(ctx, x, y, h, color) {
  const c = color || '#88DDFF';
  ctx.save();
  ctx.translate(x, y);
  // Main crystal
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(-2, -h + 4);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-2, 0);
  ctx.closePath();
  ctx.fill();
  // Glow
  ctx.fillStyle = c.replace(')', ',0.15)').replace('rgb', 'rgba');
  ctx.beginPath();
  ctx.arc(0, -h / 2, h * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawTorch(ctx, x, y, frame) {
  ctx.save();
  ctx.translate(x, y);
  // Bracket
  ctx.fillStyle = '#666';
  ctx.fillRect(-3, 0, 6, 20);
  ctx.fillRect(-6, 18, 12, 4);
  // Flame
  const flicker = Math.sin(frame * 0.3) * 2;
  ctx.fillStyle = '#FF8C00';
  ctx.beginPath();
  ctx.ellipse(0, -4 + flicker, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(0, -2 + flicker, 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  ctx.fillStyle = 'rgba(255,140,0,0.1)';
  ctx.beginPath();
  ctx.arc(0, -4, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawRuins(ctx, x, y) {
  ctx.fillStyle = '#554466';
  // Broken wall segment
  ctx.fillRect(x, y - 40, 12, 40);
  ctx.fillRect(x + 16, y - 25, 10, 25);
  ctx.fillRect(x + 30, y - 35, 8, 35);
  // Cracks
  ctx.strokeStyle = '#443355';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 30);
  ctx.lineTo(x + 3, y - 15);
  ctx.lineTo(x + 8, y - 5);
  ctx.stroke();
}

export function drawFlag(ctx, x, y, reachedFrame) {
  const poleH = 140;
  ctx.fillStyle = C.flagPole;
  ctx.fillRect(x - 2, y - poleH, 4, poleH);
  // Gold ball on top
  ctx.fillStyle = C.crown;
  ctx.beginPath();
  ctx.arc(x, y - poleH, 5, 0, Math.PI * 2);
  ctx.fill();

  // Flag position — slides down when reached
  let flagY = y - poleH + 2;
  if (reachedFrame > 0) {
    const slideProgress = Math.min(reachedFrame / 40, 1); // slide over 40 frames
    flagY = y - poleH + 2 + (poleH - 50) * slideProgress;
  }

  // Flag triangle with wave animation
  const wave = reachedFrame > 0 ? Math.sin(reachedFrame * 0.15) * 4 : 0;
  ctx.fillStyle = C.flagColor;
  ctx.beginPath();
  ctx.moveTo(x + 2, flagY);
  ctx.lineTo(x + 35 + wave, flagY + 13);
  ctx.lineTo(x + 2, flagY + 26);
  ctx.closePath();
  ctx.fill();
}

export function drawCage(ctx, x, y, open) {
  const w = 70,
    h = 80;
  if (open) ctx.globalAlpha = 0.3;

  ctx.fillStyle = C.cageTop;
  ctx.fillRect(x - 4, y, w + 8, 6);

  ctx.fillStyle = C.cage;
  for (let i = 0; i <= 5; i++) {
    ctx.fillRect(x + i * 14, y, 3, h);
  }

  if (open) {
    ctx.globalAlpha = 0.4;
    ctx.save();
    ctx.translate(x + w, y);
    ctx.transform(0.6, 0, -0.3, 1, 0, 0);
    ctx.strokeStyle = C.cage;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 30, h);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

/**
 * Draw a stone barrier with a crawl-space gap at the bottom.
 * Standing players are blocked; crouching players can pass under.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x       — left edge (screen space)
 * @param {number} groundY — ground surface Y
 * @param {number} w       — barrier width (default 40)
 * @param {number} gapH    — crawl-space height from ground (default CROUCH_H)
 * @param {number} totalH  — total barrier height (default 70)
 */
export function drawBarrier(ctx, x, groundY, w, gapH, totalH) {
  w = w || 40;
  gapH = gapH || CROUCH_H;
  totalH = totalH || 70;

  const blockTop = groundY - totalH;
  const blockBot = groundY - gapH;
  const blockH = blockBot - blockTop;

  ctx.save();

  // Main stone block (upper solid part)
  const grad = ctx.createLinearGradient(x, blockTop, x, blockBot);
  grad.addColorStop(0, '#8a8078');
  grad.addColorStop(0.5, '#6e6560');
  grad.addColorStop(1, '#5a5450');
  ctx.fillStyle = grad;
  ctx.fillRect(x, blockTop, w, blockH);

  // Top cap (wider, like a lintel)
  ctx.fillStyle = '#9a9088';
  ctx.fillRect(x - 3, blockTop, w + 6, 5);

  // Bottom edge of the block (underside of lintel)
  ctx.fillStyle = '#4a4440';
  ctx.fillRect(x, blockBot - 2, w, 2);

  // Side pillars framing the crawl space
  const pillarW = 5;
  ctx.fillStyle = '#7a7268';
  ctx.fillRect(x, blockBot, pillarW, gapH); // left pillar
  ctx.fillRect(x + w - pillarW, blockBot, pillarW, gapH); // right pillar

  // Highlight left pillar top, shadow right
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x, blockBot, pillarW, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x + w - pillarW, blockBot, pillarW, 2);

  // Stone texture lines on the block
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  const rows = Math.floor(blockH / 10);
  for (let r = 1; r < rows; r++) {
    const ly = blockTop + r * 10;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
    // Vertical joint offset by row
    const jx = x + (r % 2 === 0 ? w * 0.35 : w * 0.65);
    ctx.beginPath();
    ctx.moveTo(jx, ly - 10);
    ctx.lineTo(jx, ly);
    ctx.stroke();
  }

  // Top edge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x - 3, blockTop, w + 6, 2);

  // Arrow hint: small down-arrow above the gap (subtle visual cue)
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#FFD700';
  const arrowX = x + w / 2;
  const arrowY = blockBot + 4;
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY + 8);
  ctx.lineTo(arrowX - 5, arrowY);
  ctx.lineTo(arrowX + 5, arrowY);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}
