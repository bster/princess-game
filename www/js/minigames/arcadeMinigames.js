// ============================================================
// ARCADE MINIGAMES — Slot / claw / hoops bonus rooms
// ============================================================

import { W, H } from '../constants';

/** @param {'slot'|'claw'|'hoops'} kind */
export function createMiniState(kind) {
  switch (kind) {
    case 'slot':
      return {
        kind,
        phase: 'prompt',
        timer: 0,
        reels: [
          Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 5),
        ],
        spinT: 0,
        win: false,
      };
    case 'claw':
      return {
        kind,
        phase: 'aim',
        x: W / 2,
        vx: 2.7,
        y: 135,
        dropY: 385,
        win: false,
      };
    case 'hoops':
      return {
        kind,
        phase: 'aim',
        meter: 0,
        meterDir: 1,
        ball: null,
        scored: false,
        win: false,
      };
    default:
      return { kind: 'slot', phase: 'prompt', timer: 0, reels: [0, 0, 0], spinT: 0, win: false };
  }
}

/**
 * @returns {boolean} true when returning to overworld
 */
export function tickMini(game, input) {
  const m = game.mini;
  if (!m) return true;

  if (m.kind === 'slot') return tickSlot(game, input, m);
  if (m.kind === 'claw') return tickClaw(game, input, m);
  if (m.kind === 'hoops') return tickHoops(game, input, m);
  return true;
}

function grantBonus(game, { score = 0, lives = 0 }) {
  game.score += score;
  if (lives > 0) game.lives += lives;
}

function tickSlot(game, input, m) {
  if (m.phase === 'prompt') {
    if (input.jumpEdge || input.fireEdge) {
      m.phase = 'spin';
      m.spinT = 96;
    }
    return false;
  }

  if (m.phase === 'spin') {
    m.spinT--;
    m.reels = m.reels.map(() => Math.floor(Math.random() * 5));
    if (m.spinT <= 0) {
      let sym = Math.floor(Math.random() * 5);
      if (Math.random() < 0.38) {
        m.reels = [sym, sym, sym];
      } else {
        m.reels = [
          sym,
          (sym + 1 + Math.floor(Math.random() * 4)) % 5,
          (sym + 3 + Math.floor(Math.random() * 3)) % 5,
        ];
      }
      const win = m.reels[0] === m.reels[1] && m.reels[1] === m.reels[2];
      m.win = win;
      if (win) grantBonus(game, { score: 220, lives: 1 });
      else grantBonus(game, { score: 55 });
      m.phase = 'result';
      m.timer = 130;
    }
    return false;
  }

  if (m.phase === 'result') {
    m.timer--;
    if (m.timer <= 0 || input.jumpEdge || input.fireEdge) return true;
  }

  return false;
}

function tickClaw(game, input, m) {
  const left = 96;
  const right = W - 96;

  if (m.phase === 'aim') {
    m.x += m.vx;
    if (m.x > right) {
      m.x = right;
      m.vx *= -1;
    }
    if (m.x < left) {
      m.x = left;
      m.vx *= -1;
    }
    if (input.jumpEdge || input.fireEdge) {
      m.phase = 'drop';
      m.dropVy = 0;
    }
    return false;
  }

  if (m.phase === 'drop') {
    m.y += 7;
    if (m.y >= m.dropY) {
      const bandL = W * 0.38;
      const bandR = W * 0.62;
      const win = m.x > bandL && m.x < bandR;
      m.win = win;
      if (win) {
        grantBonus(game, { score: 380 });
        if (Math.random() < 0.5) grantBonus(game, { lives: 1 });
      } else {
        grantBonus(game, { score: 70 });
      }
      m.phase = 'lift';
    }
    return false;
  }

  if (m.phase === 'lift') {
    m.y -= 5;
    if (m.y <= 135) {
      m.phase = 'done';
      m.timer = 110;
    }
    return false;
  }

  if (m.phase === 'done') {
    m.timer--;
    if (m.timer <= 0 || input.jumpEdge || input.fireEdge) return true;
  }

  return false;
}

function tickHoops(game, input, m) {
  if (m.phase === 'aim') {
    m.meter += 0.045 * m.meterDir;
    if (m.meter >= 1) {
      m.meter = 1;
      m.meterDir = -1;
    } else if (m.meter <= 0) {
      m.meter = 0;
      m.meterDir = 1;
    }
    if (input.jumpEdge || input.fireEdge) {
      const power = m.meter;
      m.ball = {
        x: 72,
        y: H - 210,
        vx: 6.4 + power * 9,
        vy: -11.5 - power * 7,
        landed: false,
      };
      m.phase = 'fly';
    }
    return false;
  }

  if (m.phase === 'fly' && m.ball) {
    const b = m.ball;
    b.vy += 0.42;
    b.x += b.vx;
    b.y += b.vy;

    const hoopX = W - 118;
    const hoopY = 268;
    const inWindow =
      b.x > hoopX - 14 &&
      b.x < hoopX + 28 &&
      b.y > hoopY - 40 &&
      b.y < hoopY + 10 &&
      b.vy > 0;

    if (inWindow && !m.scored) {
      m.scored = true;
      m.win = true;
      grantBonus(game, { score: 420 });
      if (Math.random() < 0.4) grantBonus(game, { lives: 1 });
    }

    if (b.y > H - 140 && !b.landed) {
      b.landed = true;
      m.phase = 'done';
      m.timer = 95;
      if (!m.scored) {
        m.win = false;
        grantBonus(game, { score: 80 });
      }
    }
    return false;
  }

  if (m.phase === 'done') {
    m.timer--;
    if (m.timer <= 0 || input.jumpEdge || input.fireEdge) return true;
  }

  return false;
}
