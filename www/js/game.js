// ============================================================
// GAME — State machine, orchestration
// ============================================================

import { H, SECRET_GEM_SCORE, STOMP_CHAIN_BONUS } from './constants';
import { rectsOverlap } from './utils';
import { Camera } from './camera';
import { ParticleSystem } from './particles';
import { SoundManager } from './audio';
import { LevelManager } from './levels/levelManager';
import { resolvePlayerLevel } from './collider';
import { Projectile } from './entities/projectile';
import { PatrolEnemy } from './entities/enemies/patrolEnemy';
import { FireAbility } from './abilities/fireAbility';
import { FlightAbility } from './abilities/flightAbility';
import { ShieldAbility } from './abilities/shieldAbility';
import { GrowthAbility } from './abilities/growthAbility';
import { MedalManager } from './medals';
import * as ProgressSave from './progressSave';
import { addLeaderboardEntry } from './leaderboard';
import { hitTestTitle, hitTestLeaderboardBack } from './ui/titleLayout';
import * as Ow from './overworld/overworldMap';
import { createMiniState, tickMini } from './minigames/arcadeMinigames';
import { hitTestMapExit } from './ui/mapExitUi';

const POWER_FANFARE = {
  fire: {
    title: 'Fire',
    tagline: 'Press B to shoot fireballs.',
    color: '#FF4500',
  },
  flight: {
    title: 'Flight',
    tagline: 'Hold jump while in the air to glide.',
    color: '#87CEEB',
  },
  shield: {
    title: 'Shield',
    tagline: 'Blocks several hits before it wears off.',
    color: '#4169E1',
  },
  growth: {
    title: 'Growth',
    tagline: 'For a limited time: +1 HP and a larger hitbox.',
    color: '#32CD32',
  },
};

export class Game {
  constructor() {
    this.state = 'title'; // title, leaderboard, overworld, minigame, playing, levelComplete, gameOver, victory
    this.levelIndex = 0;
    this.maxReachableLevel = 0;
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

    /** @type {{ x:number, y:number, facing:number }} */
    this.ow = { x: 220, y: 1260, facing: 1 };
    /** @type {{ slot?:boolean, claw?:boolean, hoops?:boolean }} */
    this.minigamesUsed = { slot: false, claw: false, hoops: false };
    this.mini = null;
    /** @type {null | { kind:string, levelIndex?:number, id?:string, label?:string }} */
    this.owTarget = null;

    this.secretGems = [];
    this.secretsCollectedIds = [];
    this.abilityFanfare = null;
    this.stompChain = 0;
    this.stompChainTimer = 0;
  }

  update(input) {
    this.frame++;
    input.update();

    switch (this.state) {
      case 'title':
        this._updateTitle(input);
        break;
      case 'leaderboard':
        this._updateLeaderboard(input);
        break;
      case 'overworld':
        this._updateOverworld(input);
        break;
      case 'minigame':
        this._updateMinigame(input);
        break;
      case 'playing':
        this._updatePlaying(input);
        break;
      case 'levelComplete':
        this._updateLevelComplete(input);
        break;
      case 'gameOver':
        this._updateGameOver(input);
        break;
      case 'victory':
        this._updateVictory(input);
        break;
    }
  }

  _updateTitle(input) {
    const hasSave = ProgressSave.hasRunSave();
    const tap = input.consumeTap();
    let handled = false;

    if (tap) {
      const hit = hitTestTitle(tap.x, tap.y, hasSave);
      if (hit === 'princess') {
        this.selectCursor = 0;
        this.character = 'princess';
        handled = true;
      } else if (hit === 'frank') {
        this.selectCursor = 1;
        this.character = 'frank';
        handled = true;
      } else if (hit === 'continue' && hasSave) {
        this._continueRun();
        handled = true;
      } else if (hit === 'newGame') {
        this._startNewRun();
        handled = true;
      } else if (hit === 'leaderboard') {
        this.state = 'leaderboard';
        handled = true;
      }
    }

    if (!handled) {
      if (input.left && this.selectCursor !== 0) {
        this.selectCursor = 0;
        this.character = 'princess';
      }
      if (input.right && this.selectCursor !== 1) {
        this.selectCursor = 1;
        this.character = 'frank';
      }
      if (hasSave && input.keyCEdge) this._continueRun();
      else if (input.jumpEdge || input.fireEdge) this._startNewRun();
      if (input.keyLEdge) this.state = 'leaderboard';
    }
  }

