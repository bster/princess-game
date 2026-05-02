// ============================================================
// CAMERA — Lerp follow + look-ahead + trauma-based shake
// ============================================================

import { W } from './constants';

export class Camera {
  constructor() {
    this.x = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this._trauma = 0;
    this._shakeFrame = 0;
    this._frozen = false; // freeze during death
  }

  shake(intensity, _duration) {
    this._trauma = Math.min(1.0, this._trauma + intensity * 0.08);
  }

  freeze() {
    this._frozen = true;
  }
  unfreeze() {
    this._frozen = false;
  }

  update(targetX, levelWidth, facing) {
    if (this._frozen) {
      // Still update shake, but don't follow
      this._updateShake();
      return;
    }

    // Look-ahead: shift 40px in facing direction
    const lookAhead = (facing || 1) * 40;
    const camTarget = targetX + lookAhead - W * 0.45;
    this.x += (camTarget - this.x) * 0.08; // slightly slower lerp for smoother look-ahead
    if (this.x < 0) this.x = 0;
    if (this.x > levelWidth - W) this.x = levelWidth - W;

    this._updateShake();
  }

  _updateShake() {
    if (this._trauma > 0) {
      this._shakeFrame++;
      const shake = this._trauma * this._trauma;
      const maxOffset = 12;
      this.shakeX = maxOffset * shake * Math.sin(this._shakeFrame * 0.7 + 1.3);
      this.shakeY = maxOffset * shake * Math.sin(this._shakeFrame * 0.9 + 2.7);
      this._trauma = Math.max(0, this._trauma - 0.02);
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
