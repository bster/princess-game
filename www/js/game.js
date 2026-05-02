// ============================================================
// GAME — State machine, orchestration
// ============================================================

import { STOMP_BOUNCE, H } from './constants.js';
import { rectsOverlap } from './utils.js';
import { Camera } from './camera.js';
import { ParticleSystem } from './particles.js';
import { SoundManager } from './audio.js';
import { LevelManager } from './levels/levelManager.js';
import { resolvePlayerLevel } from './collider.js';
import { Projectile } from './entities/projectile.js';
import { PatrolEnemy } from './entities/enemies/patrolEnemy.js';
import { FireAbility } from './abilities/fireAbility.js';
import { FlightAbility } from './abilities/flightAbility.js';
import { ShieldAbility } from './abilities/shieldAbility.js';
import { GrowthAbility } from './abilities/growthAbility.js';
import { MedalManager } from './medals.js';

export class Game {
  constructor() {
    this.state = 'title'; // title, select, playing, levelComplete, gameOver, victory
    this.levelIndex = 0;
    this.score = 0;
    this.lives = 5;
    this.tiaraCount = 0;
    this.nextLifeTiaras = 10;
    this.frame = 0;

    // Character selection: 'princess' or 'frank'
    this.character = 'princess';
    this.selectCursor = 0; // 0 = princess, 1 = frank

    this.camera = new Camera();
    this.particles = new ParticleSystem();
    this.audio = new SoundManager();
    this.levelManager = new LevelManager();

    this.player = null;
    this.enemies = [];
    this.tiaras = [];
    this.powerUps = [];
    this.projectiles = [];
    this.flag = null;
    this.cage = null;
    this.levelData = null;

    this.levelCompleteTimer = 0;
    this.gameOverTimer = 0;
    this.victoryTimer = 0;

    // Hit freeze (pause game updates for impact feel)
    this.freezeTimer = 0;
    // Slow motion
    this.slowMoTimer = 0;
    this.slowMoRate = 1;

    // Medal system
    this.medalManager = new MedalManager();
    this.levelTimer = 0;
    this.levelHitsTaken = 0;
    this.levelTiarasCollected = 0;
    this.levelTotalTiaras = 0;
    this.medalResults = null;
  }

  update(input) {
    this.frame++;
    input.update();

    switch (this.state) {
      case 'title': this._updateTitle(input); break;
      case 'select': this._updateSelect(input); break;
      case 'playing': this._updatePlaying(input); break;
      case 'levelComplete': this._updateLevelComplete(input); break;
      case 'gameOver': this._updateGameOver(input); break;
      case 'victory': this._updateVictory(input); break;
    }
  }

  _updateTitle(input) {
    if (input.jumpEdge || input.left || input.right) {
      this.state = 'select';
      this.selectCursor = 0;
    }
  }

  _updateSelect(input) {
    // Left/right to toggle character
    if (input.left && this.selectCursor !== 0) {
      this.selectCursor = 0;
    } else if (input.right && this.selectCursor !== 1) {
      this.selectCursor = 1;
    }

    // Jump/tap/fire to confirm
    if (input.jumpEdge || input.fireEdge) {
      this.character = this.selectCursor === 0 ? 'princess' : 'frank';
      this.state = 'playing';
      this.levelIndex = 0;
      this.score = 0;
      this.lives = 5;
      this.tiaraCount = 0;
      this.nextLifeTiaras = 10;
      this._initLevel(0);
    }
  }

  _updateLevelComplete(input) {
    this.levelCompleteTimer++;
    this.particles.update();
    if (this.levelCompleteTimer > 180 && input.jumpEdge) {
      if (this.levelIndex < this.levelManager.totalLevels - 1) {
        this.levelIndex++;
        this._initLevel(this.levelIndex);
        this.state = 'playing';
      } else {
        this.state = 'victory';
        this.victoryTimer = 0;
      }
    }
  }

  _updateGameOver(input) {
    this.gameOverTimer++;
    if (this.gameOverTimer > 120 && input.jumpEdge) {
      this.state = 'title';
    }
  }

  _updateVictory(input) {
    this.victoryTimer++;
    this.particles.update();
    if (this.victoryTimer % 15 === 0 && this.player) {
      this.particles.spawnVictoryHearts(this.player.x, this.player.y - 40);
    }
    if (this.victoryTimer > 180 && input.jumpEdge) {
      this.state = 'title';
    }
  }

