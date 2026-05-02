// ============================================================
// MEDALS — Per-level star medal evaluation & persistence
// ============================================================

import { getLevelCount } from './levels/levelData';

const STORAGE_KEY = 'princessfrank_medals';

export class MedalManager {
  constructor() {
    this.medals = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore parse errors */
    }
    return this._createEmpty();
  }

  _createEmpty() {
    const medals = {};
    const n = getLevelCount();
    for (let i = 0; i < n; i++) {
      medals[i] = { collector: false, speedrun: false, flawless: false };
    }
    return medals;
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.medals));
    } catch (e) {
      /* ignore storage errors */
    }
  }

  evaluate(levelIndex, stats) {
    const existing = this.medals[levelIndex] || {};
    const results = [];

    // Collector: collected every tiara
    const collectorEarned = stats.tiarasCollected >= stats.tiarasTotal;
    results.push({
      type: 'collector',
      label: 'All Tiaras',
      earned: collectorEarned,
      newlyEarned: collectorEarned && !existing.collector,
      value: stats.tiarasCollected,
      target: stats.tiarasTotal,
    });

    // Speed Run: under par time
    const timeSeconds = Math.floor(stats.timeFrames / 60);
    const speedEarned = timeSeconds <= stats.parTime;
    results.push({
      type: 'speedrun',
      label: 'Speed Run',
      earned: speedEarned,
      newlyEarned: speedEarned && !existing.speedrun,
      value: timeSeconds,
      target: stats.parTime,
    });

    // Flawless: zero hits taken
    const flawlessEarned = stats.hitsTaken === 0;
    results.push({
      type: 'flawless',
      label: 'Flawless',
      earned: flawlessEarned,
      newlyEarned: flawlessEarned && !existing.flawless,
      value: stats.hitsTaken,
      target: 0,
    });

    return results;
  }

  award(levelIndex, results) {
    if (!this.medals[levelIndex]) {
      this.medals[levelIndex] = { collector: false, speedrun: false, flawless: false };
    }
    for (const r of results) {
      if (r.earned) {
        this.medals[levelIndex][r.type] = true;
      }
    }
    this._save();
  }

  getMedals(levelIndex) {
    return this.medals[levelIndex] || { collector: false, speedrun: false, flawless: false };
  }

  getTotalEarned() {
    let count = 0;
    const n = getLevelCount();
    for (let i = 0; i < n; i++) {
      const m = this.medals[i] || {};
      if (m.collector) count++;
      if (m.speedrun) count++;
      if (m.flawless) count++;
    }
    return count;
  }

  getTotalPossible() {
    return getLevelCount() * 3;
  }

  reset() {
    this.medals = this._createEmpty();
    this._save();
  }
}
