// ============================================================
// FLYING ENEMY — Bat-goblin, horizontal patrol at fixed height
// ============================================================

import { Entity } from '../entity';
import { ENEMY_HP } from '../../constants';

export class FlyingEnemy extends Entity {
  constructor(x, y, patrolRange = 100) {
    super(x, y, 44, 36);
    this.type = 'flying';
    this.subtype = 'flying';
    this.startX = x;
    this.anchorY = y;
    this.patrolRange = patrolRange;
    this.moveSpeed = 1.8;
    this.vx = -1;
    this.hp = ENEMY_HP.flying;
    this.maxHp = this.hp;
    this.squishTimer = 0;
  }

  update() {
    if (!this.alive) return;
    this.frame++;
    this.y = this.anchorY + Math.sin(this.frame * 0.06) * 6;
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
