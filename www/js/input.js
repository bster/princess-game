// ============================================================
// INPUT MANAGER — Touch (zoned), mouse, keyboard
// ============================================================

import { W, H } from './constants';

export const TOUCH_LAYOUT = {
  dpad: { cx: 84, cy: H - 90, r: 84 },
  jump: { cx: W - 64, cy: H - 90, r: 50 },
  fire: { cx: W - 64, cy: H - 180, r: 38 },
};

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.left = false;
    this.right = false;
    this.down = false;
    this.up = false;
    this.jumpPressed = false;
    this.jumpEdge = false;
    this.firePressed = false;
    this.fireEdge = false;
    this._prevJump = false;
    this._prevFire = false;
    this._kbWasActive = false;

    this._mouseDown = false;
    this._mouseX = 0;
    this._mouseY = 0;

    this._keys = {};
    this._tapThisFrame = null;

    this.keyLEdge = false;
    this._prevKeyL = false;
    this._prevKeyC = false;
    this.keyCEdge = false;
    this.keyMEdge = false;
    this._prevKeyM = false;
    this.escapeEdge = false;
    this._prevEscape = false;

    this._bindTouch();
    this._bindMouse();
    this._bindKeyboard();
  }

  _setPointerFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouseX = ((e.clientX - rect.left) / rect.width) * W;
    this._mouseY = ((e.clientY - rect.top) / rect.height) * H;
  }

  consumeTap() {
    const t = this._tapThisFrame;
    this._tapThisFrame = null;
    return t;
  }

  _resetVirtual() {
    this.left = false;
    this.right = false;
    this.down = false;
    this.up = false;
    this.jumpPressed = false;
    this.firePressed = false;
  }

  _applyTouchPoint(px, py) {
    const dp = TOUCH_LAYOUT.dpad;
    const jb = TOUCH_LAYOUT.jump;
    const fb = TOUCH_LAYOUT.fire;

    // Jump (largest right-side button, check first so corners go to it)
    if (dist(px, py, jb.cx, jb.cy) <= jb.r) {
      this.jumpPressed = true;
      return;
    }
    // Fire
    if (dist(px, py, fb.cx, fb.cy) <= fb.r) {
      this.firePressed = true;
      return;
    }
    // D-pad
    if (dist(px, py, dp.cx, dp.cy) <= dp.r) {
      const dx = px - dp.cx;
      const dy = py - dp.cy;
      const a = Math.atan2(dy, dx); // -PI..PI
      const deg = (a * 180) / Math.PI;
      // 8-way classification via half-circle arcs
      // right: |deg| < 22.5 → right
      // up-right etc.
      const ad = Math.abs(deg);
      if (ad <= 22.5) {
        this.right = true;
      } else if (ad >= 157.5) {
        this.left = true;
      } else if (deg > 22.5 && deg < 67.5) {
        this.right = true;
        this.down = true;
      } else if (deg >= 67.5 && deg <= 112.5) {
        this.down = true;
      } else if (deg > 112.5 && deg < 157.5) {
        this.left = true;
        this.down = true;
      } else if (deg < -22.5 && deg > -67.5) {
        this.right = true;
        this.up = true;
      } else if (deg <= -67.5 && deg >= -112.5) {
        this.up = true;
      } else if (deg < -112.5 && deg > -157.5) {
        this.left = true;
        this.up = true;
      }
      return;
    }
    // Outside controls — used only as a tap (consumed elsewhere)
  }

  _bindTouch() {
    const opts = { passive: false };
    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        if (e.changedTouches && e.changedTouches.length > 0) {
          const t = e.changedTouches[0];
          this._setPointerFromEvent(t);
          this._tapThisFrame = { x: this._mouseX, y: this._mouseY };
        }
        this._handleTouches(e.touches);
      },
      opts
    );
    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        this._handleTouches(e.touches);
      },
      opts
    );
    this.canvas.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        this._handleTouches(e.touches);
      },
      opts
    );
    this.canvas.addEventListener(
      'touchcancel',
      (e) => {
        e.preventDefault();
        this._handleTouches(e.touches);
      },
      opts
    );
  }

  _bindMouse() {
    this.canvas.addEventListener('mousemove', (e) => {
      this._setPointerFromEvent(e);
      if (this._mouseDown) this._updateMouse(e);
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this._setPointerFromEvent(e);
      this._tapThisFrame = { x: this._mouseX, y: this._mouseY };
      this._mouseDown = true;
      this._updateMouse(e);
    });
    this.canvas.addEventListener('mouseup', () => {
      this._mouseDown = false;
      this._resetVirtual();
    });
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      this._keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this._keys[e.code] = false;
    });
  }

  _updateMouse() {
    this._resetVirtual();
    if (!this._mouseDown) return;
    this._applyTouchPoint(this._mouseX, this._mouseY);
  }

  _handleTouches(touchList) {
    this._resetVirtual();
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < touchList.length; i++) {
      const t = touchList[i];
      const tx = ((t.clientX - rect.left) / rect.width) * W;
      const ty = ((t.clientY - rect.top) / rect.height) * H;
      this._applyTouchPoint(tx, ty);
    }
  }

  update() {
    const kbLeft = !!(this._keys['ArrowLeft'] || this._keys['KeyA']);
    const kbRight = !!(this._keys['ArrowRight'] || this._keys['KeyD']);
    const kbDown = !!(this._keys['ArrowDown'] || this._keys['KeyS']);
    const kbUp = !!(this._keys['ArrowUp'] || this._keys['KeyW']);
    const kbJump = !!this._keys['Space'];
    const kbFire = !!(this._keys['KeyX'] || this._keys['ShiftLeft'] || this._keys['ShiftRight']);
    const kbActive = kbLeft || kbRight || kbJump || kbDown || kbUp || kbFire;

    if (kbActive || this._kbWasActive) {
      this.left = kbLeft;
      this.right = kbRight;
      this.down = kbDown;
      this.up = kbUp;
      this.jumpPressed = kbJump;
      this.firePressed = kbFire;
    }
    this._kbWasActive = kbActive;

    const keyL = !!this._keys['KeyL'];
    this.keyLEdge = keyL && !this._prevKeyL;
    this._prevKeyL = keyL;

    const keyC = !!this._keys['KeyC'];
    this.keyCEdge = keyC && !this._prevKeyC;
    this._prevKeyC = keyC;

    const keyM = !!this._keys['KeyM'];
    this.keyMEdge = keyM && !this._prevKeyM;
    this._prevKeyM = keyM;

    const escKey = !!this._keys['Escape'];
    this.escapeEdge = escKey && !this._prevEscape;
    this._prevEscape = escKey;

    this.jumpEdge = this.jumpPressed && !this._prevJump;
    this._prevJump = this.jumpPressed;
    this.fireEdge = this.firePressed && !this._prevFire;
    this._prevFire = this.firePressed;
  }
}
