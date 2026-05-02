// ============================================================
// BASE ENTITY — Position, velocity, hitbox, overlap
// ============================================================

export class Entity {
  constructor(x, y, w, h) {
    this.x = x;      // center x
    this.y = y;      // top y
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
    this.frame = 0;
    this.facing = 1;
    this.flashTimer = 0;
  }

  get left() { return this.x - this.w / 2; }
  get right() { return this.x + this.w / 2; }
  get top() { return this.y; }
  get bottom() { return this.y + this.h; }

  overlaps(other) {
    return this.left < other.right && this.right > other.left &&
           this.top < other.bottom && this.bottom > other.top;
  }

  overlapsWith(x, y, w, h) {
    return this.left < x + w && this.right > x &&
           this.top < y + h && this.y + this.h > y;
  }
}
