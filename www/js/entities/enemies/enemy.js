// ============================================================
// BASE ENEMY — HP, stomp, knockback, die
// ============================================================

import { Entity } from '../entity';

export class Enemy extends Entity {
  constructor(x, y, w, h, hp) {
    super(x, y, w, h);
    this.hp = hp || 1;
    this.maxHp = this.hp;
    this.squishTimer = 0;
    this.type = 'patrol';
  }

  takeDamage(amount) {
    this.hp -= amount || 1;
    if (this.hp <= 0) {
      this.alive = false;
      this.squishTimer = 40;
      return true;
    }
    return false;
  }

  update() {
    if (!this.alive) {
      if (this.squishTimer > 0) this.squishTimer--;
      return;
    }
    this.frame++;
    if (this.flashTimer > 0) this.flashTimer--;
  }
}