  _updateLeaderboard(input) {
    const tap = input.consumeTap();
    if (tap && hitTestLeaderboardBack(tap.x, tap.y)) {
      this.state = 'title';
      return;
    }
    if (input.jumpEdge || input.fireEdge || input.keyLEdge) {
      this.state = 'title';
    }
  }

  _updateOverworld(input) {
    if (input.keyLEdge) {
      this.state = 'leaderboard';
      return;
    }

    let dx = 0;
    let dy = 0;
    if (input.left) dx -= Ow.OW_SPEED;
    if (input.right) dx += Ow.OW_SPEED;
    if (input.up) dy -= Ow.OW_SPEED;
    if (input.down) dy += Ow.OW_SPEED;

    const rects = Ow.getOwCollisionRects();
    this.ow = Ow.moveOwPlayer(this.ow, dx, dy, rects);
    this.owTarget = Ow.findInteractTarget(
      this.ow.x,
      this.ow.y,
      this.maxReachableLevel,
      this.minigamesUsed
    );

    if (this.frame % 420 === 0) ProgressSave.saveRun(this._runPayload());

    const go = input.jumpEdge || input.fireEdge;
    if (go && this.owTarget) {
      if (this.owTarget.kind === 'level') {
        this._enterLevelFromOw(this.owTarget.levelIndex);
      } else if (this.owTarget.id) {
        this.mini = createMiniState(this.owTarget.id);
        this.state = 'minigame';
      }
    }
  }

  _enterLevelFromOw(levelIdx) {
    this.levelIndex = levelIdx;
    this._initLevel(levelIdx);
    this.state = 'playing';
    ProgressSave.saveRun(this._runPayload());
  }

  _exitToOverworldFromLevel() {
    const anchor = Math.min(this.levelIndex, this.maxReachableLevel);
    const sp = Ow.spawnOwNearLevel(anchor);
    this.ow = { x: sp.x, y: sp.y, facing: sp.facing ?? 1 };
    this.levelData = null;
    this.player = null;
    this.enemies = [];
    this.tiaras = [];
    this.powerUps = [];
    this.projectiles = [];
    this.flag = null;
    this.cage = null;
    this.secretGems = [];
    this.camera.unfreeze();
    this.camera.x = 0;
    this.particles.clear();
    this.abilityFanfare = null;
    this.freezeTimer = 0;
    this.slowMoTimer = 0;
    this.state = 'overworld';
    ProgressSave.saveRun(this._runPayload());
  }

  _updateMinigame(input) {
    if (!this.mini) {
      this.state = 'overworld';
      return;
    }
    if (input.keyLEdge) {
      this.mini = null;
      this.state = 'overworld';
      return;
    }
    const kind = this.mini.kind;
    const done = tickMini(this, input);
    if (done) {
      if (kind === 'slot') this.minigamesUsed.slot = true;
      else if (kind === 'claw') this.minigamesUsed.claw = true;
      else if (kind === 'hoops') this.minigamesUsed.hoops = true;
      this.mini = null;
      this.state = 'overworld';
      ProgressSave.saveRun(this._runPayload());
    }
  }

  _startNewRun() {
    ProgressSave.clearRun();
    this.secretsCollectedIds = [];
    this.character = this.selectCursor === 0 ? 'princess' : 'frank';
    this.levelIndex = 0;
    this.maxReachableLevel = 0;
    this.score = 0;
    this.lives = 5;
    this.tiaraCount = 0;
    this.nextLifeTiaras = 10;
    this.minigamesUsed = { slot: false, claw: false, hoops: false };
    this.state = 'overworld';
    this.abilityFanfare = null;
    this.mini = null;
    const sp = Ow.spawnOwNearLevel(0);
    this.ow = { x: sp.x, y: sp.y, facing: sp.facing ?? 1 };
    this.levelData = null;
    this.player = null;
    ProgressSave.saveRun(this._runPayload());
  }

