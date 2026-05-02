// ============================================================
// SHOOTER ENEMY — Stationary turret, faces player and fires
// ============================================================

import { Entity } from '../entity';
import { ENEMY_HP } from '../../constants';

export class ShooterEnemy extends Entity {
  constructor(x, y) {
    super(x, y, 40, 44);
    this.type = 'shooter';
    this.subtype = 'shooter';
    this.hp = ENEMY_HP.shooter;
    this.maxHp = this.hp;
    this.shootCooldown = 55;
    this.shotRequested = false;
    this.squishTimer = 0;
  }

  update(playerX) {
    if (!this.alive) return;
    this.frame++;
    this.shotRequested = false;
    this.facing = playerX >= this.x ? 1 : -1;
    this.shootCooldown--;
    if (this.shootCooldown <= 0) {
      this.shotRequested = true;
      this.shootCooldown = 95;
    }
  }

  takeDamage(dmg) {
    if (!this.alive) return false;
    this.hp -= dmg;
    this.flashTimer = 8;
    if (this.hp <= 0) {
      this.alive = false;
      this.squishTimer = 48;
      return true;
    }
    return false;
  }
}
