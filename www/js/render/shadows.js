// ============================================================
// SHADOWS — Ground contact shadow for entities
// ============================================================
//
// Soft oval shadow projected on the ground beneath entities.
// Opacity and size diminish as entity rises above the ground,
// giving a subtle height cue.

import {
  SHADOW_MAX_OPACITY,
  SHADOW_FADE_HEIGHT,
  SHADOW_BASE_RADIUS,
  SHADOW_SQUASH,
} from '../constants';

/**
 * Draw a soft oval contact shadow.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x         — entity center X (screen space)
 * @param {number} groundY   — Y position of the ground/platform surface
 * @param {number} heightAboveGround — distance from entity bottom to ground (≥ 0)
 * @param {number} baseRadius — horizontal radius at ground level (default from constant)
 */
export function drawContactShadow(ctx, x, groundY, heightAboveGround, baseRadius) {
  const h = Math.max(0, heightAboveGround);
  if (h > SHADOW_FADE_HEIGHT) return; // too high, no shadow

  const t = 1 - h / SHADOW_FADE_HEIGHT; // 1 at ground, 0 at max height
  const opacity = SHADOW_MAX_OPACITY * t * t; // quadratic falloff
  const radius = (baseRadius || SHADOW_BASE_RADIUS) * (0.5 + 0.5 * t); // shrinks with height

  if (opacity < 0.01) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Radial gradient for soft edge
  const grad = ctx.createRadialGradient(x, groundY, 0, x, groundY, radius);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.5)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, groundY, radius, radius * SHADOW_SQUASH, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