  _continueRun() {
    const data = ProgressSave.loadRun();
    if (!data) return;
    this.levelIndex = data.levelIndex;
    this.maxReachableLevel = data.maxReachableLevel ?? data.levelIndex ?? 0;
    this.lives = data.lives;
    this.score = data.score;
    this.character = data.character;
    this.selectCursor = data.character === 'frank' ? 1 : 0;
    this.tiaraCount = data.tiaraCount ?? 0;
    this.nextLifeTiaras = data.nextLifeTiaras ?? 10;
    this.secretsCollectedIds = Array.isArray(data.secretsCollected)
      ? data.secretsCollected.slice()
      : [];
    this.minigamesUsed = {
      slot: !!data.minigamesUsed?.slot,
      claw: !!data.minigamesUsed?.claw,
      hoops: !!data.minigamesUsed?.hoops,
    };
    const lc = this.levelManager.totalLevels;
    this.maxReachableLevel = Math.max(0, Math.min(lc - 1, this.maxReachableLevel));
    this.levelIndex = Math.max(0, Math.min(lc - 1, this.levelIndex));
    this.state = 'overworld';
    this.abilityFanfare = null;
    this.mini = null;
    const anchor = Math.min(this.levelIndex, this.maxReachableLevel);
    const sp = Ow.spawnOwNearLevel(anchor);
    this.ow = { x: sp.x, y: sp.y, facing: sp.facing ?? 1 };
    this.levelData = null;
    this.player = null;
    ProgressSave.saveRun(this._runPayload());
  }

  _runPayload() {
    return {
      levelIndex: this.levelIndex,
      maxReachableLevel: this.maxReachableLevel,
      minigamesUsed: { ...this.minigamesUsed },
      lives: this.lives,
      score: this.score,
      character: this.character,
      tiaraCount: this.tiaraCount,
      nextLifeTiaras: this.nextLifeTiaras,
      secretsCollected: this.secretsCollectedIds.slice(),
    };
  }

  _persistRunIfPlaying() {
    if (this.state !== 'playing') return;
    if (!this.player || this.player.dead) return;
    ProgressSave.saveRun(this._runPayload());
  }

  _updateLevelComplete(input) {
    this.levelCompleteTimer++;
    this.particles.update();
    if (this.levelCompleteTimer > 180 && input.jumpEdge) {
      const total = this.levelManager.totalLevels;
      const completed = this.levelIndex;
      if (completed < total - 1) {
        this.maxReachableLevel = Math.max(this.maxReachableLevel, completed + 1);
        this.levelIndex = completed + 1;
        const sp = Ow.spawnOwNearLevel(this.levelIndex);
        this.ow = { x: sp.x, y: sp.y, facing: sp.facing ?? 1 };
        this.state = 'overworld';
        ProgressSave.saveRun(this._runPayload());
      } else {
        this.state = 'victory';
        this.victoryTimer = 0;
      }
    }
  }

  _updateGameOver(input) {
    this.gameOverTimer++;
    if (this.gameOverTimer > 85 && input.jumpEdge && !this._gameOverPrompted) {
      this._gameOverPrompted = true;
      const name = window.prompt('Save this score to the leaderboard?', 'Hero');
      if (name !== null) {
        addLeaderboardEntry(name, this.score, this.character);
      }
      ProgressSave.clearRun();
      this.state = 'title';
      this._gameOverPrompted = false;
    }
  }

  _updateVictory(input) {
    this.victoryTimer++;
    this.particles.update();
    if (this.victoryTimer % 15 === 0 && this.player) {
      this.particles.spawnVictoryHearts(this.player.x, this.player.y - 40);
    }
    if (this.victoryTimer > 180 && input.jumpEdge) {
      const name = window.prompt('Save victory score to the leaderboard?', 'Champion');
      if (name !== null) {
        addLeaderboardEntry(name, this.score, this.character);
      }
      ProgressSave.clearRun();
      this.state = 'title';
    }
  }

