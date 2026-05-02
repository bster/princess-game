// ============================================================
// GROWTH ABILITY — 1.5x size, +1 HP
// ============================================================

import { Ability } from './ability';
import { GROWTH_DURATION } from '../constants';

export class GrowthAbility extends Ability {
  constructor() {
    super('growth', GROWTH_DURATION);
  }

  onActivate(player) {
    player.maxHp = 2;
    player.hp = Math.min(player.hp + 1, player.maxHp);
  }

  onExpire(player) {
    player.maxHp = 1;
    player.hp = Math.min(player.hp, player.maxHp);
  }

  modifyHitbox(player) {
    return { w: player.w * 1.5, h: player.h * 1.5 };
  }

  resetTimer() {
    super.resetTimer();
  }
}
