// ============================================================
// FIRE ABILITY — Shoot fireballs on B button
// ============================================================

import { Ability } from './ability';
import { FIRE_DURATION, FIRE_COOLDOWN } from '../constants';

export class FireAbility extends Ability {
  constructor() {
    super('fire', FIRE_DURATION);
    this.cooldown = 0;
    this.shotRequested = false;
  }

  update(player) {
    super.update(player);
    this.shotRequested = false;
    if (this.cooldown > 0) this.cooldown--;
  }

  tryFire(input) {
    if (input.fireEdge && this.cooldown <= 0) {
      this.cooldown = FIRE_COOLDOWN;
      this.shotRequested = true;
      return true;
    }
    return false;
  }
}