  _updatePlaying(input) {
    const tap = input.consumeTap();
    if (
      this.player &&
      !this.player.dead &&
      ((tap && hitTestMapExit(tap.x, tap.y)) || input.keyMEdge || input.escapeEdge)
    ) {
      this._exitToOverworldFromLevel();
      return;
    }

    if (this.abilityFanfare && this.abilityFanfare.freezeLeft > 0) {
      this.abilityFanfare.freezeLeft--;
      this.particles.update();
      return;
    }

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

    if (
      this.abilityFanfare &&
      this.abilityFanfare.freezeLeft <= 0 &&
      this.abilityFanfare.timer > 0
    ) {
      this.abilityFanfare.timer--;
      if (this.abilityFanfare.timer <= 0) this.abilityFanfare = null;
    }

    if (this.stompChainTimer > 0) {
      this.stompChainTimer--;
      if (this.stompChainTimer <= 0) this.stompChain = 0;
    }

    if (this.frame % 480 === 0) this._persistRunIfPlaying();

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
          ProgressSave.saveRun(this._runPayload());
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
      // Detect direction reversal: facing changed while moving fast
      if (Math.abs(player.vx) > 1.5 && player.vx * player.facing < -0.5) {
        this.particles.spawnSkidDust(player.x, player.y + player.h, player.facing);
      }
    }

    // Run dust — emit while running on ground
    if (player.onGround && Math.abs(player.vx) > 2 && this.frame % 4 === 0) {
      this.particles.create(
        player.x - player.facing * 8,
        player.y + player.h,
        -player.facing * 0.5,
        -Math.random() * 1,
        '#c8b070',
        12,
        2,
        'dot'
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
            en.x + dir * 20,
            en.y + 5,
            dir * 4,
            0,
            'enemy',
            1,
            'enemyShot'
          );
          proj.gravity = 0;
          this.projectiles.push(proj);
          en.shotRequested = false;
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

      // Off screen / out of level (avoid camera-only bounds — long levels need wider span)
      const lvW = this.levelData.width;
      if (proj.y > H + 50 || proj.y < -50 || proj.x < -100 || proj.x > lvW + 120) {
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
          if (
            rectsOverlap(
              px,
              player.y,
              player.w,
              player.h,
              proj.x - proj.w / 2,
              proj.y - proj.h / 2,
              proj.w,
              proj.h
            )
          ) {
            this.stompChain = 0;
            this.stompChainTimer = 0;
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
        this._persistRunIfPlaying();
      }
    }

    // Secret gems — tucked into crawl tunnels & aerial gaps (bonus score)
    for (const g of this.secretGems) {
      if (g.collected) continue;
      g.update();
      const px = player.x - player.w / 2;
      if (rectsOverlap(px, player.y, player.w, player.h, g.x - 11, g.y - 9, 22, 18)) {
        g.collected = true;
        if (!this.secretsCollectedIds.includes(g.id)) {
          this.secretsCollectedIds.push(g.id);
        }
        this.score += SECRET_GEM_SCORE;
        this.particles.createText(g.x, g.y - 28, '+' + SECRET_GEM_SCORE, '#DA70D6');
        this.particles.createText(g.x, g.y - 48, 'SECRET GEM!', '#E8D7FF');
        this.particles.spawnPowerUp(g.x, g.y, '#9932CC');
        this.camera.shake(4, 8);
        this.audio.play('powerup');
        ProgressSave.saveRun(this._runPayload());
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
          ProgressSave.saveRun(this._runPayload());
        }
      } else if (Math.abs(player.x - this.flag.x) < 30 && player.y + player.h > this.flag.y - 140) {
        this.flag.reached = true;
        this.flag.reachedFrame = 0;
      }
    }

