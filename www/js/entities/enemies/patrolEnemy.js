// ============================================================
// PATROL ENEMY — Goblin / slime walking back and forth
// ============================================================

import { Entity } from '../entity';
import { ENEMY_HP } from '../../constants';

export class PatrolEnemy extends Entity {
  constructor(x, y, w, h, subtype, patrolRange, speedMult = 1) {
    super(x, y, w, h);
    this.type = 'patrol';
    this.subtype = subtype || 'goblin';
    this.startX = x;
    this.patrolRange = patrolRange ?? 80;
    this.moveSpeed = 1.2 * speedMult;
    this.vx = -1;
    this.hp = ENEMY_HP.patrol;
    this.maxHp = this.hp;
    this.squishTimer = 0;
  }

  update() {
    if (!this.alive) return;
    this.frame++;
    this.x += this.vx * this.moveSpeed;
    if (this.x >= this.startX + this.patrolRange) this.vx = -1;
    if (this.x <= this.startX - this.patrolRange) this.vx = 1;
  }

  takeDamage(dmg) {
    if (!this.alive) return false;
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.alive = false;
      this.squishTimer = 48;
      return true;
    }
    return false;
  }
}
