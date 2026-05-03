// ============================================================
// CAMERA — Smooth horizontal follow with look-ahead + trauma shake
// ============================================================

import { W } from './constants';

const FOLLOW_LERP = 0.11;
const LOOK_AHEAD_PX = 64;
const LOOK_AHEAD_LERP = 0.05;

export class Camera {
  constructor() {
    this.x = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this._trauma = 0;
    this._shakeFrame = 0;
    this._frozen = false;
    this._lookAhead = 0;
  }

  shake(intensity, _duration) {
    this._trauma = Math.min(1.0, this._trauma + intensity * 0.07);
  }

  freeze() {
    this._frozen = true;
  }
  unfreeze() {
    this._frozen = false;
  }

  update(targetX, levelWidth, facing) {
    if (this._frozen) {
      this._updateShake();
      return;
    }

    const desiredLook = (facing || 1) * LOOK_AHEAD_PX;
    this._lookAhead += (desiredLook - this._lookAhead) * LOOK_AHEAD_LERP;

    const camTarget = targetX + this._lookAhead - W * 0.46;
    this.x += (camTarget - this.x) * FOLLOW_LERP;
    if (this.x < 0) this.x = 0;
    if (levelWidth && this.x > levelWidth - W) this.x = Math.max(0, levelWidth - W);

    this._updateShake();
  }

  _updateShake() {
    if (this._trauma > 0) {
      this._shakeFrame++;
      const shake = this._trauma * this._trauma;
      const maxOffset = 10;
      this.shakeX = maxOffset * shake * Math.sin(this._shakeFrame * 0.7 + 1.3);
      this.shakeY = maxOffset * shake * Math.sin(this._shakeFrame * 0.9 + 2.7);
      this._trauma = Math.max(0, this._trauma - 0.022);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  get renderX() {
    return this.x + this.shakeX;
  }

  get renderY() {
    return this.shakeY;
  }
}
