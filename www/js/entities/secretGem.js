// ============================================================
// SECRET GEM — Hidden score pickup (center-x, top-y like tiara)
// ============================================================

import { Entity } from './entity.js';

export class SecretGem extends Entity {
  constructor(id, x, y) {
    super(x, y, 22, 18);
    this.id = id;
    this.collected = false;
    this.frame = Math.random() * 100 | 0;
    this.reveal = 0;
  }

  update() {
    this.frame++;
    if (!this.collected && this.reveal < 1) {
      this.reveal += 0.02;
    }
  }
}
