// ============================================================
// TITLE SCREEN — Hit regions (must match renderer placement)
// ============================================================

import { W, H } from '../constants';

function hitRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export const TITLE_LAYOUT = {
  titleY: 78,
  subtitleY: 116,
  panelY: 154,
  panelW: 158,
  panelH: 246,
  midGap: 18,
  missionY: 422,
  buttonStartY: 458,
  buttonW: W - 56,
  buttonH: 56,
  buttonGap: 14,
  footerY: H - 28,
  medalsY: H - 60,
};

export function getTitleUi(hasSave) {
  const t = TITLE_LAYOUT;
  const leftX = W / 2 - t.panelW - t.midGap / 2;
  const rightX = W / 2 + t.midGap / 2;

  let y = t.buttonStartY;
  const buttons = [];
  if (hasSave) {
    buttons.push({ id: 'continue', x: 28, y, w: t.buttonW, h: t.buttonH });
    y += t.buttonH + t.buttonGap;
  }
  buttons.push({ id: 'newGame', x: 28, y, w: t.buttonW, h: t.buttonH });
  y += t.buttonH + t.buttonGap;
  buttons.push({ id: 'leaderboard', x: 28, y, w: t.buttonW, h: t.buttonH });

  return {
    princessPanel: { x: leftX, y: t.panelY, w: t.panelW, h: t.panelH },
    frankPanel: { x: rightX, y: t.panelY, w: t.panelW, h: t.panelH },
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
