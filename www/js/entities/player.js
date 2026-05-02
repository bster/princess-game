// ============================================================
// PLAYER — Movement simulation, abilities, squash-stretch
// Physics split: simulate() → applyMovement() → (external collision)
// ============================================================

import { Entity } from './entity';
import {
  GRAVITY_RISE,
  GRAVITY_FALL,
  GRAVITY_CUT,
  JUMP_FORCE,
  MAX_SPEED,
  GROUND_ACCEL,
  GROUND_DECEL,
  TURN_DECEL,
  AIR_ACCEL,
  AIR_DECEL,
  MAX_FALL,
  STOMP_BOUNCE,
  COYOTE_FRAMES,
  BUFFER_FRAMES,
  CROUCH_H,
  STAND_H,
  APEX_THRESHOLD,
  APEX_GRAVITY_MOD,
  KNOCKBACK_VX,
  KNOCKBACK_VY,
} from '../constants';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 30, STAND_H);
    this.onGround = false;
    this.crouching = false;
    this.dead = false;
    this.deathTimer = 0;
    this.invincible = 0;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    this.hp = 1;
    this.maxHp = 1;
    // Squash-stretch
    this.scaleX = 1;
    this.scaleY = 1;
    this._wasOnGround = false;
    // Abilities
    this.abilities = [];
  }

  // ---- Pure physics: updates vx, vy, timers. Does NOT move position. ----
  simulate(input) {
    if (this.dead) {
      this.deathTimer++;
      this.vy += GRAVITY_FALL * 0.5;
      return;
    }

    this.frame++;
    if (this.invincible > 0) this.invincible--;
    if (this.flashTimer > 0) this.flashTimer--;

    // Crouch
    const wasCrouching = this.crouching;
    this.crouching = input.down && this.onGround;
    if (this.crouching && !wasCrouching) {
      this.y += STAND_H - CROUCH_H;
      this.h = CROUCH_H;
    } else if (!this.crouching && wasCrouching) {
      this.y -= STAND_H - CROUCH_H;
      this.h = STAND_H;
    }

    // Horizontal movement with turnaround skid
    const maxSpd = this.crouching ? MAX_SPEED * 0.4 : MAX_SPEED;

    if (input.left) {
      if (this.vx > 0 && this.onGround) {
        // Turnaround skid: input opposes velocity
        this.vx -= TURN_DECEL;
      } else {
        this.vx -= this.onGround ? GROUND_ACCEL : AIR_ACCEL;
      }
      this.facing = -1;
    } else if (input.right) {
      if (this.vx < 0 && this.onGround) {
        // Turnaround skid
        this.vx += TURN_DECEL;
      } else {
        this.vx += this.onGround ? GROUND_ACCEL : AIR_ACCEL;
      }
      this.facing = 1;
    } else {
      // No input: decelerate
      const decel = this.onGround ? GROUND_DECEL : AIR_DECEL;
      if (Math.abs(this.vx) < decel) this.vx = 0;
      else this.vx -= Math.sign(this.vx) * decel;
    }
    if (this.vx > maxSpd) this.vx = maxSpd;
    if (this.vx < -maxSpd) this.vx = -maxSpd;

    // Jump buffer
    if (input.jumpEdge) this.jumpBuffer = BUFFER_FRAMES;
    if (this.jumpBuffer > 0) this.jumpBuffer--;

    // Jump with coyote time
    const canJump = (this.onGround || this.coyoteTime > 0) && !this.crouching;
    if (this.jumpBuffer > 0 && canJump) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
      // Jump stretch
      this.scaleX = 0.85;
      this.scaleY = 1.15;
    }

    // Gravity with ability modifiers
    let gravMod = 1;
    let maxFallMod = MAX_FALL;
    for (const ab of this.abilities) {
      gravMod *= ab.modifyGravity(this, input);
      maxFallMod = Math.min(maxFallMod, ab.modifyMaxFall(this));
    }

    // Apex hang time — subtle float at jump peak
    let apexMod = 1;
    if (Math.abs(this.vy) < APEX_THRESHOLD && !this.onGround) {
      apexMod = APEX_GRAVITY_MOD;
    }

    if (this.vy < 0 && input.jumpPressed) {
      this.vy += GRAVITY_RISE * gravMod * apexMod;
    } else if (this.vy < 0) {
      this.vy += GRAVITY_CUT * gravMod * apexMod;
    } else {
      this.vy += GRAVITY_FALL * gravMod * apexMod;
    }
    if (this.vy > maxFallMod) this.vy = maxFallMod;

    // Squash-stretch recovery
    this.scaleX += (1 - this.scaleX) * 0.2;
    this.scaleY += (1 - this.scaleY) * 0.2;

    // Update abilities
    for (let i = this.abilities.length - 1; i >= 0; i--) {
      this.abilities[i].update(this);
      if (this.abilities[i].expired) {
        this.abilities[i].onExpire(this);
        this.abilities.splice(i, 1);
      }
    }
  }

  // ---- Apply velocity to position. Called after simulate(), before collision. ----
  applyMovement(levelWidth) {
    if (this.dead) {
      this.y += this.vy;
      return;
    }
    this._wasOnGround = this.onGround;
    this.x += this.vx;
    if (this.x < 10) this.x = 10;
    if (this.x > levelWidth - 10) this.x = levelWidth - 10;
    this.y += this.vy;
    this.onGround = false;
  }

  // ---- Called after collision resolution to handle landing effects ----
  postCollision() {
    if (this.dead) return;

    // Landing squash
    if (this.onGround && !this._wasOnGround) {
      this.scaleX = 1.2;
      this.scaleY = 0.8;
    }

    // Coyote time
    if (this.onGround) {
      this.coyoteTime = COYOTE_FRAMES;
    } else if (this.coyoteTime > 0) {
      this.coyoteTime--;
    }
  }

  stomp() {
    this.vy = STOMP_BOUNCE;
  }

  kill() {
    if (this.dead || this.invincible > 0) return false;

    // Check shield first
    for (const ab of this.abilities) {
      if (ab.type === 'shield' && ab.absorbHit()) {
        this.invincible = 30;
        return false;
      }
    }

    // Check HP
    this.hp--;
    if (this.hp > 0) {
      this.invincible = 60;
      return false;
    }

    this.dead = true;
    this.deathTimer = 0;
    this.vy = -8;
    return true;
  }

  knockback(fromX) {
    const dir = this.x < fromX ? -1 : 1;
    this.vx = dir * KNOCKBACK_VX;
    this.vy = KNOCKBACK_VY;
    this.invincible = 60;
  }

  addAbility(ability) {
    // Same type = reset timer
    for (const ab of this.abilities) {
      if (ab.type === ability.type) {
        ab.resetTimer();
        return;
      }
    }
    // New type
    ability.onActivate(this);
    this.abilities.push(ability);
  }

  hasAbility(type) {
    return this.abilities.some((ab) => ab.type === type);
  }

  getAbility(type) {
    return this.abilities.find((ab) => ab.type === type);
  }
}
