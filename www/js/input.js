// ============================================================
// INPUT MANAGER — Touch, mouse, keyboard
// ============================================================

import { W, H } from './constants';

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.left = false;
    this.right = false;
    this.down = false;
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

    this._bindTouch();
    this._bindMouse();
    this._bindKeyboard();
  }

  _setPointerFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouseX = ((e.clientX - rect.left) / rect.width) * W;
    this._mouseY = ((e.clientY - rect.top) / rect.height) * H;
  }

  /** UI taps (title / leaderboard). Consumes one tap per call. */
  consumeTap() {
    const t = this._tapThisFrame;
    this._tapThisFrame = null;
    return t;
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
      this.left = false;
      this.right = false;
      this.jumpPressed = false;
      this.firePressed = false;
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

  _updateMouse(e) {
    this._setPointerFromEvent(e);
    this.left = false;
    this.right = false;
    this.down = false;
    this.jumpPressed = false;
    this.firePressed = false;
    if (this._mouseDown) {
      if (this._mouseX < W / 3) {
        const cx = 80,
          cy = H - 80;
        if (this._mouseY > cy + 20) this.down = true;
        else if (this._mouseX < cx) this.left = true;
        else this.right = true;
      } else {
        const btnDivide = H - 140;
        if (this._mouseY < btnDivide) {
          this.firePressed = true;
        } else {
          this.jumpPressed = true;
        }
      }
    }
  }

  _handleTouches(touchList) {
    this.left = false;
    this.right = false;
    this.down = false;
    this.jumpPressed = false;
    this.firePressed = false;
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < touchList.length; i++) {
      const t = touchList[i];
      const tx = ((t.clientX - rect.left) / rect.width) * W;
      const ty = ((t.clientY - rect.top) / rect.height) * H;
      if (tx < W / 3) {
        const cx = 80,
          cy = H - 80;
        if (ty > cy + 20) this.down = true;
        else if (tx < cx) this.left = true;
        else this.right = true;
      } else {
        const btnDivide = H - 140;
        if (ty < btnDivide) {
          this.firePressed = true;
        } else {
          this.jumpPressed = true;
        }
      }
    }
  }

  update() {
    const kbLeft = !!(this._keys['ArrowLeft'] || this._keys['KeyA']);
    const kbRight = !!(this._keys['ArrowRight'] || this._keys['KeyD']);
    const kbDown = !!(this._keys['ArrowDown'] || this._keys['KeyS']);
    const kbJump = !!this._keys['Space'];
    const kbFire = !!(this._keys['KeyX'] || this._keys['ShiftLeft'] || this._keys['ShiftRight']);
    const kbActive =
      kbLeft ||
      kbRight ||
      kbJump ||
      kbDown ||
      kbFire ||
      !!this._keys['ArrowUp'] ||
      !!this._keys['KeyW'];

    if (kbActive || this._kbWasActive) {
      this.left = kbLeft;
      this.right = kbRight;
      this.down = kbDown;
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

    this.jumpEdge = this.jumpPressed && !this._prevJump;
    this._prevJump = this.jumpPressed;
    this.fireEdge = this.firePressed && !this._prevFire;
    this._prevFire = this.firePressed;
  }
}
