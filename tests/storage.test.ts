import { describe, expect, it, beforeEach, vi } from 'vitest';

const KEY_RUN = 'princessfrank_run';

describe('progressSave + leaderboard (localStorage)', () => {
  beforeEach(() => {
    const bag: Record<string, string> = {};
    const ls = {
      getItem(k: string) {
        return bag[k] ?? null;
      },
      setItem(k: string, v: string) {
        bag[k] = v;
      },
      removeItem(k: string) {
        delete bag[k];
      },
      clear() {
        for (const k of Object.keys(bag)) delete bag[k];
      },
      key() {
        return null;
      },
      get length() {
        return Object.keys(bag).length;
      },
    };
    vi.stubGlobal('localStorage', ls);
    vi.resetModules();
  });

  it('saveRun round-trips', async () => {
    const ProgressSave = await import('../www/js/progressSave.js');
    ProgressSave.saveRun({
      levelIndex: 2,
      lives: 3,
      score: 1200,
      character: 'princess',
      tiaraCount: 4,
      nextLifeTiaras: 10,
      secretsCollected: ['0-0'],
    });
    expect(JSON.parse(localStorage.getItem(KEY_RUN)!)).toMatchObject({
      levelIndex: 2,
      lives: 3,
      score: 1200,
    });
  });

  it('loadRun rejects invalid lives', async () => {
    localStorage.setItem(
      KEY_RUN,
      JSON.stringify({
        levelIndex: 0,
        lives: 0,
        character: 'princess',
        tiaraCount: 0,
        nextLifeTiaras: 10,
        secretsCollected: [],
      })
    );
    const ProgressSave = await import('../www/js/progressSave.js');
    expect(ProgressSave.loadRun()).toBeNull();
  });

  it('leaderboard sorts and caps', async () => {
    const LB = await import('../www/js/leaderboard.js');
    LB.addLeaderboardEntry('A', 50, 'princess');
    LB.addLeaderboardEntry('B', 200, 'frank');
    LB.addLeaderboardEntry('C', 100, 'princess');
    const top = LB.getLeaderboardTop(2);
    expect(top[0].score).toBe(200);
    expect(top[1].score).toBe(100);
  });
});
