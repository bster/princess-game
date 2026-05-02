// ============================================================
// POWER-UP ITEM — Collectible orb that grants ability
// ============================================================

import { Entity } from './entity';

export class PowerUpItem extends Entity {
  constructor(x, y, type) {
    super(x, y, 24, 24);
    this.type = type; // 'fire', 'flight', 'shield', 'growth'
    this.collected = false;
    this.frame = (Math.random() * 100) | 0;
  }

  update() {
    this.frame++;
  }
}
