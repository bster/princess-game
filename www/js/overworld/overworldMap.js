// ============================================================
// OVERWORLD — Mario-style map layout & collision
// ============================================================

import { getLevelCount } from '../levels/levelData';

export const OW_MAP_W = 1040;
export const OW_MAP_H = 1440;
export const OW_PLAYER_R = 15;
export const OW_SPEED = 3.25;

export const OW_PATH_SPOTS = [
  [180, 1260],
  [780, 1180],
  [280, 1060],
  [880, 940],
  [200, 820],
  [760, 700],
  [320, 560],
  [840, 420],
];

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/** Visual style hints per stage (looped if more levels than entries). */
const STAGE_THEMES = [
  { theme: 'meadow' },
  { theme: 'sunset' },
  { theme: 'cavern' },
  { theme: 'sky' },
  { theme: 'fortress', boss: true },
  { theme: 'meadow' },
  { theme: 'sunset' },
  { theme: 'castle', final: true },
];

/** @returns {object[]} */
export function getOwBuildings() {
  const n = getLevelCount();
  const spots = OW_PATH_SPOTS.slice(0, Math.min(n, OW_PATH_SPOTS.length));
  const levels = [];
  for (let i = 0; i < spots.length; i++) {
    const [x, y] = spots[i];
    const theme = STAGE_THEMES[i] || { theme: 'meadow' };
    levels.push({
      kind: 'level',
      levelIndex: i,
      x,
      y,
      w: 78,
      h: 70,
      label: String(i + 1),
      theme: theme.theme,
      boss: !!theme.boss,
      final: !!theme.final,
    });
  }

  const minis = [
    { kind: 'minigame', id: 'slot', x: 540, y: 1140, w: 96, h: 72, label: 'Slots', icon: 'slot' },
    { kind: 'minigame', id: 'claw', x: 520, y: 780, w: 96, h: 72, label: 'Claw', icon: 'claw' },
    { kind: 'minigame', id: 'hoops', x: 540, y: 520, w: 96, h: 72, label: 'Hoops', icon: 'hoops' },
  ];

  return [...levels, ...minis];
}

export function getOwCollisionRects() {
  const rects = [];
  rects.push({ x: 0, y: 0, w: OW_MAP_W, h: 105 });
  rects.push({ x: 0, y: OW_MAP_H - 88, w: OW_MAP_W, h: 88 });
  rects.push({ x: 0, y: 0, w: 52, h: OW_MAP_H });
  rects.push({ x: OW_MAP_W - 52, y: 0, w: 52, h: OW_MAP_H });

  for (const b of getOwBuildings()) {
    rects.push({ x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 });
  }
  return rects;
}

export function spawnOwNearLevel(levelIndex) {
  const b = getOwBuildings().find((x) => x.kind === 'level' && x.levelIndex === levelIndex);
  if (!b) return { x: 220, y: OW_MAP_H - 120 };
  return {
    x: b.x + b.w / 2,
    y: b.y + b.h + OW_PLAYER_R + 26,
    facing: 1,
  };
}

export function moveOwPlayer(pos, dx, dy, rects) {
  let x = pos.x + dx;
  let y = pos.y + dy;

  x = clamp(x, OW_PLAYER_R + 56, OW_MAP_W - OW_PLAYER_R - 56);
  y = clamp(y, OW_PLAYER_R + 118, OW_MAP_H - OW_PLAYER_R - 36);

  for (let iter = 0; iter < 3; iter++) {
    for (const r of rects) {
      const nx = clamp(x, r.x, r.x + r.w);
      const ny = clamp(y, r.y, r.y + r.h);
      let rdx = x - nx;
      let rdy = y - ny;
      const dist = Math.hypot(rdx, rdy);
      if (dist > 0 && dist < OW_PLAYER_R) {
        const push = (OW_PLAYER_R - dist) / dist;
        x += rdx * push;
        y += rdy * push;
      }
    }
  }

  x = clamp(x, OW_PLAYER_R + 56, OW_MAP_W - OW_PLAYER_R - 56);
  y = clamp(y, OW_PLAYER_R + 118, OW_MAP_H - OW_PLAYER_R - 36);

  let facing = pos.facing ?? 1;
  if (dx > 0.1) facing = 1;
  else if (dx < -0.1) facing = -1;

  return { x, y, facing };
}

/**
 * @param {number} px
 * @param {number} py
 * @param {number} maxReachableLevel
 * @param {{ slot?: boolean, claw?: boolean, hoops?: boolean }} minigamesUsed
 */
export function findInteractTarget(px, py, maxReachableLevel, minigamesUsed) {
  let best = null;
  let bestD = Infinity;
  for (const b of getOwBuildings()) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const d = Math.hypot(px - cx, py - cy);
    if (d > 102) continue;
    if (b.kind === 'level') {
      if (b.levelIndex > maxReachableLevel) continue;
    } else if (minigamesUsed[b.id]) {
      continue;
    }
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  return best;
}
