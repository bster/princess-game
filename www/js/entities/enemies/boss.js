// ============================================================
// BOSS — Goblin King, arena-bound with phased attacks
// ============================================================

import { Entity } from '../entity.js';
import { ENEMY_HP, BOSS_PHASE1_HP, BOSS_PHASE2_HP } from '../../constants.js';

export class Boss extends Entity {
  constructor(x, y) {
    super(x, y, 80, 118);
    this.type = 'boss';
    this.subtype = 'boss';
    this.hp = ENEMY_HP.boss;
    this.maxHp = this.hp;
    this.arenaLeft = 0;
    this.arenaRight = 99999;
    this.attackTimer = 90;
    this._attackCycle = 0;
    this.summonRequested = false;
    this.slamRequested = false;
    this.throwRequested = false;
    this.squishTimer = 0;
  }

  setArena(left, right) {
    this.arenaLeft = left;
    this.arenaRight = right;
  }

  get phase() {
    if (this.hp > BOSS_PHASE1_HP) return 1;
    if (this.hp > BOSS_PHASE2_HP) return 2;
    return 3;
  }

  get dazed() {
    return this.flashTimer > 0;
  }

  update(playerX) {
    if (!this.alive) return;
    this.frame++;
    this.summonRequested = false;
    this.slamRequested = false;
    this.throwRequested = false;

    const margin = 44;
    const minX = this.arenaLeft + margin;
    const maxX = this.arenaRight - margin;
    this.facing = playerX >= this.x ? 1 : -1;

    // Slow drift toward player, clamped to arena
    const drift = this.facing * (this.phase >= 3 ? 0.55 : 0.35);
    this.x += drift;
    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;

    this.attackTimer--;
    if (this.attackTimer > 0) return;

    const ph = this.phase;
    if (ph === 1) {
      this.throwRequested = true;
      this.attackTimer = 110;
    } else if (ph === 2) {
      if (this._attackCycle % 2 === 0) this.slamRequested = true;
      else this.summonRequested = true;
      this._attackCycle++;
      this.attackTimer = 95;
    } else {
      const m = this.frame % 3;
      if (m === 0) this.throwRequested = true;
      else if (m === 1) this.slamRequested = true;
      else this.summonRequested = true;
      this.attackTimer = 72;
    }
  }

  takeDamage(dmg) {
    if (!this.alive) return false;
    this.hp -= dmg;
    this.flashTimer = 14;
    if (this.hp <= 0) {
      this.alive = false;
      this.squishTimer = 96;
      return true;
    }
    return false;
  }
}
