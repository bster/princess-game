// ============================================================
// LOCAL LEADERBOARD — High scores (device storage)
// ============================================================

const KEY = 'princessfrank_leaderboard';
const MAX_ENTRIES = 12;

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function addLeaderboardEntry(name, score, character) {
  const clean = (name || 'Traveler').trim().slice(0, 14) || 'Traveler';
  const list = loadLeaderboard();
  list.push({
    name: clean,
    score: Math.max(0, Math.floor(score)),
    character: character === 'frank' ? 'frank' : 'princess',
    t: Date.now(),
  });
  list.sort((a, b) => b.score - a.score);
  persist(list.slice(0, MAX_ENTRIES));
}

export function getLeaderboardTop(n = MAX_ENTRIES) {
  return loadLeaderboard().slice(0, n);
}
