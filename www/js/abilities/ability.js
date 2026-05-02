// ============================================================
// BASE ABILITY — Duration, timer, hooks
// ============================================================

export class Ability {
  constructor(type, duration) {
    this.type = type;
    this.duration = duration;
    this.timer = duration;
    this.expired = false;
  }

  update(player) {
    this.timer--;
    if (this.timer <= 0) this.expired = true;
  }

  resetTimer() {
    this.timer = this.duration;
    this.expired = false;
  }

  onActivate(player) {}
  onExpire(player) {}
  onPlayerDraw(ctx, player) {}
  modifyGravity(player, input) { return 1; }
  modifyMaxFall(player) { return 14; }
  modifyHitbox(player) { return { w: player.w, h: player.h }; }

  get remaining() { return this.timer; }
  get total() { return this.duration; }
}
