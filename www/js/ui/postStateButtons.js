// ============================================================
// POST-STATE BUTTONS — Shared rectangles for level-complete,
// game-over, and victory screens. Renderer + tap handler must
// agree on the geometry, so it lives here.
// ============================================================

import { W, H } from '../constants';

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function hit(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

const BTN_W = W - 80;
const BTN_H = 60;

export const LEVEL_CLEAR_BTN = rect(40, H - 130, BTN_W, BTN_H);
export const GAME_OVER_BTN = rect(40, H - 130, BTN_W, BTN_H);
export const VICTORY_BTN = rect(40, H - 130, BTN_W, BTN_H);

export function hitLevelClear(px, py) {
  return hit(px, py, LEVEL_CLEAR_BTN);
}
export function hitGameOver(px, py) {
  return hit(px, py, GAME_OVER_BTN);
}
export function hitVictory(px, py) {
  return hit(px, py, VICTORY_BTN);
}
