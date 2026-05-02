// ============================================================
// PARTICLE SYSTEM
// ============================================================

import {
  C,
  DUST_LANDING_COUNT,
  DUST_LANDING_LIFE,
  DUST_LANDING_SPREAD,
  DUST_SKID_COUNT,
  DUST_SKID_LIFE,
  DUST_SKID_SPREAD,
} from './constants';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 80;
  }

  create(x, y, vx, vy, color, life, size, type) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x,
      y,
      vx,
      vy,
      color,
      life,
      maxLife: life,
      size: size || 4,
      type: type || 'dot',
    });
  }

  createText(x, y, text, color) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -1,
      color: color || C.crown,
      life: 45,
      maxLife: 45,
      size: 0,
      type: 'text',
      text,
    });
  }

  spawnStomp(x, y) {
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.create(x, y, Math.cos(a) * 3, Math.sin(a) * 3 - 2, C.crown, 25, 5, 'star');
    }
  }

  spawnCollect(x, y) {
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      this.create(x, y, Math.cos(a) * 2, Math.sin(a) * 2 - 1, C.tiara, 20, 4, 'star');
    }
  }

  spawnDeath(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      this.create(x, y, Math.cos(a) * 4, Math.sin(a) * 4 - 3, '#fff', 30, 5, 'dot');
    }
  }

  spawnVictoryHearts(x, y) {
    for (let i = 0; i < 3; i++) {
      this.create(
        x + Math.random() * 40 - 20,
        y,
        (Math.random() - 0.5) * 2,
        -1 - Math.random() * 2,
        C.heart,
        50,
        6,
        'heart'
      );
    }
  }

  spawnDust(x, y) {
    // Landing dust puff — wider spread, more particles, varied sizes
    for (let i = 0; i < DUST_LANDING_COUNT; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8; // upward fan
      const speed = 0.8 + Math.random() * 1.5;
      const spread = (Math.random() - 0.5) * DUST_LANDING_SPREAD;
      this.create(
        x + spread,
        y,
        Math.cos(angle) * speed * 1.5,
        Math.sin(angle) * speed,
        i % 2 === 0 ? '#c8b070' : '#b0a060',
        DUST_LANDING_LIFE + Math.floor(Math.random() * 6),
        2 + Math.random() * 2,
        'dot'
      );
    }
  }

  spawnSkidDust(x, y, facing) {
    // Skid dust — kicked backwards from feet when reversing direction
    for (let i = 0; i < DUST_SKID_COUNT; i++) {
      const spread = (Math.random() - 0.5) * DUST_SKID_SPREAD;
      this.create(
        x - facing * 6 + spread,
        y,
        -facing * (1 + Math.random() * 2),
        -Math.random() * 1.2,
        '#c8b070',
        DUST_SKID_LIFE + Math.floor(Math.random() * 4),
        2 + Math.random() * 1.5,
        'dot'
      );
    }
  }

  spawnFireTrail(x, y) {
    this.create(x, y, (Math.random() - 0.5) * 1, -Math.random() * 2, '#FF4500', 12, 4, 'dot');
    this.create(x, y, (Math.random() - 0.5) * 1, -Math.random() * 1.5, '#FFD700', 10, 3, 'dot');
  }

  spawnFireImpact(x, y) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.create(x, y, Math.cos(a) * 3, Math.sin(a) * 3, '#FF4500', 18, 4, 'dot');
    }
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2;
      this.create(x, y, Math.cos(a) * 2, Math.sin(a) * 2, '#FFD700', 15, 3, 'star');
    }
  }

  spawnPowerUp(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.create(x, y, Math.cos(a) * 3, Math.sin(a) * 3 - 1, color, 30, 5, 'star');
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.type === 'dot') p.vy += 0.1;
      if (p.type === 'text') p.vy -= 0.02;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  clear() {
    this.particles.length = 0;
  }
}
