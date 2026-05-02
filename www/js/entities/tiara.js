// ============================================================
// TIARA — Collectible
// ============================================================

import { Entity } from './entity.js';

export class Tiara extends Entity {
  constructor(x, y) {
    super(x, y, 24, 20);
    this.collected = false;
    this.frame = Math.random() * 100 | 0;
  }

  update() {
    this.frame++;
  }
}