  _updatePlaying(input) {
    // Hit freeze — skip physics but still render
    if (this.freezeTimer > 0) {
      this.freezeTimer--;
      return;
    }

    // Slow motion
    if (this.slowMoTimer > 0) {
      this.slowMoTimer--;
      if (this.frame % 2 !== 0) return; // skip every other frame for slow-mo
    }

    this.levelTimer++;

    const player = this.player;

    // Dead player
    if (player.dead) {
      player.simulate(input);
      player.applyMovement(this.levelData.width);
      this.particles.update();
      if (player.deathTimer > 90) {
        this.lives--;
        if (this.lives <= 0) {
          this.state = 'gameOver';
          this.gameOverTimer = 0;
        } else {
          this._initLevel(this.levelIndex);
        }
      }
      return;
    }

    // Player pipeline: simulate → move → collide → post
    const wasOnGround = player.onGround;
    player.simulate(input);
    player.applyMovement(this.levelData.width);
    resolvePlayerLevel(player, this.levelData);
    player.postCollision();

    // Landing dust particles
    if (player.onGround && !wasOnGround && player.vy === 0) {
      this.particles.spawnDust(player.x, player.y + player.h);
      this.camera.shake(3, 5);
    }

    // Skid dust — when turnaround happens at speed
    if (player.onGround && player._wasOnGround) {
      const prevVx = player.vx - (player.facing > 0 ? 1 : -1) * 0.7; // approximate pre-decel vx
      // Detect direction reversal: facing changed while moving fast
      if (Math.abs(player.vx) > 1.5 && player.vx * player.facing < -0.5) {
        this.particles.spawnSkidDust(player.x, player.y + player.h, player.facing);
      }
    }

    // Run dust — emit while running on ground
    if (player.onGround && Math.abs(player.vx) > 2 && this.frame % 4 === 0) {
      this.particles.create(
        player.x - player.facing * 8, player.y + player.h,
        -player.facing * 0.5, -Math.random() * 1,
        '#c8b070', 12, 2, 'dot'
      );
    }

    // Fire ability — check for shot
    const fireAb = player.getAbility('fire');
    if (fireAb && fireAb.tryFire(input)) {
      const projX = player.x + player.facing * 20;
      const projY = player.y + player.h / 2 - 5;
      const proj = new Projectile(projX, projY, player.facing * 8, -1, 'player', 1, 'fireball');
      this.projectiles.push(proj);
      this.audio.play('fireball');
    }

    // Fall death
    if (player.y > H + 50) {
      this._killPlayer();
    }

    // Enemy updates
    for (const en of this.enemies) {
      if (!en.alive) {
        if (en.squishTimer > 0) en.squishTimer--;
        continue;
      }

      // Shooter needs player X
      if (en.type === 'shooter') {
        en.update(player.x);
        if (en.shotRequested) {
          const dir = en.facing;
          const proj = new Projectile(
            en.x + dir * 20, en.y + 5,
            dir * 4, 0, 'enemy', 1, 'enemyShot'
          );
          proj.gravity = 0;
          this.projectiles.push(proj);
        }
      } else if (en.type === 'boss') {
        en.update(player.x);
        this._handleBossActions(en);
      } else {
        en.update();
      }

      // Enemy-player collision
      if (player.invincible > 0 || player.dead) continue;
      if (this._checkStompOrHit(player, en)) continue;
    }

    // Projectile updates
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update();

      if (!proj.alive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Off screen
      if (proj.y > H + 50 || proj.y < -50 ||
          proj.x < this.camera.x - 50 || proj.x > this.camera.x + 500) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (proj.owner === 'player') {
        // Hit enemies
        for (const en of this.enemies) {
          if (!en.alive) continue;
          if (proj.overlapsWith(en.x - en.w / 2, en.y, en.w, en.h)) {
            const killed = en.takeDamage(proj.damage);
            if (killed) {
              this._addScore(100, en.x, en.y);
              this.particles.spawnStomp(en.x, en.y);
              this.camera.shake(5, 8);
            }
            this.particles.spawnFireImpact(proj.x, proj.y);
            proj.alive = false;
            break;
          }
        }
      } else {
        // Enemy projectile hits player
        if (!player.dead && player.invincible <= 0) {
          const px = player.x - player.w / 2;
          if (rectsOverlap(px, player.y, player.w, player.h,
                           proj.x - proj.w / 2, proj.y - proj.h / 2, proj.w, proj.h)) {
            this.levelHitsTaken++;
            const died = player.kill();
            if (died) {
              this.particles.spawnDeath(player.x, player.y + 30);
              this.camera.shake(8, 12);
              this.camera.freeze();
            } else {
              player.knockback(proj.x);
              this.camera.shake(4, 6);
            }
            proj.alive = false;
          }
        }
      }
    }

    // Fire trail particles
    for (const proj of this.projectiles) {
      if (proj.alive && proj.type === 'fireball' && this.frame % 3 === 0) {
        this.particles.spawnFireTrail(proj.x, proj.y);
      }
    }

    // Tiara collection
    for (const t of this.tiaras) {
      if (t.collected) continue;
      t.update();
      const px = player.x - player.w / 2;
      if (rectsOverlap(px, player.y, player.w, player.h, t.x - 12, t.y - 10, 24, 20)) {
        t.collected = true;
        this._addScore(50, t.x, t.y);
        this.particles.spawnCollect(t.x, t.y);
        this.tiaraCount++;
        this.levelTiarasCollected++;
        if (this.tiaraCount >= this.nextLifeTiaras) {
          this.lives++;
          this.nextLifeTiaras += 10;
          this.particles.createText(t.x, t.y - 50, '1UP!');
        }
      }
    }

    // Power-up collection
    for (const p of this.powerUps) {
      if (p.collected) continue;
      p.update();
      const px = player.x - player.w / 2;
      if (rectsOverlap(px, player.y, player.w, player.h, p.x - 12, p.y - 12, 24, 24)) {
        p.collected = true;
        this._collectPowerUp(p);
      }
    }

    // Flag check
    if (this.flag) {
      if (this.flag.reached) {
        this.flag.reachedFrame++;
        if (this.flag.reachedFrame > 60) {
          this._evaluateMedals();
          this.state = 'levelComplete';
          this.levelCompleteTimer = 0;
        }
      } else if (Math.abs(player.x - this.flag.x) < 30 &&
                 player.y + player.h > this.flag.y - 140) {
        this.flag.reached = true;
        this.flag.reachedFrame = 0;
      }
    }

    // Cage check (level 5)
    if (this.cage && !this.cage.open &&
        Math.abs(player.x - this.cage.x - 35) < 50 &&
        player.y + player.h > this.cage.y) {
      this.cage.open = true;
      this._evaluateMedals();
      this._addScore(500, this.cage.x + 35, this.cage.y);
      this.state = 'victory';
      this.victoryTimer = 0;
    }

    // Camera with look-ahead
    this.camera.update(player.x, this.levelData.width, player.facing);

    this.particles.update();
  }

