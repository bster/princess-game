// ============================================================
// SHOOTER ENEMY — Stationary, fires at player in range
// ============================================================

import { Enemy } from './enemy.js';
import { ENEMY_HP } from '../../constants.js';

export class ShooterEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 36, 40, ENEMY_HP.shooter);
    this.type = 'shooter';
    this.subtype = 'shooter';
    this.shootCooldown = 0;
    this.shootRate = 90; // frames between shots
    this.range = 250; // detection range
    this.shotRequested = false;
  }

  update(playerX) {
    super.update();
    if (!this.alive) return;

    this.shotRequested = false;

    // Face player
    if (playerX !== undefined) {
      this.facing = playerX > this.x ? 1 : -1;

      // Shoot if player in range
      const dist = Math.abs(playerX - this.x);
      if (dist < this.range && this.shootCooldown <= 0) {
        this.shotRequested = true;
        this.shootCooldown = this.shootRate;
      }
    }

    if (this.shootCooldown > 0) this.shootCooldown--;
  }
}
