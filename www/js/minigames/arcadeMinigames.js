// ============================================================
// ARCADE MINIGAMES — Slot / claw / hoops bonus rooms
// State machines + audio cues. Renderer reads these fields.
// ============================================================

import { W, H } from '../constants';

export const SLOT_SYMBOLS_COUNT = 5;
export const SLOT_REEL_VIRTUAL = 36; // virtual rows on each strip

/** @param {'slot'|'claw'|'hoops'} kind */
export function createMiniState(kind) {
  switch (kind) {
    case 'slot':
      return {
        kind,
        phase: 'prompt',
        timer: 0,
        scroll: [0, 0, 0],
        scrollVel: [0, 0, 0],
        finalSym: [0, 0, 0],
        stopAt: [60, 78, 96],
        spinT: 0,
        spinFrame: 0,
        win: false,
        winType: 'none',
        _spinTickPlayed: 0,
      };
    case 'claw':
      return {
        kind,
        phase: 'aim',
        x: W / 2,
        vx: 2.6,
        y: 138,
        dropY: 410,
        prizeLane: { l: W * 0.42, r: W * 0.58 },
        win: false,
        prizeKind: null,
        timer: 0,
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
        timer: 0,
        trail: [],
      };
    default:
      return {
        kind: 'slot',
        phase: 'prompt',
        timer: 0,
        scroll: [0, 0, 0],
        scrollVel: [0, 0, 0],
        finalSym: [0, 0, 0],
        stopAt: [60, 78, 96],
        spinT: 0,
        spinFrame: 0,
        win: false,
        winType: 'none',
      };
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

// ---- Slot machine -----------------------------------------------------

function tickSlot(game, input, m) {
  if (m.phase === 'prompt') {
    if (input.jumpEdge || input.fireEdge) {
      m.phase = 'spin';
      m.spinFrame = 0;
      m.scrollVel = [0.85, 0.92, 0.99];
      const sym = Math.floor(Math.random() * SLOT_SYMBOLS_COUNT);
      const triple = Math.random() < 0.34;
      const pair = !triple && Math.random() < 0.42;
      if (triple) {
        m.finalSym = [sym, sym, sym];
      } else if (pair) {
        const other = (sym + 1 + Math.floor(Math.random() * (SLOT_SYMBOLS_COUNT - 1))) % SLOT_SYMBOLS_COUNT;
        m.finalSym = [sym, sym, other];
        if (Math.random() < 0.5) m.finalSym = [sym, other, sym];
      } else {
        m.finalSym = [
          sym,
          (sym + 1 + Math.floor(Math.random() * 4)) % SLOT_SYMBOLS_COUNT,
          (sym + 3 + Math.floor(Math.random() * 3)) % SLOT_SYMBOLS_COUNT,
        ];
      }
      m.stopAt = [62, 84, 108];
      game.audio.play('slotSpin');
    }
    return false;
  }

  if (m.phase === 'spin') {
    m.spinFrame++;
    for (let i = 0; i < 3; i++) {
      m.scroll[i] = (m.scroll[i] + m.scrollVel[i]) % 1;
      if (m.spinFrame >= m.stopAt[i] && m.scrollVel[i] > 0) {
        // Snap to final symbol — 0 = top window
        m.scroll[i] = (m.finalSym[i] + 0) / SLOT_SYMBOLS_COUNT;
        m.scrollVel[i] = 0;
        game.audio.play('slotStop');
      }
    }
    if (m.spinFrame % 4 === 0 && m.scrollVel.some((v) => v > 0)) {
      game.audio.play('slotSpin');
    }
    if (m.scrollVel.every((v) => v === 0)) {
      const all = m.finalSym[0] === m.finalSym[1] && m.finalSym[1] === m.finalSym[2];
      const pair =
        m.finalSym[0] === m.finalSym[1] ||
        m.finalSym[1] === m.finalSym[2] ||
        m.finalSym[0] === m.finalSym[2];
      if (all) {
        m.win = true;
        m.winType = 'jackpot';
        grantBonus(game, { score: 280, lives: 1 });
        game.audio.play('slotWin');
      } else if (pair) {
        m.win = true;
        m.winType = 'pair';
        grantBonus(game, { score: 120 });
        game.audio.play('coin');
      } else {
        m.win = false;
        m.winType = 'none';
        grantBonus(game, { score: 40 });
        game.audio.play('slotLose');
      }
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

// ---- Claw -------------------------------------------------------------

const CLAW_PRIZE_KINDS = ['heart', 'gem', 'tiara', 'star'];

function tickClaw(game, input, m) {
  const left = 90;
  const right = W - 90;

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
      game.audio.play('clawDrop');
    }
    return false;
  }

  if (m.phase === 'drop') {
    m.y += 7;
    if (m.y >= m.dropY) {
      const win = m.x > m.prizeLane.l && m.x < m.prizeLane.r;
      m.win = win;
      if (win) {
        m.prizeKind = CLAW_PRIZE_KINDS[Math.floor(Math.random() * CLAW_PRIZE_KINDS.length)];
        if (m.prizeKind === 'heart') {
          grantBonus(game, { score: 220, lives: 1 });
          game.audio.play('oneUp');
        } else {
          grantBonus(game, { score: 380 });
          game.audio.play('clawWin');
        }
      } else {
        grantBonus(game, { score: 60 });
        game.audio.play('clawMiss');
      }
      m.phase = 'lift';
    }
    return false;
  }

  if (m.phase === 'lift') {
    m.y -= 5;
    if (m.y <= 138) {
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

// ---- Hoops ------------------------------------------------------------

const HOOP_X = W - 96;
const HOOP_Y = 296;
const HOOP_R = 22;
const FLOOR_Y = H - 168;

function tickHoops(game, input, m) {
  if (m.phase === 'aim') {
    m.meter += 0.052 * m.meterDir;
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
        x: 70,
        y: FLOOR_Y - 30,
        vx: 5.4 + power * 7.6,
        vy: -11 - power * 4.6,
      };
      m.trail = [];
      m.phase = 'fly';
      game.audio.play('hoopShoot');
    }
    return false;
  }

  if (m.phase === 'fly' && m.ball) {
    const b = m.ball;
    b.vy += 0.42;
    b.x += b.vx;
    b.y += b.vy;
    if (m.trail.length > 18) m.trail.shift();
    m.trail.push({ x: b.x, y: b.y });

    // Backboard
    if (b.x > HOOP_X + HOOP_R && b.vx > 0 && b.y < HOOP_Y + 20) {
      b.vx *= -0.55;
      b.x = HOOP_X + HOOP_R - 1;
      game.audio.play('uiClick');
    }

    if (!m.scored) {
      const dx = b.x - HOOP_X;
      const dy = b.y - HOOP_Y;
      const through = b.vy > 0 && Math.abs(dx) < HOOP_R - 3 && Math.abs(dy) < 10;
      if (through) {
        m.scored = true;
        m.win = true;
        grantBonus(game, { score: 420 });
        if (Math.random() < 0.5) grantBonus(game, { lives: 1 });
        game.audio.play('hoopSwish');
      }
    }

    if (b.y >= FLOOR_Y - 6) {
      b.y = FLOOR_Y - 6;
      m.phase = 'done';
      m.timer = 95;
      if (!m.scored) {
        m.win = false;
        grantBonus(game, { score: 70 });
        game.audio.play('hoopMiss');
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

export const HOOPS_GEOM = { hoopX: HOOP_X, hoopY: HOOP_Y, hoopR: HOOP_R, floorY: FLOOR_Y };