  _checkStompOrHit(player, enemy) {
    const px = player.x - player.w / 2;
    const ey = enemy.y;

    if (!rectsOverlap(px, player.y, player.w, player.h,
                      enemy.x - enemy.w / 2, ey, enemy.w, enemy.h)) {
      return false;
    }

    // Stomp check
    const playerBottom = player.y + player.h;
    const enemyMid = ey + enemy.h * 0.5;

    if (player.vy > 0 && playerBottom < enemyMid + 5) {
      // Stomp!
      const killed = enemy.takeDamage(1);
      player.stomp();
      if (killed) {
        this._addScore(100, enemy.x, enemy.y);
        this.particles.spawnStomp(enemy.x, enemy.y);
        this.camera.shake(5, 8);
        this.freezeTimer = 4; // hit freeze
        enemy.flashTimer = 8;
      } else {
        // Boss hit but not killed
        this._addScore(25, enemy.x, enemy.y);
        this.particles.spawnStomp(enemy.x, enemy.y);
        this.camera.shake(8, 12);
        this.freezeTimer = 6; // longer freeze for boss
        enemy.flashTimer = 10;
      }
      return true;
    }

    // Player hit
    this.levelHitsTaken++;
    const died = player.kill();
    if (died) {
      this.particles.spawnDeath(player.x, player.y + 30);
      this.camera.shake(8, 12);
      this.camera.freeze();
      this.freezeTimer = 5;
      this.slowMoTimer = 15;
    } else {
      player.knockback(enemy.x);
      player.flashTimer = 8;
      this.camera.shake(4, 6);
      this.freezeTimer = 3;
    }
    return true;
  }

