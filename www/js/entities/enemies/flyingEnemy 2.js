// ============================================================
// FLYING ENEMY — Sine-wave flight, bat sprite
// ============================================================

import { Enemy } from './enemy.js';
import { ENEMY_HP } from '../../constants.js';

export class FlyingEnemy extends Enemy {
  constructor(x, y, patrol) {
    super(x, y, 36, 28, ENEMY_HP.flying);
    this.type = 'flying';
    this.subtype = 'flying';
    this.startX = x;
    this.startY = y;
    this.patrol = patrol || 100;
    this.vx = 1.2;
    this.sineOffset = Math.random() * Math.PI * 2;
  }

  update() {
    super.update();
    if (!this.alive) return;

    this.x += this.vx;
    if (this.x > this.startX + this.patrol || this.x < this.startX - this.patrol) {
      this.vx *= -1;
    }
    this.facing = this.vx > 0 ? 1 : -1;

    // Sine wave vertical movement
    this.y = this.startY + Math.sin(this.frame * 0.04 + this.sineOffset) * 30;
  }
}
