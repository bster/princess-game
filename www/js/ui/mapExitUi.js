// ============================================================
// MAP EXIT — Touch target + hit test (matches renderer chip)
// ============================================================

import { W } from '../constants';

export const MAP_EXIT_BTN = { x: W - 112, y: 92, w: 100, h: 38 };

export function hitTestMapExit(px, py) {
  const b = MAP_EXIT_BTN;
  return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}