  _handleBossActions(boss) {
    if (boss.summonRequested) {
      // Spawn 2 minion goblins
      for (let i = 0; i < 2; i++) {
        const sx = boss.x + (i === 0 ? -80 : 80);
        const minion = new PatrolEnemy(
          sx, this.levelData.groundY - 38, 40, 38,
          'goblin', 60, 1.5
        );
        this.enemies.push(minion);
      }
      this.camera.shake(6, 10);
    }

    if (boss.slamRequested) {
      // Shockwave: damage player if on ground near boss
      const player = this.player;
      if (player.onGround && Math.abs(player.x - boss.x) < 150 && !player.dead && player.invincible <= 0) {
        this.levelHitsTaken++;
        const died = player.kill();
        if (died) {
          this.particles.spawnDeath(player.x, player.y + 30);
          this.camera.freeze();
        } else {
          player.knockback(boss.x);
        }
      }
      this.camera.shake(10, 15);
      // Particles for shockwave
      for (let i = 0; i < 8; i++) {
        this.particles.create(
          boss.x + (Math.random() - 0.5) * 100,
          this.levelData.groundY - 5,
          (Math.random() - 0.5) * 6, -Math.random() * 3,
          '#FFD700', 20, 4, 'star'
        );
      }
    }

    if (boss.throwRequested) {
      // Throw hammer as projectile
      const proj = new Projectile(
        boss.x + boss.facing * 30, boss.y + 10,
        boss.facing * 6, -3, 'enemy', 1, 'enemyShot'
      );
      proj.gravity = 0.15;
      this.projectiles.push(proj);
    }
  }

  _collectPowerUp(powerUp) {
    const type = powerUp.type;
    let ability;

    switch (type) {
      case 'fire': ability = new FireAbility(); break;
      case 'flight': ability = new FlightAbility(); break;
      case 'shield': ability = new ShieldAbility(); break;
      case 'growth': ability = new GrowthAbility(); break;
      default: return;
    }

    this.player.addAbility(ability);
    this._addScore(200, powerUp.x, powerUp.y);

    // Color based on type
    const colors = { fire: '#FF4500', flight: '#87CEEB', shield: '#4169E1', growth: '#32CD32' };
    this.particles.spawnPowerUp(powerUp.x, powerUp.y, colors[type] || '#fff');
    this.camera.shake(3, 5);
    this.audio.play('powerup');
  }

  _killPlayer() {
    if (this.player.dead || this.player.invincible > 0) return;
    this.levelHitsTaken++;
    const died = this.player.kill();
    if (died) {
      this.particles.spawnDeath(this.player.x, this.player.y + 30);
      this.camera.shake(8, 12);
      this.camera.freeze();
    }
  }

  _addScore(pts, x, y) {
    this.score += pts;
    this.particles.createText(x, y - 20, '+' + pts);
  }

  _evaluateMedals() {
    this.medalResults = this.medalManager.evaluate(this.levelIndex, {
      tiarasCollected: this.levelTiarasCollected,
      tiarasTotal: this.levelTotalTiaras,
      timeFrames: this.levelTimer,
      parTime: this.levelData.parTime,
      hitsTaken: this.levelHitsTaken,
    });
    this.medalManager.award(this.levelIndex, this.medalResults);
  }

  _initLevel(n) {
    this.levelData = this.levelManager.load(n);
    this.player = this.levelManager.createPlayer();
    this.enemies = this.levelManager.createEnemies();
    this.tiaras = this.levelManager.createTiaras();
    this.powerUps = this.levelManager.createPowerUps();
    this.projectiles = [];
    this.flag = this.levelManager.createFlag();
    this.cage = this.levelManager.createCage();
    this.camera.x = 0;
    this.camera.unfreeze();
    this.particles.clear();
    this.levelCompleteTimer = 0;

    // Medal tracking resets
    this.levelTimer = 0;
    this.levelHitsTaken = 0;
    this.levelTiarasCollected = 0;
    this.levelTotalTiaras = this.levelData.tiaraDefs.length;
    this.medalResults = null;
  }
}
