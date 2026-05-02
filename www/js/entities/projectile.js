// ============================================================
// PROJECTILE — Fireballs + enemy shots
// ============================================================

import { Entity } from './entity';

export class Projectile extends Entity {
  constructor(x, y, vx, vy, owner, damage, type) {
    const size = type === 'fireball' ? 14 : 10;
    super(x, y, size, size);
    this.vx = vx;
    this.vy = vy;
    this.owner = owner; // 'player' or 'enemy'
    this.damage = damage || 1;
    this.type = type || 'fireball';
    this.lifetime = 180; // 3 seconds
    this.gravity = type === 'fireball' ? 0.08 : 0;
    this.facing = vx > 0 ? 1 : -1;
  }

  update() {
    this.frame++;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.lifetime--;
    if (this.lifetime <= 0) this.alive = false;
  }
}
