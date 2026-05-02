// ============================================================
// TITLE SCREEN — Hit regions (must match renderer placement)
// ============================================================

import { W, H } from '../constants.js';

function hitRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function getTitleUi(hasSave) {
  const panelW = 142;
  const panelH = 188;
  const panelY = 212;
  const midGap = 14;
  const leftX = W / 2 - panelW - midGap / 2;
  const rightX = W / 2 + midGap / 2;

  let yBtn = 428;
  const buttons = [];
  if (hasSave) {
    buttons.push({ id: 'continue', x: 28, y: yBtn, w: W - 56, h: 42 });
    yBtn += 50;
  }
  buttons.push({ id: 'newGame', x: 28, y: yBtn, w: W - 56, h: 42 });
  yBtn += 50;
  buttons.push({ id: 'leaderboard', x: 28, y: yBtn, w: W - 56, h: 38 });

  return {
    princessPanel: { x: leftX, y: panelY, w: panelW, h: panelH },
    frankPanel: { x: rightX, y: panelY, w: panelW, h: panelH },
    buttons,
  };
}

/** Returns 'princess' | 'frank' | 'continue' | 'newGame' | 'leaderboard' | null */
export function hitTestTitle(px, py, hasSave) {
  const ui = getTitleUi(hasSave);
  if (hitRect(px, py, ui.princessPanel)) return 'princess';
  if (hitRect(px, py, ui.frankPanel)) return 'frank';
  for (const b of ui.buttons) {
    if (hitRect(px, py, b)) return b.id;
  }
  return null;
}

export function hitTestLeaderboardBack(px, py) {
  const r = { x: W / 2 - 70, y: H - 72, w: 140, h: 40 };
  return hitRect(px, py, r);
}
