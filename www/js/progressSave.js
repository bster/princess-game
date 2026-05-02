// ============================================================
// RUN SAVE — Persists campaign progress while lives remain
// ============================================================

const KEY = 'princessfrank_run';

/**
 * @typedef {Object} RunPayload
 * @property {number} levelIndex
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
    if (typeof d.levelIndex !== 'number' || d.levelIndex < 0 || d.levelIndex >= 5) return null;
    if (typeof d.lives !== 'number' || d.lives < 1) return null;
    if (d.character !== 'princess' && d.character !== 'frank') return null;
    if (!Array.isArray(d.secretsCollected)) d.secretsCollected = [];
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
