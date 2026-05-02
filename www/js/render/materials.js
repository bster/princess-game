// ============================================================
// MATERIALS — Depth pass for platforms and ground
// ============================================================
//
// Replaces flat fills with vertical gradients, edge bevels,
// and slight per-tile color variation for visual richness.

import {
  PLATFORM_HIGHLIGHT,
  PLATFORM_SHADOW,
  PLATFORM_GRAD_TOP,
  PLATFORM_GRAD_BOT,
  BRICK_VARIATION,
} from '../constants';

// ---- Deterministic hash for per-tile variation ----
function tileHash(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return (h & 0x7fffffff) / 0x7fffffff; // 0..1
}

/**
 * Fill a rectangle with a vertical gradient.
 */
export function fillWithVerticalGradient(ctx, x, y, w, h, topColor, botColor) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, botColor);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

/**
 * Draw a platform with bevel (gradient + highlight + shadow + grass tufts).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x   — screen X
 * @param {number} y   — screen Y (top of platform)
 * @param {number} w   — platform width
 * @param {number} h   — platform height (default 16)
 */
export function drawPlatformWithBevel(ctx, x, y, w, h) {
  h = h || 16;

  // Main body — vertical gradient
  fillWithVerticalGradient(ctx, x, y, w, h, PLATFORM_GRAD_TOP, PLATFORM_GRAD_BOT);

  // Top highlight (2px bright strip)
  ctx.fillStyle = PLATFORM_HIGHLIGHT;
  ctx.fillRect(x, y, w, 2);

  // Bottom shadow (1px dark strip)
  ctx.fillStyle = PLATFORM_SHADOW;
  ctx.fillRect(x, y + h - 1, w, 1);

  // Side edges (subtle darkening)
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);

  // Grass tufts along top edge
  ctx.fillStyle = '#8FBC3A';
  const tufts = Math.floor(w / 12);
  for (let i = 0; i < tufts; i++) {
    const tx = x + 6 + i * 12 + tileHash(x + i * 12, y) * 6 - 3;
    const tH = 3 + tileHash(x + i * 13, y + 1) * 3;
    ctx.fillRect(tx, y - tH, 2, tH);
    ctx.fillRect(tx - 2, y - tH + 1, 2, tH - 1);
    ctx.fillRect(tx + 2, y - tH + 1, 2, tH - 1);
  }
}

/**
 * Draw ground with depth — enhanced brick pattern with per-tile variation.
 * Renders a grass strip, then bricks with subtle color jitter.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} groundY    — top of ground
 * @param {number} vpW        — viewport width
 * @param {number} vpH        — viewport height
 * @param {number} camX       — camera X offset
 * @param {object} brickPattern — existing tiled pattern
 * @param {Array}  [gaps]     — gap definitions [{x, w}, ...]
 */
export function drawGroundWithDepth(ctx, groundY, vpW, vpH, camX, brickPattern, gaps) {
  const drawSegment = (sx, sw) => {
    if (sw <= 0) return;

    // Grass highlight strip (richer than plain yellow)
    const grassGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 6);
    grassGrad.addColorStop(0, '#C8D84A');
    grassGrad.addColorStop(0.5, '#E8C252');
    grassGrad.addColorStop(1, '#D4A830');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(sx, groundY, sw, 6);

    // Brick pattern with subtle overlay for depth
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, groundY + 6, sw, vpH - groundY - 6);
    ctx.clip();
    ctx.fillStyle = brickPattern;
    ctx.translate(-(camX % 64), 0);
    ctx.fillRect(0, groundY + 6, vpW + 128, vpH - groundY - 6);
    ctx.restore();

    // Subtle darkening gradient over bricks (depth fade)
    const depthGrad = ctx.createLinearGradient(0, groundY + 6, 0, groundY + 80);
    depthGrad.addColorStop(0, 'rgba(0,0,0,0)');
    depthGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(sx, groundY + 6, sw, 80);

    // Per-tile color variation (deterministic spots)
    ctx.globalAlpha = BRICK_VARIATION;
    const tileW = 32,
      tileH = 16;
    const startTile = Math.floor((sx + camX) / tileW);
    const endTile = Math.ceil((sx + sw + camX) / tileW);
    for (let tx = startTile; tx <= endTile; tx++) {
      for (let ty = 0; ty < 4; ty++) {
        const hash = tileHash(tx, ty);
        const wx = tx * tileW - camX;
        const wy = groundY + 8 + ty * tileH;
        if (hash > 0.7) {
          ctx.fillStyle = 'rgba(255,255,200,1)';
          ctx.fillRect(wx, wy, tileW, tileH);
        } else if (hash < 0.15) {
          ctx.fillStyle = 'rgba(0,0,0,1)';
          ctx.fillRect(wx, wy, tileW, tileH);
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  if (gaps && gaps.length > 0) {
    let lastEnd = 0;
    const sorted = [...gaps].sort((a, b) => a.x - b.x);
    for (const g of sorted) {
      drawSegment(lastEnd - camX, g.x - camX - (lastEnd - camX));
      lastEnd = g.x + g.w;
    }
    drawSegment(lastEnd - camX, vpW - (lastEnd - camX) + 200);
  } else {
    drawSegment(0, vpW);
  }
}
