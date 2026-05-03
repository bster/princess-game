// ============================================================
// RUN SAVE — Persists campaign progress while lives remain
// ============================================================

import { getLevelCount } from './levels/levelData';

const KEY = 'princessfrank_run';

/**
 * @typedef {Object} RunPayload
 * @property {number} levelIndex
 * @property {number} maxReachableLevel
 * @property {string} [owNodeId]
 * @property {{ slot?: boolean, claw?: boolean, hoops?: boolean }} minigamesUsed
 * @property {number} lives
 * @property {number} score
 * @property {'princess'|'frank'} character
 * @property {number} tiaraCount
 * @property {number} nextLifeTiaras
 * @property {string[]} secretsCollected
 */

/** @returns {RunPayload | null} */
export function loadRun() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const lc = getLevelCount();
    if (typeof d.levelIndex !== 'number' || d.levelIndex < 0 || d.levelIndex >= lc) return null;
    if (typeof d.lives !== 'number' || d.lives < 1) return null;
    if (d.character !== 'princess' && d.character !== 'frank') return null;
    if (!Array.isArray(d.secretsCollected)) d.secretsCollected = [];
    let mr =
      typeof d.maxReachableLevel === 'number' ? d.maxReachableLevel : d.levelIndex;
    mr = Math.max(0, Math.min(lc - 1, mr));
    d.maxReachableLevel = mr;
    d.levelIndex = Math.max(0, Math.min(lc - 1, d.levelIndex));
    if (!d.minigamesUsed || typeof d.minigamesUsed !== 'object') d.minigamesUsed = {};
    if (typeof d.owNodeId !== 'string') d.owNodeId = undefined;
    return d;
  } catch {
    return null;
  }
}

/** @param {RunPayload} payload */
export function saveRun(payload) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...payload,
        savedAt: Date.now(),
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasRunSave() {
  return loadRun() !== null;
}
