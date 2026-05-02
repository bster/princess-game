// ============================================================
// BOSS — Goblin King with 3-phase state machine
// ============================================================

import { Enemy } from './enemy';
import { ENEMY_HP, BOSS_PHASE1_HP, BOSS_PHASE2_HP } from '../../constants';

export class Boss extends Enemy {
  constructor(x, y) {
    super(x, y, 72, 70, ENEMY_HP.boss);
    this.type = 'boss';
    this.subtype = 'boss';
    this.phase = 1;
    this.state = 'idle'; // idle, charge, slam, dazed, summon, groundpound
    this.stateTimer = 0;
    this.dazed = false;
    this.dazeTimer = 0;
    this.chargeSpeed = 4;
    this.chargeDir = 1;
    this.actionCooldown = 60;
    this.arenaLeft = 0;
    this.arenaRight = 600;
    this.summonRequested = false;
    this.slamRequested = false;
    this.throwRequested = false;
    this._nextAction = 'charge';
  }

  update(playerX) {
    super.update();
    if (!this.alive) return;

    this.summonRequested = false;
    this.slamRequested = false;
    this.throwRequested = false;

    // Phase transitions
    if (this.hp <= BOSS_PHASE2_HP && this.phase < 3) {
      this.phase = 3;
      this.chargeSpeed = 6;
    } else if (this.hp <= BOSS_PHASE1_HP && this.phase < 2) {
      this.phase = 2;
      this.chargeSpeed = 5;
    }

    // Face player
    if (playerX !== undefined) {
      this.facing = playerX > this.x ? 1 : -1;
    }

    // Daze
    if (this.dazed) {
      this.dazeTimer--;
      if (this.dazeTimer <= 0) {
        this.dazed = false;
        this.state = 'idle';
        this.actionCooldown = 40;
      }
      return;
    }

    this.stateTimer--;

    switch (this.state) {
      case 'idle':
        this.actionCooldown--;
        if (this.actionCooldown <= 0) {
          this._pickAction();
        }
        break;

      case 'charge':
        this.x += this.chargeDir * this.chargeSpeed;
        // Hit wall?
        if (this.x <= this.arenaLeft + 30 || this.x >= this.arenaRight - 30) {
          this.x = Math.max(this.arenaLeft + 30, Math.min(this.arenaRight - 30, this.x));
          this._becomeDazed(90);
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.actionCooldown = 50;
        }
        break;

      case 'slam':
        if (this.stateTimer === 20) {
          this.slamRequested = true;
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.actionCooldown = 60;
        }
        break;

      case 'summon':
        if (this.stateTimer === 15) {
          this.summonRequested = true;
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.actionCooldown = 50;
        }
        break;

      case 'groundpound':
        if (this.stateTimer === 10) {
          this.slamRequested = true;
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.actionCooldown = 40;
        }
        break;

      case 'throw':
        if (this.stateTimer === 15) {
          this.throwRequested = true;
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.actionCooldown = 50;
        }
        break;
    }
  }

  _pickAction() {
    const actions = this._getPhaseActions();
    const action = actions[Math.floor(Math.random() * actions.length)];

    switch (action) {
      case 'charge':
        this.state = 'charge';
        this.chargeDir = this.facing;
        this.stateTimer = 60;
        break;
      case 'slam':
        this.state = 'slam';
        this.stateTimer = 40;
        break;
      case 'summon':
        this.state = 'summon';
        this.stateTimer = 30;
        break;
      case 'groundpound':
        this.state = 'groundpound';
        this.stateTimer = 30;
        break;
      case 'throw':
        this.state = 'throw';
        this.stateTimer = 30;
        break;
    }
  }

  _getPhaseActions() {
    switch (this.phase) {
      case 1:
        return ['charge', 'slam', 'charge', 'slam'];
      case 2:
        return ['charge', 'slam', 'summon', 'groundpound', 'throw'];
      case 3:
        return ['charge', 'charge', 'charge', 'summon', 'summon'];
    }
  }

  _becomeDazed(duration) {
    this.dazed = true;
    this.dazeTimer = duration;
    this.state = 'dazed';
  }

  takeDamage(amount) {
    // Boss can only be stomped when dazed (phase 1-2) or always (phase 3)
    if (this.phase < 3 && !this.dazed) return false;

    this.hp -= amount || 1;
    if (this.hp <= 0) {
      this.alive = false;
      this.squishTimer = 60;
      return true;
    }
    // Brief daze on hit
    this._becomeDazed(45);
    return false;
  }

  setArena(left, right) {
    this.arenaLeft = left;
    this.arenaRight = right;
  }
}