    // Cage check (boss fortress — rescue clears stage mid-campaign)
    if (this.cage && !this.cage.open) {
      const boss = this.enemies.find((e) => e.type === 'boss');
      const cageReachable = !boss || !boss.alive;
      if (
        cageReachable &&
        Math.abs(player.x - this.cage.x - 35) < 50 &&
        player.y + player.h > this.cage.y
      ) {
        this.cage.open = true;
        this._evaluateMedals();
        this._addScore(500, this.cage.x + 35, this.cage.y);
        const total = this.levelManager.totalLevels;
        if (this.levelIndex < total - 1) {
          this.state = 'levelComplete';
          this.levelCompleteTimer = 0;
        } else {
          this.state = 'victory';
          this.victoryTimer = 0;
        }
        ProgressSave.saveRun(this._runPayload());
      }
    }

    // Camera with look-ahead
    this.camera.update(player.x, this.levelData.width, player.facing);

    this.particles.update();
  }

  _checkStompOrHit(player, enemy) {
    const px = player.x - player.w / 2;
    const ey = enemy.y;

    if (
      !rectsOverlap(px, player.y, player.w, player.h, enemy.x - enemy.w / 2, ey, enemy.w, enemy.h)
    ) {
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
        if (this.stompChainTimer > 0) this.stompChain++;
        else this.stompChain = 1;
        this.stompChainTimer = 78;
        const chainBonus = (this.stompChain - 1) * STOMP_CHAIN_BONUS;
        if (chainBonus > 0) {
          this.score += chainBonus;
          this.particles.createText(
            enemy.x,
            enemy.y - 44,
            `Stomp ×${this.stompChain} +${chainBonus}`,
            '#FFD700'
          );
        }
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
    this.stompChain = 0;
    this.stompChainTimer = 0;
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
      boss.summonRequested = false;
      // Spawn 2 minion goblins
      for (let i = 0; i < 2; i++) {
        const sx = boss.x + (i === 0 ? -80 : 80);
        const minion = new PatrolEnemy(sx, this.levelData.groundY - 38, 40, 38, 'goblin', 60, 1.5);
        minion.startX = sx;
        this.enemies.push(minion);
      }
      this.camera.shake(6, 10);
    }

    if (boss.slamRequested) {
      // Shockwave: damage player if on ground near boss
      const player = this.player;
      if (
        player.onGround &&
        Math.abs(player.x - boss.x) < 150 &&
        !player.dead &&
        player.invincible <= 0
      ) {
        this.stompChain = 0;
        this.stompChainTimer = 0;
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
          (Math.random() - 0.5) * 6,
          -Math.random() * 3,
          '#FFD700',
          20,
          4,
          'star'
        );
      }
      boss.slamRequested = false;
    }

    if (boss.throwRequested) {
      boss.throwRequested = false;
      // Throw hammer as projectile
      const proj = new Projectile(
        boss.x + boss.facing * 30,
        boss.y + 10,
        boss.facing * 6,
        -3,
        'enemy',
        1,
        'enemyShot'
      );
      proj.gravity = 0.15;
      this.projectiles.push(proj);
    }
  }

  _collectPowerUp(powerUp) {
    const type = powerUp.type;
    let ability;

    switch (type) {
      case 'fire':
        ability = new FireAbility();
        break;
      case 'flight':
        ability = new FlightAbility();
        break;
      case 'shield':
        ability = new ShieldAbility();
        break;
      case 'growth':
        ability = new GrowthAbility();
        break;
      default:
        return;
    }

    this.player.addAbility(ability);
    this._addScore(200, powerUp.x, powerUp.y);

    const meta = POWER_FANFARE[type];
    if (meta) {
      this.abilityFanfare = {
        freezeLeft: 22,
        timer: 105,
        title: meta.title,
        tagline: meta.tagline,
        color: meta.color,
      };
    }

    // Color based on type
    const colors = { fire: '#FF4500', flight: '#87CEEB', shield: '#4169E1', growth: '#32CD32' };
    this.particles.spawnPowerUp(powerUp.x, powerUp.y, colors[type] || '#fff');
    this.camera.shake(3, 5);
    this.audio.play('powerup');
  }

  _killPlayer() {
    if (this.player.dead || this.player.invincible > 0) return;
    this.stompChain = 0;
    this.stompChainTimer = 0;
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
    this.secretGems = this.levelManager.createSecretGems(n, this.secretsCollectedIds);
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
