// ============================================================
// UTILS — Shared helper functions
// ============================================================

export function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

// Easing functions
export function easeOutQuad(t) {
  return t * (2 - t);
}
export function easeInQuad(t) {
  return t * t;
}
export function easeOutBack(t) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
}

export function isOverGap(x, w, gaps) {
  if (!gaps) return false;
  for (const g of gaps) {
    if (x + w > g.x && x < g.x + g.w) return true;
  }
  return false;
}
