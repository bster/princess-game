// ============================================================
// SHIELD ABILITY — Absorbs 3 hits
// ============================================================

import { Ability } from './ability.js';
import { SHIELD_DURATION } from '../constants.js';

export class ShieldAbility extends Ability {
  constructor() {
    super('shield', SHIELD_DURATION);
    this.hits = 3;
  }

  absorbHit() {
    if (this.hits > 0) {
      this.hits--;
      if (this.hits <= 0) this.expired = true;
      return true;
    }
    return false;
  }

  resetTimer() {
    super.resetTimer();
    this.hits = 3;
  }
}
