// ============================================================
// LEVEL MANAGER — Level loading, entity spawning
// ============================================================

import { STAND_H } from '../constants';
import { getLevels } from './levelData';
import { Player } from '../entities/player';
import { PatrolEnemy } from '../entities/enemies/patrolEnemy';
import { FlyingEnemy } from '../entities/enemies/flyingEnemy';
import { ShooterEnemy } from '../entities/enemies/shooterEnemy';
import { Boss } from '../entities/enemies/boss';
import { Tiara } from '../entities/tiara';
import { SecretGem } from '../entities/secretGem';
import { PowerUpItem } from '../entities/powerup';

export class LevelManager {
  constructor() {
    this.levels = getLevels();
    this.currentLevel = 0;
    this.levelData = null;
  }

  load(n) {
    this.currentLevel = n;
    this.levelData = this.levels[n];
    return this.levelData;
  }

  get totalLevels() {
    return this.levels.length;
  }

  createPlayer() {
    const ld = this.levelData;
    let px = 80;
    let py = ld.groundY - STAND_H;

    if (!ld.hasGround) {
      const firstPlat = ld.platforms[0];
      px = firstPlat.x + firstPlat.w / 2;
      py = firstPlat.y - STAND_H;
    }

    return new Player(px, py);
  }

  createEnemies() {
    const ld = this.levelData;
    const enemies = [];

    for (const e of ld.enemyDefs) {
      let enemy;

      if (e.type === 'boss') {
        enemy = new Boss(e.x, ld.groundY - 70);
        if (ld.bossArena) {
          enemy.setArena(ld.bossArena.left, ld.bossArena.right);
        }
        enemies.push(enemy);
        continue;
      }

      if (e.type === 'flying') {
        const fy = e.y || ld.groundY - 120;
        enemy = new FlyingEnemy(e.x, fy, e.patrol);
        enemies.push(enemy);
        continue;
      }

      if (e.type === 'shooter') {
        const sy = e.onPlatform ? e.y : ld.groundY - 40;
        enemy = new ShooterEnemy(e.x, sy);
        if (e.onPlatform) {
          // Find the platform this enemy is on
          for (const p of ld.platforms) {
            if (e.x >= p.x && e.x <= p.x + p.w) {
              enemy.y = p.y - 40;
              break;
            }
          }
        }
        enemies.push(enemy);
        continue;
      }

      // Patrol enemies (goblin/slime)
      const subtype = e.type || 'goblin';
      const isSlime = subtype === 'slime';
      const eh = isSlime ? 24 : 38;
      const ew = isSlime ? 44 : 40;
      let ey;

      if (e.onPlatform) {
        ey = e.y + (38 - eh);
      } else {
        ey = ld.groundY - eh;
      }

      enemy = new PatrolEnemy(e.x, ey, ew, eh, subtype, e.patrol, isSlime ? 1.5 : 1);

      // Fix y for ground-level enemies
      if (enemy.y <= 0) {
        enemy.y = ld.groundY - eh;
      }
      enemy.startX = e.x;

      enemies.push(enemy);
    }

    return enemies;
  }

  createTiaras() {
    return this.levelData.tiaraDefs.map((t) => new Tiara(t.x, t.y));
  }

  createPowerUps() {
    if (!this.levelData.powerUpDefs) return [];
    return this.levelData.powerUpDefs.map((p) => new PowerUpItem(p.x, p.y, p.type));
  }

  createSecretGems(levelIndex, collectedIds) {
    const defs = this.levelData.secretGemDefs;
    if (!defs || !defs.length) return [];
    const taken = new Set(collectedIds || []);
    return defs.map((d, i) => {
      const id = `${levelIndex}-${i}`;
      const g = new SecretGem(id, d.x, d.y);
      if (taken.has(id)) g.collected = true;
      return g;
    });
  }

  createFlag() {
    const ld = this.levelData;
    if (!ld.flagX) return null;
    return { x: ld.flagX, y: ld.flagY || ld.groundY, reached: false, reachedFrame: 0 };
  }

  createCage() {
    const ld = this.levelData;
    if (!ld.cageX) return null;
    return { x: ld.cageX, y: ld.cageY, open: false };
  }
}
