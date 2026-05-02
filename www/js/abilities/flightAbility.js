// ============================================================
// FLIGHT ABILITY — Hold jump in air for near-zero gravity
// ============================================================

import { Ability } from './ability.js';
import { FLIGHT_DURATION } from '../constants.js';

export class FlightAbility extends Ability {
  constructor() {
    super('flight', FLIGHT_DURATION);
  }

  modifyGravity(player, input) {
    // If in air and holding jump, reduced gravity (glide, not fly)
    if (!player.onGround && input.jumpPressed) {
      return 0.4;
    }
    return 1;
  }

  modifyMaxFall(player) {
    return 6; // Slower fall, but not hovering
  }
}
