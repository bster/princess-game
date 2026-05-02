// ============================================================
// PATROL ENEMY — Goblin/Slime patrol behavior
// ============================================================

import { Enemy } from './enemy.js';
import { ENEMY_HP } from '../../constants.js';

export class PatrolEnemy extends Enemy {
  constructor(x, y, w, h, subtype, patrol, speed) {
    super(x, y, w, h, ENEMY_HP.patrol);
    this.subtype = subtype || 'goblin'; // 'goblin' or 'slime'
    this.type = 'patrol';
    this.startX = x;
    this.patrol = patrol || 80;
    this.vx = speed || (subtype === 'slime' ? 1.5 : 1);
  }

  update() {
    super.update();
    if (!this.alive) return;

    this.x += this.vx;
    if (this.x > this.startX + this.patrol || this.x < this.startX - this.patrol) {
      this.vx *= -1;
    }
    this.facing = this.vx > 0 ? 1 : -1;
  }
}
