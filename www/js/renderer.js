// ============================================================
// RENDERER — Sky, ground, HUD, menus, controls overlay
// ============================================================

import { W, H, C } from './constants';
import { easeOutBack, easeOutElastic } from './utils';
import { drawParallax, getParallaxLayers } from './render/parallax';
import { drawContactShadow } from './render/shadows';
import { drawPlatformWithBevel, drawGroundWithDepth } from './render/materials';
import { drawPrincess } from './sprites/princess';
import { drawGoblin } from './sprites/goblin';
import { drawSlime } from './sprites/slime';
import { drawFlyingEnemy } from './sprites/flyingEnemy';
import { drawShooterEnemy } from './sprites/shooterEnemy';
import { drawBoss } from './sprites/boss';
import { drawFrank, drawFrankPlayer } from './sprites/frank';
import {
  drawCloud,
  drawBush,
  drawTree,
  drawCastleBg,
  drawCrystal,
  drawTorch,
  drawRuins,
  drawFlag,
  drawCage,
  drawBarrier,
} from './sprites/environment';
import {
  drawStar,
  drawHeart,
  drawFireball,
  drawEnemyShot,
  drawShieldBubble,
  drawWings,
  drawSecretGem,
} from './sprites/effects';
import { drawTiara } from './sprites/tiara';
import { drawPowerUpOrb, drawAbilityHUD } from './sprites/powerupIcons';
import { hasRunSave } from './progressSave';
import { getLeaderboardTop } from './leaderboard';
import { getTitleUi, TITLE_LAYOUT } from './ui/titleLayout';
import * as Ow from './overworld/overworldMap';
import { MAP_EXIT_BTN } from './ui/mapExitUi';
import { TOUCH_LAYOUT } from './input';
import { HOOPS_GEOM, SLOT_SYMBOLS_COUNT } from './minigames/arcadeMinigames';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.brickPattern = null;
    this._createBrickPattern();
    // Cached parallax layers (rebuilt on level change)
    this._parallaxLayers = null;
    this._parallaxLevelIndex = -1;

    // Feature flags for graphics upgrades
    this.enableParallax = true;
    this.enableShadows = true;
    this.enableMaterials = true;
  }

  _createBrickPattern() {
    const bw = 64,
      bh = 32;
    const bc = document.createElement('canvas');
    bc.width = bw;
    bc.height = bh;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = '#8B7355';
    bctx.fillRect(0, 0, bw, bh);
    const colors = ['#DAA520', '#D4992A', '#E0AD2C', '#CFA030'];
    bctx.fillStyle = colors[0];
    bctx.fillRect(1, 1, 30, 14);
    bctx.fillStyle = colors[1];
    bctx.fillRect(33, 1, 30, 14);
    bctx.fillStyle = colors[2];
    bctx.fillRect(1, 17, 14, 14);
    bctx.fillStyle = colors[3];
    bctx.fillRect(17, 17, 30, 14);
    bctx.fillStyle = colors[0];
    bctx.fillRect(49, 17, 14, 14);
    bctx.fillStyle = 'rgba(255,235,180,0.35)';
    [1, 33].forEach((x) => bctx.fillRect(x, 1, 30, 2));
    [1, 49].forEach((x) => bctx.fillRect(x, 17, 14, 2));
    bctx.fillRect(17, 17, 30, 2);
    bctx.fillStyle = 'rgba(100,70,20,0.3)';
    [1, 33].forEach((x) => bctx.fillRect(x, 13, 30, 2));
    [1, 49].forEach((x) => bctx.fillRect(x, 29, 14, 2));
    bctx.fillRect(17, 29, 30, 2);
    this.brickPattern = this.ctx.createPattern(bc, 'repeat');
  }

  clear() {
    this.ctx.clearRect(0, 0, W, H);
  }

  renderLevel(game) {
    const ctx = this.ctx;
    const ld = game.levelData;
    const cam = game.camera;
    const camX = cam.renderX;
    const camY = cam.renderY;
    const frame = game.frame;

    ctx.save();
    ctx.translate(0, camY);

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ld.sky[0]);
    grad.addColorStop(0.3, ld.sky[1]);
    grad.addColorStop(0.6, ld.sky[2]);
    grad.addColorStop(1, ld.sky[3] || ld.sky[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    if (ld.sun) {
      const sx = ld.sun[0],
        sy = ld.sun[1],
        sr = ld.sun[2];
      const sunGlow = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4);
      sunGlow.addColorStop(0, 'rgba(255,250,220,0.4)');
      sunGlow.addColorStop(0.5, 'rgba(255,240,200,0.1)');
      sunGlow.addColorStop(1, 'rgba(255,230,180,0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,250,230,0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars
    if (ld.stars) {
      const starSeed = [
        30, 90, 120, 200, 280, 60, 170, 320, 350, 40, 150, 250, 310, 100, 210, 340, 80, 260, 180,
        50,
      ];
      for (let i = 0; i < 20; i++) {
        const sx = (starSeed[i] * 3 + i * 200) % W;
        const sy = 50 + ((starSeed[(i + 5) % 20] * 2) % 200);
        const brightness = 0.5 + 0.5 * Math.sin(frame * 0.05 + i);
        ctx.globalAlpha = brightness;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Parallax background layers (far + mid)
    if (this.enableParallax) {
      if (this._parallaxLevelIndex !== game.levelIndex) {
        this._parallaxLayers = getParallaxLayers(game.levelIndex, ld.groundY);
        this._parallaxLevelIndex = game.levelIndex;
      }
      drawParallax(ctx, this._parallaxLayers, camX, camY, W, H);
    }

    // Parallax clouds (0.3x)
    for (const c of ld.clouds) {
      drawCloud(ctx, c.x - camX * 0.3, c.y, c.w);
    }

    // Mid-ground decorations (0.6x)
    for (const d of ld.decorations) {
      const dx = d.x - camX * 0.6;
      if (d.type === 'bush') drawBush(ctx, dx, ld.groundY - 5, d.w);
      else if (d.type === 'tree') drawTree(ctx, dx, ld.groundY);
      else if (d.type === 'castle') drawCastleBg(ctx, dx, ld.groundY);
      else if (d.type === 'crystal') drawCrystal(ctx, dx, ld.groundY, d.h, d.color);
      else if (d.type === 'torch') drawTorch(ctx, dx, ld.groundY - 30, frame);
      else if (d.type === 'ruins') drawRuins(ctx, dx, ld.groundY);
    }

    // Cave ceiling for cave level (level index 2)
    if (game.levelIndex === 2) {
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(0, 0, W, 80);
      for (let i = 0; i < 15; i++) {
        const sx = i * 30 + 10 - ((camX * 0.8) % 30);
        ctx.fillStyle = '#3a3a55';
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 8, 0);
        ctx.lineTo(sx + 4, 30 + (i % 3) * 15);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Ground
    if (ld.hasGround) {
      if (this.enableMaterials) {
        drawGroundWithDepth(ctx, ld.groundY, W, H, camX, this.brickPattern, ld.gaps);
      } else {
        this._renderGround(ld, camX);
      }
    } else {
      ctx.fillStyle = ld.sky[2];
      ctx.fillRect(0, H * 0.6, W, H * 0.4);
    }

    // Platforms
    for (const p of ld.platforms) {
      const px = p.x - camX;
      if (px > W + 20 || px + p.w < -20) continue;
      if (this.enableMaterials) {
        drawPlatformWithBevel(ctx, px, p.y, p.w, 16);
      } else {
        ctx.fillStyle = C.platform;
        ctx.fillRect(px, p.y, p.w, 16);
        ctx.fillStyle = C.platformTop;
        ctx.fillRect(px, p.y, p.w, 4);
      }
    }

    // Barriers (crawl-under obstacles)
    if (ld.barriers) {
      for (const b of ld.barriers) {
        const bx = b.x - camX;
        if (bx > W + 50 || bx + (b.w || 40) < -50) continue;
        drawBarrier(ctx, bx, ld.groundY, b.w, b.gapH, b.totalH);
      }
    }

    // Contact shadows (drawn before entities for correct layering)
    if (this.enableShadows) {
      this._renderShadows(game, camX, ld);
    }

    // Tiaras with idle sparkles
    for (const t of game.tiaras) {
      if (t.collected) continue;
      const tx = t.x - camX;
      if (tx > W + 20 || tx < -20) continue;
      drawTiara(ctx, tx, t.y, t.frame);
      // Idle sparkle particles
      if (frame % 20 === 0) {
        game.particles.create(
          t.x + (Math.random() - 0.5) * 20,
          t.y - 5 + (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 0.5,
          -Math.random() * 0.8,
          '#FFD700',
          15,
          2,
          'star'
        );
      }
    }

    // Power-ups
    for (const p of game.powerUps) {
      if (p.collected) continue;
      const px = p.x - camX;
      if (px > W + 20 || px < -20) continue;
      drawPowerUpOrb(ctx, px, p.y, p.type, p.frame);
    }

    // Secret gems (explore crawl tunnels & risky air pockets)
    for (const g of game.secretGems) {
      if (g.collected) continue;
      const gx = g.x - camX;
      if (gx > W + 24 || gx < -24) continue;
      drawSecretGem(ctx, gx, g.y, g.frame, g.reveal);
    }

    // Flag
    if (game.flag) {
      drawFlag(ctx, game.flag.x - camX, game.flag.y, game.flag.reachedFrame || 0);
    }

    // Cage + captured character
    if (game.cage) {
      drawCage(ctx, game.cage.x - camX, game.cage.y, game.cage.open);
      if (game.character === 'frank') {
        // Playing as Frank — Princess is in cage
        if (game.cage.open) {
          drawPrincess(ctx, game.cage.x + 35 + 50 - camX, game.cage.y + 80, 1, frame, false);
        } else {
          drawPrincess(ctx, game.cage.x + 35 - camX, game.cage.y + 80, 1, frame, false);
        }
      } else {
        // Playing as Princess — Frank is in cage
        if (game.cage.open) {
          drawFrank(ctx, game.cage.x + 35 + 50 - camX, game.cage.y + 55, frame, true);
        } else {
          drawFrank(ctx, game.cage.x + 35 - camX, game.cage.y + 55, frame, false);
        }
      }
    }

    // Projectiles
    for (const proj of game.projectiles) {
      if (!proj.alive) continue;
      const px = proj.x - camX;
      if (px > W + 20 || px < -20) continue;
      if (proj.owner === 'player') {
        drawFireball(ctx, px, proj.y, proj.frame, proj.facing);
      } else {
        drawEnemyShot(ctx, px, proj.y, proj.frame);
      }
    }

    // Enemies
    for (const en of game.enemies) {
      const ex = en.x - camX;
      if (ex > W + 60 || ex < -60) continue;

      if (en.alive) {
        if (en.subtype === 'slime') drawSlime(ctx, ex, en.y, en.frame, false);
        else if (en.subtype === 'flying') drawFlyingEnemy(ctx, ex, en.y, en.frame, false);
        else if (en.subtype === 'shooter')
          drawShooterEnemy(ctx, ex, en.y, en.frame, en.facing, false);
        else if (en.subtype === 'boss')
          drawBoss(ctx, ex, en.y, en.frame, en.phase, en.hp, en.maxHp, en.dazed, en.facing);
        else drawGoblin(ctx, ex, en.y, en.frame, false);

        // White flash overlay on damage
        if (en.flashTimer > 0 && en.flashTimer % 2 === 0) {
          this._flashOverlay(ctx, ex - en.w / 2, en.y, en.w, en.h);
        }
      } else if (en.squishTimer > 0) {
        if (en.subtype === 'slime') drawSlime(ctx, ex, en.y + 12, en.frame, true);
        else if (en.subtype === 'flying') drawFlyingEnemy(ctx, ex, en.y + 12, en.frame, true);
        else if (en.subtype === 'shooter')
          drawShooterEnemy(ctx, ex, en.y + 16, en.frame, en.facing, true);
        else if (en.subtype === 'boss')
          drawBoss(ctx, ex, en.y, en.frame, en.phase, 0, en.maxHp, true, en.facing);
        else drawGoblin(ctx, ex, en.y + 20, en.frame, true);
      }
    }

    // Player
    const player = game.player;
    if (!player.dead || player.deathTimer < 90) {
      const px = player.x - camX;
      if (player.invincible > 0 && frame % 6 < 3) {
        // blink
      } else {
        // Shield bubble (draw behind)
        if (player.hasAbility('shield')) {
          const shield = player.getAbility('shield');
          drawShieldBubble(ctx, px, player.y, player.w, player.h, shield.hits, frame);
        }
        // Wings (draw behind)
        if (player.hasAbility('flight')) {
          drawWings(ctx, px, player.y + 15, frame);
        }

        const growthScale = player.hasAbility('growth') ? 1.5 : 1;
        if (game.character === 'frank') {
          drawFrankPlayer(
            ctx,
            px,
            player.y + player.h,
            player.facing,
            player.frame,
            !player.onGround,
            player.crouching,
            player.scaleX * growthScale,
            player.scaleY * growthScale
          );
        } else {
          drawPrincess(
            ctx,
            px,
            player.y + player.h,
            player.facing,
            player.frame,
            !player.onGround,
            player.crouching,
            player.scaleX * growthScale,
            player.scaleY * growthScale
          );
        }

        // Player damage flash
        if (player.flashTimer > 0 && player.flashTimer % 2 === 0) {
          this._flashOverlay(ctx, px - player.w / 2, player.y, player.w, player.h);
        }
      }
    }

    // Particles
    this._renderParticles(game.particles, camX);

    ctx.restore();
  }

  _renderGround(ld, camX) {
    const ctx = this.ctx;
    const gy = ld.groundY;

    if (ld.gaps) {
      let segments = [];
      let lastEnd = -camX;
      const sorted = [...ld.gaps].sort((a, b) => a.x - b.x);
      for (const g of sorted) {
        segments.push({ x: lastEnd, w: g.x - camX - lastEnd });
        lastEnd = g.x + g.w - camX;
      }
      segments.push({ x: lastEnd, w: W - lastEnd + camX + 200 });
      for (const seg of segments) {
        if (seg.w <= 0) continue;
        ctx.fillStyle = '#E8C252';
        ctx.fillRect(seg.x, gy, seg.w, 4);
        ctx.save();
        ctx.beginPath();
        ctx.rect(seg.x, gy + 4, seg.w, H - gy - 4);
        ctx.clip();
        ctx.fillStyle = this.brickPattern;
        ctx.translate(-(camX % 64), 0);
        ctx.fillRect(0, gy + 4, W + 128, H - gy - 4);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = '#E8C252';
      ctx.fillRect(0, gy, W, 4);
      ctx.save();
      ctx.fillStyle = this.brickPattern;
      ctx.translate(-(camX % 64), 0);
      ctx.fillRect(0, gy + 4, W + 64, H - gy - 4);
      ctx.restore();
    }
  }

  _renderShadows(game, camX, ld) {
    const ctx = this.ctx;
    const groundY = ld.groundY;

    // Find ground surface for an entity (check platforms too)
    const findGround = (ex, ey, eh) => {
      const bottom = ey + eh;
      let bestY = ld.hasGround ? groundY : 9999;

      // Check platforms below entity
      for (const p of ld.platforms) {
        if (ex > p.x && ex < p.x + p.w && p.y >= bottom - 5 && p.y < bestY) {
          bestY = p.y;
        }
      }
      return bestY;
    };

    // Player shadow
    const p = game.player;
    if (p && !p.dead) {
      const gY = findGround(p.x, p.y, p.h);
      const heightAbove = gY - (p.y + p.h);
      drawContactShadow(ctx, p.x - camX, gY, heightAbove, 16);
    }

    // Enemy shadows
    for (const en of game.enemies) {
      if (!en.alive) continue;
      const ex = en.x;
      const gY = findGround(ex, en.y, en.h);
      const heightAbove = gY - (en.y + en.h);
      const radius = en.type === 'boss' ? 30 : en.w * 0.4;
      drawContactShadow(ctx, ex - camX, gY, heightAbove, radius);
    }
  }

  _flashOverlay(ctx, x, y, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  _renderParticles(particleSystem, camX) {
    const ctx = this.ctx;
    for (const p of particleSystem.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      if (p.type === 'star') {
        drawStar(ctx, p.x - camX, p.y, p.size, p.color);
      } else if (p.type === 'heart') {
        drawHeart(ctx, p.x - camX, p.y, p.size, p.color);
      } else if (p.type === 'text') {
        ctx.font = 'bold 18px Georgia';
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x - camX, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camX, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  renderHUD(game) {
    const ctx = this.ctx;
    const hudY = 54;

    // Hearts
    for (let i = 0; i < Math.min(game.lives, 10); i++) {
      drawHeart(ctx, 24 + i * 22, hudY, 8, C.heart);
    }

    // HP pips (if growth active)
    if (game.player.maxHp > 1) {
      for (let i = 0; i < game.player.hp; i++) {
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(24 + i * 14, hudY + 22, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Score
    ctx.font = 'bold 20px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(game.score, W - 20, hudY + 6);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (game.stompChain > 1 && game.stompChainTimer > 0) {
      ctx.font = 'bold 13px Georgia';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'right';
      ctx.fillText(`STOMP ×${game.stompChain}`, W - 20, hudY + 26);
    }

    ctx.textAlign = 'left';

    // Level name
    ctx.font = '14px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(game.levelData.name, W / 2, hudY + 4);

    // Timer & tiara counter (medal tracking hints)
    const seconds = Math.floor(game.levelTimer / 60);
    const parTime = game.levelData.parTime;
    ctx.font = '12px Georgia';
    ctx.fillStyle = seconds <= parTime ? 'rgba(255,255,255,0.35)' : 'rgba(255,130,130,0.5)';
    ctx.fillText(seconds + 's', W / 2 - 25, hudY + 20);
    ctx.fillStyle =
      game.levelTiarasCollected >= game.levelTotalTiaras
        ? 'rgba(90,200,90,0.6)'
        : 'rgba(255,215,0,0.4)';
    ctx.fillText(game.levelTiarasCollected + '/' + game.levelTotalTiaras, W / 2 + 25, hudY + 20);
    ctx.textAlign = 'left';

    // Ability HUD icons
    const abilities = game.player.abilities;
    for (let i = 0; i < abilities.length; i++) {
      drawAbilityHUD(
        ctx,
        30 + i * 36,
        hudY + 45,
        abilities[i].type,
        abilities[i].remaining,
        abilities[i].total,
        game.frame
      );
    }

    // Boss HP bar
    const boss = game.enemies.find((e) => e.type === 'boss' && e.alive);
    if (boss) {
      this._renderBossHP(boss);
    }

    if (game.player && !game.player.dead) {
      this._renderMapExitChip(ctx);
    }
  }

  _renderMapExitChip(ctx) {
    const b = MAP_EXIT_BTN;
    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = 'rgba(25,32,72,0.88)';
    ctx.strokeStyle = 'rgba(255,255,255,0.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = 'bold 14px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MAP', b.x + b.w / 2, b.y + b.h / 2 - 6);
    ctx.font = '9px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.58)';
    ctx.fillText('tap · M · Esc', b.x + b.w / 2, b.y + b.h / 2 + 10);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }

  _renderBossHP(boss) {
    const ctx = this.ctx;
    const barW = 200,
      barH = 12;
    const bx = (W - barW) / 2;
    const by = 80;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, barW, barH);
    const pct = boss.hp / boss.maxHp;
    const hpColor = pct > 0.5 ? '#e74c3c' : pct > 0.25 ? '#e67e22' : '#c0392b';
    ctx.fillStyle = hpColor;
    ctx.fillRect(bx, by, barW * pct, barH);

    ctx.font = 'bold 10px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('GOBLIN KING', W / 2, by - 4);
    ctx.textAlign = 'left';
  }

  renderControls(input, opts) {
    const ctx = this.ctx;
    const showUp = opts && opts.showUp;
    const dp = TOUCH_LAYOUT.dpad;
    const jb = TOUCH_LAYOUT.jump;
    const fb = TOUCH_LAYOUT.fire;

    ctx.save();

    // ---- D-pad: rounded plus shape ----
    const r = 36;
    const arm = 22;
    const cx = dp.cx;
    const cy = dp.cy;
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - r - arm, cy - r * 0.5, (r + arm) * 2, r, 14);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(cx - r * 0.5, cy - r - arm, r, (r + arm) * 2, 14);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = input ? 0.7 : 0.5;
    const arrow = (dx, dy, on) => {
      ctx.fillStyle = on ? '#FFD66B' : 'rgba(20,20,30,0.55)';
      ctx.beginPath();
      const px = cx + dx;
      const py = cy + dy;
      const a = Math.atan2(dy, dx);
      const t = 9;
      const len = 11;
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      const tx = -ny;
      const ty = nx;
      ctx.moveTo(px + nx * len, py + ny * len);
      ctx.lineTo(px - nx * len + tx * t, py - ny * len + ty * t);
      ctx.lineTo(px - nx * len - tx * t, py - ny * len - ty * t);
      ctx.closePath();
      ctx.fill();
    };
    arrow(-44, 0, !!input?.left);
    arrow(44, 0, !!input?.right);
    arrow(0, 44, !!input?.down);
    if (showUp) arrow(0, -44, !!input?.up);

    // ---- A (jump) ----
    ctx.globalAlpha = input?.jumpPressed ? 0.95 : 0.7;
    const grad = ctx.createRadialGradient(jb.cx - 8, jb.cy - 8, 4, jb.cx, jb.cy, jb.r);
    grad.addColorStop(0, input?.jumpPressed ? '#ff8a8a' : '#ff5e62');
    grad.addColorStop(1, '#9a1a1f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(jb.cx, jb.cy, jb.r * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', jb.cx, jb.cy);

    // ---- B (fire) ----
    ctx.globalAlpha = input?.firePressed ? 0.95 : 0.7;
    const grad2 = ctx.createRadialGradient(fb.cx - 6, fb.cy - 6, 3, fb.cx, fb.cy, fb.r);
    grad2.addColorStop(0, input?.firePressed ? '#ffd06b' : '#ff9a3c');
    grad2.addColorStop(1, '#a83a06');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(fb.cx, fb.cy, fb.r * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Georgia';
    ctx.fillText('B', fb.cx, fb.cy);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }

  renderAbilityFanfare(game) {
    const f = game.abilityFanfare;
    if (!f || (f.timer <= 0 && f.freezeLeft <= 0)) return;
    const ctx = this.ctx;
    const t = f.timer / 105;
    const alpha = Math.min(1, (105 - f.timer) / 18) * (0.35 + 0.45 * (1 - t * 0.5));

    ctx.save();
    ctx.fillStyle = `rgba(8,6,24,${alpha * 0.92})`;
    ctx.fillRect(0, 0, W, H);

    const ring = ctx.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H * 0.42, 220);
    ring.addColorStop(0, (f.color || '#fff') + '44');
    ring.addColorStop(1, 'transparent');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.42, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = f.color || '#fff';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.42, 72 + Math.sin(game.frame * 0.12) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = 'bold 11px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('POWER-UP', W / 2, H * 0.32);

    ctx.font = 'bold 26px Georgia';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(f.title, W / 2, H * 0.4);
    ctx.shadowBlur = 0;

    ctx.font = '15px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const words = f.tagline;
    const maxW = W - 48;
    this._wrapText(ctx, words, W / 2, H * 0.46, maxW, 20);

    ctx.font = '13px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(
      f.freezeLeft > 0 ? 'Hang on…' : 'Good luck.',
      W / 2,
      H * 0.58
    );

    ctx.restore();
  }

  _wrapText(ctx, text, cx, startY, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let y = startY;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line.length > 0) {
        ctx.fillText(line.trim(), cx, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), cx, y);
  }

  renderLeaderboard(game) {
    const ctx = this.ctx;
    const rows = getLeaderboardTop(12);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0f0820');
    grad.addColorStop(1, '#2d1b50');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 28px Georgia';
    ctx.fillStyle = C.crown;
    ctx.textAlign = 'center';
    ctx.fillText('Hall of Fame', W / 2, 56);

    ctx.font = '13px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('Local highs · this device', W / 2, 78);

    let y = 118;
    if (!rows.length) {
      ctx.font = '16px Georgia';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('No scores yet — beat a level!', W / 2, H / 2);
    } else {
      ctx.font = 'bold 14px Georgia';
      ctx.fillStyle = 'rgba(255,215,0,0.65)';
      ctx.textAlign = 'left';
      ctx.fillText('#', 36, y);
      ctx.fillText('Hero', 62, y);
      ctx.textAlign = 'right';
      ctx.fillText('Score', W - 36, y);
      y += 22;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.moveTo(28, y);
      ctx.lineTo(W - 28, y);
      ctx.stroke();

      y += 18;
      ctx.font = '15px Georgia';
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        ctx.textAlign = 'left';
        ctx.fillStyle = i < 3 ? '#FFD700' : 'rgba(255,255,255,0.88)';
        ctx.fillText(String(i + 1), 36, y);
        const tag = r.character === 'frank' ? '[F]' : '[P]';
        ctx.fillText(tag + ' ' + r.name, 62, y);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText(String(r.score), W - 36, y);
        y += 30;
      }
    }

    ctx.textAlign = 'center';
    ctx.font = '15px Georgia';
    ctx.fillStyle = Math.sin(game.frame * 0.08) > 0 ? '#fff' : 'rgba(255,255,255,0.55)';
    ctx.fillText('Tap Back to return', W / 2, H - 44);

    ctx.textAlign = 'left';
  }

  renderTitle(game) {
    const frame = game.frame;
    const ctx = this.ctx;
    const hasSave = hasRunSave();
    const ui = getTitleUi(hasSave);
    const cursor = game.selectCursor;
    const t = TITLE_LAYOUT;

    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1f3a8a');
    grad.addColorStop(0.55, '#5b8def');
    grad.addColorStop(1, '#9ec6ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Soft drifting clouds
    ctx.globalAlpha = 0.65;
    drawCloud(ctx, ((frame * 0.22) % (W + 200)) - 80, 60, 64);
    drawCloud(ctx, ((frame * 0.13 + 220) % (W + 200)) - 80, 110, 50);
    drawCloud(ctx, ((frame * 0.18 + 80) % (W + 200)) - 80, 740, 70);
    ctx.globalAlpha = 1;

    // Subtle bottom haze for separation
    const haze = ctx.createLinearGradient(0, H - 160, 0, H);
    haze.addColorStop(0, 'rgba(0,0,0,0)');
    haze.addColorStop(1, 'rgba(15,15,40,0.4)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, H - 160, W, 160);

    // ---- Title block ----
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.font = 'bold 38px Georgia';
    ctx.fillStyle = C.crown;
    ctx.fillText('Princess & Frank', W / 2, t.titleY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = '15px Georgia';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowOffsetY = 1;
    ctx.fillText('Save the Pug — Kingdom Adventure', W / 2, t.subtitleY);
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    // ---- Hero panels ----
    const drawHeroPanel = (panel, selected, label, sublabel, drawSprite) => {
      const ps = selected ? 1 + Math.sin(frame * 0.08) * 0.025 : 1;
      ctx.save();
      ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
      ctx.scale(ps, ps);
      ctx.translate(-(panel.x + panel.w / 2), -(panel.y + panel.h / 2));

      // Card background
      ctx.fillStyle = selected ? 'rgba(20, 30, 70, 0.7)' : 'rgba(20, 30, 70, 0.45)';
      ctx.beginPath();
      ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 14);
      ctx.fill();
      ctx.strokeStyle = selected ? C.crown : 'rgba(255,255,255,0.45)';
      ctx.lineWidth = selected ? 4 : 2;
      ctx.beginPath();
      ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 14);
      ctx.stroke();
      ctx.lineWidth = 1;

      // Sprite area (top 75%)
      drawSprite(panel);

      // Name label
      ctx.font = 'bold 18px Georgia';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowOffsetY = 1;
      ctx.fillText(label, panel.x + panel.w / 2, panel.y + panel.h - 32);
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = 'transparent';

      ctx.font = '12px Georgia';
      ctx.fillStyle = selected ? '#FFE08A' : 'rgba(255,255,255,0.7)';
      ctx.fillText(sublabel, panel.x + panel.w / 2, panel.y + panel.h - 14);

      ctx.restore();
    };

    drawHeroPanel(ui.princessPanel, cursor === 0, 'Princess', 'Royal hero', (panel) => {
      drawPrincess(
        ctx,
        panel.x + panel.w / 2,
        panel.y + panel.h - 80,
        1,
        frame,
        false,
        false,
        1.2,
        1.2
      );
    });

    drawHeroPanel(ui.frankPanel, cursor === 1, 'Frank', 'Brave pug', (panel) => {
      drawFrank(ctx, panel.x + panel.w / 2 - 10, panel.y + panel.h - 90, frame, true);
    });

    // Mission line
    ctx.textAlign = 'center';
    ctx.font = '14px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowOffsetY = 1;
    ctx.fillText(
      cursor === 0 ? 'Rescue Frank from the Goblin King' : 'Rescue the Princess from the Goblin King',
      W / 2,
      t.missionY
    );
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    // ---- Buttons ----
    const drawBtn = (b, label, sub, variant) => {
      const isPrimary = variant === 'primary';
      const isAccent = variant === 'accent';
      const fillTop = isAccent ? '#2ecc71' : isPrimary ? '#FFD66B' : 'rgba(255,255,255,0.12)';
      const fillBot = isAccent ? '#16a34a' : isPrimary ? '#e0a915' : 'rgba(255,255,255,0.05)';
      const stroke = isAccent ? '#0c5e2c' : isPrimary ? '#7a4f00' : 'rgba(255,255,255,0.5)';
      const textColor = isAccent || isPrimary ? '#1b1535' : '#fff';

      const bgGrad = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
      bgGrad.addColorStop(0, fillTop);
      bgGrad.addColorStop(1, fillBot);
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 14);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 19px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + (sub ? -4 : 6));
      if (sub) {
        ctx.font = '12px Georgia';
        ctx.fillStyle = isAccent || isPrimary ? 'rgba(27,21,53,0.7)' : 'rgba(255,255,255,0.65)';
        ctx.fillText(sub, b.x + b.w / 2, b.y + b.h / 2 + 16);
      }
    };

    for (const b of ui.buttons) {
      if (b.id === 'continue') drawBtn(b, 'Continue Run', 'Resume on the kingdom map', 'accent');
      else if (b.id === 'newGame')
        drawBtn(
          b,
          'New Adventure',
          hasSave
            ? 'Clears save · start fresh'
            : `${game.levelManager.totalLevels} stages · 3 mini-games`,
          'primary'
        );
      else if (b.id === 'leaderboard') drawBtn(b, 'Leaderboard', null, 'plain');
    }

    // ---- Footer ----
    const earned = game.medalManager.getTotalEarned();
    if (earned > 0) {
      const total = game.medalManager.getTotalPossible();
      const label = `${earned} / ${total} medals`;
      ctx.font = '13px Georgia';
      const tw = ctx.measureText(label).width;
      const totalW = tw + 22;
      const startX = W / 2 - totalW / 2;
      drawStar(ctx, startX + 8, t.medalsY, 8, '#FFD700');
      ctx.fillStyle = earned >= total ? '#FFD700' : 'rgba(255,215,0,0.85)';
      ctx.textAlign = 'left';
      ctx.fillText(label, startX + 22, t.medalsY + 4);
    }

    ctx.textAlign = 'center';
    ctx.font = '11px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('Tap a hero, then a button · ← → · Space · C · L', W / 2, t.footerY);

    ctx.textAlign = 'left';
  }

  renderLevelComplete(game) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);

    const timer = game.levelCompleteTimer;

    // Title bounce-in
    const t = Math.min(timer / 25, 1);
    const scale = easeOutBack(t);
    ctx.save();
    ctx.translate(W / 2, H * 0.28);
    ctx.scale(scale, scale);
    ctx.font = 'bold 36px Georgia';
    ctx.fillStyle = C.crown;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('Level Clear!', 0, 0);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = '20px Georgia';
    ctx.fillStyle = '#fff';
    ctx.fillText(game.levelData.name, 0, 40);
    ctx.restore();

    // Medal results
    if (game.medalResults) {
      const startY = H * 0.43;
      const rowH = 55;
      const delays = [40, 65, 90];

      for (let i = 0; i < game.medalResults.length; i++) {
        if (timer < delays[i]) continue;
        const r = game.medalResults[i];
        const rowY = startY + i * rowH;
        const rowT = Math.min((timer - delays[i]) / 15, 1);
        const rowScale = easeOutBack(rowT);

        ctx.save();
        ctx.globalAlpha = rowT;
        ctx.translate(W / 2, rowY);
        ctx.scale(rowScale, rowScale);

        // Star icon
        const starColor = r.earned ? '#FFD700' : '#555';
        drawStar(ctx, -145, 0, 12, starColor);

        // Label
        ctx.font = 'bold 18px Georgia';
        ctx.fillStyle = r.earned ? '#fff' : '#888';
        ctx.textAlign = 'left';
        ctx.fillText(r.label, -120, 6);

        // Value
        ctx.textAlign = 'right';
        ctx.font = '16px Georgia';
        if (r.type === 'collector') {
          ctx.fillStyle = r.earned ? '#5cb85c' : '#aaa';
          ctx.fillText(r.value + '/' + r.target, 130, 6);
        } else if (r.type === 'speedrun') {
          ctx.fillStyle = r.earned ? '#5cb85c' : '#aaa';
          ctx.fillText(r.value + 's / ' + r.target + 's', 130, 6);
        } else {
          ctx.fillStyle = r.earned ? '#5cb85c' : '#aaa';
          ctx.fillText(
            r.value === 0 ? 'Perfect!' : r.value + ' hit' + (r.value !== 1 ? 's' : ''),
            130,
            6
          );
        }

        // "NEW!" flash for newly earned medals
        if (r.newlyEarned && Math.sin(timer * 0.15) > 0) {
          ctx.font = 'bold 13px Georgia';
          ctx.fillStyle = '#FF4500';
          ctx.textAlign = 'center';
          ctx.fillText('NEW!', 155, 6);
        }

        ctx.restore();
      }
    }

    // Tap to continue
    if (timer > 180 && Math.sin(game.frame * 0.08) > 0) {
      ctx.font = '18px Georgia';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('Jump — return to kingdom map', W / 2, H * 0.72);
    }

    ctx.textAlign = 'left';
  }

  renderGameOver(game) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a0533');
    grad.addColorStop(1, '#2d1b69');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 42px Georgia';
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('Game Over', W / 2, H * 0.35);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = '22px Georgia';
    ctx.fillStyle = C.crown;
    ctx.fillText('Score: ' + game.score, W / 2, H * 0.45);

    if (game.gameOverTimer > 60) {
      if (Math.sin(game.frame * 0.08) > 0) {
        ctx.font = '18px Georgia';
        ctx.fillStyle = '#fff';
        ctx.fillText('Tap — save score & return to title', W / 2, H * 0.58);
      }
    }

    ctx.textAlign = 'left';
  }

  renderVictory(game) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);

    const vt = Math.min(game.victoryTimer / 25, 1);
    const scale = easeOutElastic(vt);
    ctx.save();
    ctx.translate(W / 2, 180);
    ctx.scale(scale, scale);

    ctx.font = 'bold 40px Georgia';
    ctx.fillStyle = C.crown;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('YOU DID IT!', 0, 0);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = '20px Georgia';
    ctx.fillStyle = '#fff';
    const savedName = game.character === 'frank' ? 'The Princess is saved!' : 'Frank is saved!';
    ctx.fillText(savedName, 0, 40);

    ctx.font = '22px Georgia';
    ctx.fillStyle = C.crown;
    ctx.fillText('Final Score: ' + game.score, 0, 90);

    ctx.restore();

    // Medal results for final level
    if (game.medalResults && game.victoryTimer > 40) {
      const startY = 320;
      const rowH = 45;
      const delays = [40, 60, 80];

      for (let i = 0; i < game.medalResults.length; i++) {
        if (game.victoryTimer < delays[i]) continue;
        const r = game.medalResults[i];
        const rowY = startY + i * rowH;
        const rowT = Math.min((game.victoryTimer - delays[i]) / 15, 1);

        ctx.save();
        ctx.globalAlpha = rowT;

        const starColor = r.earned ? '#FFD700' : '#555';
        drawStar(ctx, W / 2 - 145, rowY, 10, starColor);

        ctx.font = '16px Georgia';
        ctx.fillStyle = r.earned ? '#fff' : '#888';
        ctx.textAlign = 'left';
        ctx.fillText(r.label, W / 2 - 120, rowY + 5);

        ctx.textAlign = 'right';
        ctx.font = '14px Georgia';
        ctx.fillStyle = r.earned ? '#5cb85c' : '#aaa';
        if (r.type === 'collector') {
          ctx.fillText(r.value + '/' + r.target, W / 2 + 130, rowY + 5);
        } else if (r.type === 'speedrun') {
          ctx.fillText(r.value + 's / ' + r.target + 's', W / 2 + 130, rowY + 5);
        } else {
          ctx.fillText(
            r.value === 0 ? 'Perfect!' : r.value + ' hit' + (r.value !== 1 ? 's' : ''),
            W / 2 + 130,
            rowY + 5
          );
        }

        ctx.restore();
      }

      // Total medal progress
      if (game.victoryTimer > 100) {
        const earned = game.medalManager.getTotalEarned();
        const total = game.medalManager.getTotalPossible();
        const totalY = startY + 3 * rowH + 10;
        ctx.font = 'bold 16px Georgia';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        drawStar(ctx, W / 2 - 55, totalY, 10, '#FFD700');
        ctx.fillText('Total: ' + earned + ' / ' + total, W / 2 + 10, totalY + 5);
      }
    }

    if (game.victoryTimer > 120) {
      if (Math.sin(game.frame * 0.08) > 0) {
        ctx.font = '20px Georgia';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Tap to Play Again', W / 2, H * 0.68);
      }
    }

    ctx.textAlign = 'left';
  }

  renderWorldHud(game) {
    const ctx = this.ctx;
    const hudY = 54;
    for (let i = 0; i < Math.min(game.lives, 10); i++) {
      drawHeart(ctx, 24 + i * 22, hudY, 8, C.heart);
    }
    ctx.font = 'bold 20px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 3;
    ctx.fillText(game.score, W - 20, hudY + 6);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.font = '15px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillText('Kingdom Map', W / 2, hudY + 8);
    ctx.textAlign = 'left';
  }

  renderOverworld(game) {
    const ctx = this.ctx;
    ctx.save();

    const playerPos = Ow.getOwPlayerPos(game.ow);
    const playerFacing = Ow.getOwPlayerFacing(game.ow);
    const camX = playerPos.x - W / 2;
    const camY = playerPos.y - H * 0.55;
    const sx = (wx) => wx - camX;
    const sy = (wy) => wy - camY;
    const frame = game.frame;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#5dabe8');
    sky.addColorStop(0.55, '#a3d9b1');
    sky.addColorStop(1, '#67c08c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Soft clouds parallax
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 220 - camX * 0.18 + 1500) % (W + 200)) - 100;
      const cy = 80 + (i % 3) * 60 - camY * 0.05;
      drawCloud(ctx, cx, cy, 60 + (i % 2) * 24);
    }

    // Distant hills
    ctx.fillStyle = 'rgba(67, 168, 102, 0.72)';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i < 16; i++) {
      const xPos = ((i * 130 - camX * 0.45 + 2000) % (W + 200)) - 100;
      ctx.lineTo(xPos, H - 130 - 40 * Math.abs(Math.sin(i * 1.3)));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(46,170,90,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i < 18; i++) {
      const xPos = ((i * 110 - camX * 0.7 + 2000) % (W + 200)) - 100;
      ctx.lineTo(xPos, H - 70 - 30 * Math.abs(Math.sin(i * 0.9 + 1)));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Path edges — walked (between two reachable nodes) vs unwalked
    const edges = Ow.getOwEdges();
    const isWalked = (e) => {
      const a = Ow.getOwNode(e.aId);
      const b = Ow.getOwNode(e.bId);
      const ar = Ow.isNodeReachable(a, game.maxReachableLevel);
      const br = Ow.isNodeReachable(b, game.maxReachableLevel);
      return ar && br;
    };

    const drawEdge = (e, walked) => {
      const ax = sx(e.ax);
      const ay = sy(e.ay);
      const bx = sx(e.bx);
      const by = sy(e.by);
      const cx = sx(e.cx);
      const cy = sy(e.cy);

      ctx.strokeStyle = walked ? 'rgba(110,80,40,0.7)' : 'rgba(60,50,40,0.45)';
      ctx.lineWidth = walked ? 36 : 30;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cx, cy, bx, by);
      ctx.stroke();

      ctx.strokeStyle = walked ? 'rgba(232,196,82,0.95)' : 'rgba(160,140,90,0.55)';
      ctx.lineWidth = walked ? 28 : 22;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cx, cy, bx, by);
      ctx.stroke();

      // Dashed centre stripe on walked path
      if (walked) {
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 10]);
        ctx.lineDashOffset = -((frame * 0.6) % 18);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx, cy, bx, by);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    for (const e of edges) drawEdge(e, isWalked(e));
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';

    // Nodes (level pins + arcades)
    const nodes = Ow.getOwNodes();
    for (const b of nodes) {
      const x = sx(b.x);
      const y = sy(b.y);
      if (x < -160 || x > W + 160 || y < -160 || y > H + 160) continue;

      const reachable = Ow.isNodeReachable(b, game.maxReachableLevel);
      const locked = b.kind === 'level' && !reachable;
      const usedMini = b.kind === 'minigame' && game.minigamesUsed[b.miniId];
      const isCurrent = !game.ow.traversal && game.ow.nodeId === b.id;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(x + b.w / 2, y + b.h + 8, b.w * 0.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight ring on the current node
      if (isCurrent) {
        const pulse = 0.55 + 0.35 * Math.sin(frame * 0.18);
        ctx.strokeStyle = `rgba(255, 230, 130, ${pulse})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + b.w / 2, y + b.h / 2, Math.max(b.w, b.h) * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      if (b.kind === 'level') {
        this._drawStagePin(b, x, y, frame, locked, b.levelIndex < game.maxReachableLevel);
        const medals = game.medalManager.getMedals(b.levelIndex);
        const earned =
          (medals.collector ? 1 : 0) + (medals.speedrun ? 1 : 0) + (medals.flawless ? 1 : 0);
        if (earned > 0) {
          for (let i = 0; i < 3; i++) {
            const mx = x + 14 + i * 22;
            drawStar(ctx, mx, y - 14, 7, i < earned ? '#FFD700' : 'rgba(255,255,255,0.25)');
          }
        }
      } else {
        this._drawArcadePin(b, x, y, frame, usedMini);
      }
    }

    // Player + walking bob
    const px = sx(playerPos.x);
    const py = sy(playerPos.y);
    const moving = !!game.ow.traversal;
    const bob = moving ? Math.sin(frame * 0.4) * 3 : Math.sin(frame * 0.1) * 1;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 22, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py + bob);
    ctx.scale(0.5, 0.5);
    if (game.character === 'frank') {
      drawFrankPlayer(ctx, 0, 0, playerFacing, frame, false, false, 1, 1);
    } else {
      drawPrincess(ctx, 0, 0, playerFacing, frame, false, false, 1, 1);
    }
    ctx.restore();

    // Help banner
    ctx.font = '13px Georgia';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText('D-pad walks the path · A enters · MAP exits a level', W / 2, H - 26);

    if (game.owTarget) {
      const label =
        game.owTarget.kind === 'level'
          ? `Enter Level ${game.owTarget.levelIndex + 1}`
          : `Play ${game.owTarget.label}`;
      this._drawPrompt(ctx, label + ' — A', W / 2, H - 56, frame);
    }

    ctx.restore();
  }

  _drawStagePin(b, x, y, frame, locked, cleared) {
    const ctx = this.ctx;
    const w = b.w;
    const h = b.h;
    const isFinal = b.final;
    const isBoss = b.boss;
    const baseColor = locked
      ? '#7a7a8a'
      : isFinal
        ? '#5b3691'
        : isBoss
          ? '#5d3a1f'
          : '#9a4dba';
    const roofColor = locked ? '#9a9aab' : isFinal ? '#fac24a' : isBoss ? '#3b2114' : '#f6e58d';
    const trimColor = locked ? '#5a5a6a' : '#4a2660';

    // Castle base
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, w, h);

    // Battlements
    ctx.fillStyle = baseColor;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 2 + i * (w / 4), y - 8, w / 4 - 4, 8);
    }

    // Roof / banner
    if (isFinal) {
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + w / 2, y - 30);
      ctx.lineTo(x + w + 4, y);
      ctx.closePath();
      ctx.fill();
      // Star on top
      drawStar(ctx, x + w / 2, y - 32, 7, '#FFEC99');
    } else {
      ctx.fillStyle = roofColor;
      ctx.fillRect(x + w / 2 - 6, y - 24, 3, 24);
      // Flag
      const flagWag = Math.sin(frame * 0.18) * 3;
      ctx.fillStyle = locked ? '#666' : isBoss ? '#c0392b' : '#fc5185';
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 3, y - 24);
      ctx.lineTo(x + w / 2 + 18 + flagWag, y - 18);
      ctx.lineTo(x + w / 2 - 3, y - 12);
      ctx.closePath();
      ctx.fill();
    }

    // Door
    ctx.fillStyle = trimColor;
    ctx.fillRect(x + w / 2 - 10, y + h - 22, 20, 22);
    ctx.fillStyle = '#FFD66B';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 6, y + h - 12, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Number badge
    ctx.fillStyle = locked ? 'rgba(50,50,60,0.85)' : 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(x + 12, y + 14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = locked ? '#444' : '#3b1f5a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = locked ? 'rgba(255,255,255,0.55)' : '#3b1f5a';
    ctx.font = 'bold 13px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, x + 12, y + 15);
    ctx.textBaseline = 'alphabetic';

    if (locked) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(x, y - 10, w, h + 10);
      ctx.font = 'bold 12px Georgia';
      ctx.fillStyle = '#fff';
      ctx.fillText('LOCKED', x + w / 2, y + h / 2 + 10);
    }

    if (cleared && !locked) {
      ctx.font = 'bold 11px Georgia';
      ctx.fillStyle = '#fff';
      ctx.fillText('CLEARED', x + w / 2, y + h - 32);
    }

    ctx.textAlign = 'left';
  }

  _drawArcadePin(b, x, y, frame, used) {
    const ctx = this.ctx;
    const w = b.w;
    const h = b.h;

    // Tent base
    ctx.fillStyle = used ? '#888' : '#e74c8a';
    ctx.fillRect(x, y, w, h);
    // Stripes
    ctx.fillStyle = used ? '#aaa' : '#fff';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 4 + i * 22, y, 9, h);
    }

    // Roof — circus tent
    ctx.fillStyle = used ? '#666' : '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + w / 2, y - 28);
    ctx.lineTo(x + w + 6, y);
    ctx.closePath();
    ctx.fill();

    // Flag
    const wag = Math.sin(frame * 0.2 + b.x) * 2;
    ctx.fillStyle = used ? '#666' : '#FFD66B';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y - 28);
    ctx.lineTo(x + w / 2 + 14 + wag, y - 22);
    ctx.lineTo(x + w / 2, y - 16);
    ctx.closePath();
    ctx.fill();

    // Sign
    const labelW = 56;
    ctx.fillStyle = used ? 'rgba(50,50,60,0.85)' : 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - labelW / 2, y + h - 26, labelW, 20, 6);
    ctx.fill();
    ctx.strokeStyle = used ? '#555' : '#a83a06';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.font = 'bold 11px Georgia';
    ctx.fillStyle = used ? 'rgba(255,255,255,0.5)' : '#a83a06';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, x + w / 2, y + h - 12);
    ctx.textAlign = 'left';

    if (used) {
      ctx.font = 'bold 10px Georgia';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('PLAYED', x + w / 2, y + h + 14);
      ctx.textAlign = 'left';
    }
  }

  _drawPrompt(ctx, text, cx, cy, frame) {
    ctx.font = 'bold 15px Georgia';
    const tw = ctx.measureText(text).width;
    const pad = 14;
    const bw = tw + pad * 2;
    const bh = 30;
    const pulse = 0.85 + Math.sin(frame * 0.18) * 0.12;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = 'rgba(33, 18, 66, 0.92)';
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }

  renderMinigame(game) {
    const ctx = this.ctx;
    const m = game.mini;
    if (!m) return;

    if (m.kind === 'slot') this._renderSlot(game, m);
    else if (m.kind === 'claw') this._renderClaw(game, m);
    else if (m.kind === 'hoops') this._renderHoops(game, m);

    ctx.font = '12px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('A — advance · M / Esc / L — exit arcade', W / 2, H - 18);
    ctx.textAlign = 'left';
  }

  _renderSlot(game, m) {
    const ctx = this.ctx;
    const frame = game.frame;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#3b1f5a');
    bg.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = 'bold 26px Georgia';
    ctx.fillStyle = '#FFD66B';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillText('SLOT MACHINE', W / 2, 68);
    ctx.shadowOffsetY = 0;

    // Cabinet
    const cabX = 36;
    const cabY = 110;
    const cabW = W - 72;
    const cabH = 360;
    ctx.fillStyle = '#9a4dba';
    ctx.beginPath();
    ctx.roundRect(cabX, cabY, cabW, cabH, 16);
    ctx.fill();
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.lineWidth = 1;

    // Marquee bulbs
    for (let i = 0; i < 11; i++) {
      const lit = (frame + i * 6) % 24 < 12;
      ctx.fillStyle = lit ? '#FFD66B' : '#5a3577';
      ctx.beginPath();
      ctx.arc(cabX + 22 + i * 28, cabY + 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reel window
    const reelW = 76;
    const reelH = 156;
    const gap = 14;
    const totalW = reelW * 3 + gap * 2;
    const reelStartX = W / 2 - totalW / 2;
    const reelY = cabY + 50;

    ctx.fillStyle = '#100022';
    ctx.fillRect(reelStartX - 8, reelY - 8, totalW + 16, reelH + 16);

    const symbols = ['♠', '♥', '★', '♦', '✦'];
    const symColors = ['#fc5185', '#ef476f', '#FFD66B', '#06d6a0', '#118ab2'];

    for (let i = 0; i < 3; i++) {
      const rx = reelStartX + i * (reelW + gap);
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, reelY, reelW, reelH);
      ctx.clip();

      const scroll = m.scroll[i];
      const itemH = reelH;
      const yOffset = -scroll * itemH * SLOT_SYMBOLS_COUNT;

      for (let s = -1; s < SLOT_SYMBOLS_COUNT + 1; s++) {
        const idx = ((s % SLOT_SYMBOLS_COUNT) + SLOT_SYMBOLS_COUNT) % SLOT_SYMBOLS_COUNT;
        let cellY = reelY + yOffset + s * itemH;
        cellY = ((cellY - reelY) % (itemH * SLOT_SYMBOLS_COUNT) + itemH * SLOT_SYMBOLS_COUNT) % (itemH * SLOT_SYMBOLS_COUNT) + reelY - itemH;

        ctx.fillStyle = idx % 2 === 0 ? '#f6e58d' : '#fff7c2';
        ctx.fillRect(rx, cellY, reelW, itemH);
        ctx.fillStyle = symColors[idx];
        ctx.font = 'bold 64px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbols[idx], rx + reelW / 2, cellY + itemH / 2);
      }
      ctx.restore();

      // Reel frame
      ctx.strokeStyle = '#FFD66B';
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, reelY, reelW, reelH);
      ctx.lineWidth = 1;
    }
    // Center payline
    ctx.strokeStyle = 'rgba(255,80,80,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(reelStartX - 12, reelY + reelH / 2);
    ctx.lineTo(reelStartX + totalW + 12, reelY + reelH / 2);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Lever
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(cabX + cabW - 24, cabY + 70, 8, 110);
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(cabX + cabW - 20, cabY + 70 - 8, 12, 0, Math.PI * 2);
    ctx.fill();

    // Status
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 18px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    if (m.phase === 'prompt') {
      const pulse = 0.6 + 0.4 * Math.sin(frame * 0.18);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#FFD66B';
      ctx.fillText('Press A to spin', W / 2, cabY + cabH - 24);
      ctx.globalAlpha = 1;
    } else if (m.phase === 'spin') {
      ctx.fillText('Spinning…', W / 2, cabY + cabH - 24);
    } else {
      const msg =
        m.winType === 'jackpot'
          ? 'JACKPOT! +1 life'
          : m.winType === 'pair'
            ? 'Pair! Bonus coins'
            : 'No match — small consolation';
      ctx.fillStyle = m.win ? '#7bed9f' : '#dfe6e9';
      ctx.fillText(msg, W / 2, cabY + cabH - 24);
    }
    ctx.textAlign = 'left';
  }

  _renderClaw(game, m) {
    const ctx = this.ctx;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a4a6a');
    bg.addColorStop(1, '#03283a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 26px Georgia';
    ctx.fillStyle = '#FFD66B';
    ctx.textAlign = 'center';
    ctx.fillText('CLAW MACHINE', W / 2, 64);

    const caseX = 28;
    const caseY = 100;
    const caseW = W - 56;
    const caseH = 360;

    // Glass
    ctx.fillStyle = 'rgba(180, 220, 255, 0.16)';
    ctx.fillRect(caseX, caseY, caseW, caseH);
    ctx.strokeStyle = '#39c5f3';
    ctx.lineWidth = 3;
    ctx.strokeRect(caseX, caseY, caseW, caseH);
    ctx.lineWidth = 1;

    // Top mechanism rail
    ctx.fillStyle = '#3b6f8f';
    ctx.fillRect(caseX, caseY, caseW, 18);

    // Prize bin (drop hole)
    ctx.fillStyle = '#0a2438';
    ctx.fillRect(m.prizeLane.l, m.dropY + 10, m.prizeLane.r - m.prizeLane.l, 26);
    ctx.strokeStyle = '#39c5f3';
    ctx.strokeRect(m.prizeLane.l, m.dropY + 10, m.prizeLane.r - m.prizeLane.l, 26);
    ctx.fillStyle = 'rgba(255, 214, 107, 0.28)';
    ctx.fillRect(m.prizeLane.l + 4, m.dropY + 14, m.prizeLane.r - m.prizeLane.l - 8, 18);

    // Plushies on the floor
    const plushPalette = ['#fc5185', '#FFD66B', '#7bed9f', '#a29bfe', '#ff7675'];
    const floorY = caseY + caseH - 36;
    for (let i = 0; i < 8; i++) {
      const px = caseX + 24 + i * ((caseW - 48) / 7);
      if (px > m.prizeLane.l - 10 && px < m.prizeLane.r + 10) continue;
      const c = plushPalette[i % plushPalette.length];
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(px, floorY + 10, 16, Math.PI, 0);
      ctx.lineTo(px + 16, floorY + 28);
      ctx.lineTo(px - 16, floorY + 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px - 5, floorY + 6, 2, 0, Math.PI * 2);
      ctx.arc(px + 5, floorY + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cable + claw
    const clawX = m.x;
    const clawY = m.y;
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(clawX, caseY + 18);
    ctx.lineTo(clawX, clawY);
    ctx.stroke();
    // Claw head
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(clawX - 18, clawY, 36, 8);
    // Pincers
    const open = m.phase !== 'lift' && m.phase !== 'done';
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(clawX - 14, clawY + 8);
    ctx.lineTo(clawX + (open ? -22 : -8), clawY + 22);
    ctx.moveTo(clawX + 14, clawY + 8);
    ctx.lineTo(clawX + (open ? 22 : 8), clawY + 22);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Holding a prize
    if (m.win && (m.phase === 'lift' || m.phase === 'done')) {
      ctx.fillStyle = m.prizeKind === 'heart' ? '#ff4466' : '#FFD66B';
      ctx.beginPath();
      ctx.arc(clawX, clawY + 24, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Georgia';
    ctx.textAlign = 'center';
    if (m.phase === 'aim') {
      ctx.fillStyle = '#FFD66B';
      ctx.fillText('Press A to drop the claw', W / 2, caseY + caseH + 26);
    } else if (m.phase === 'done') {
      ctx.fillStyle = m.win ? '#7bed9f' : '#dfe6e9';
      ctx.fillText(
        m.win
          ? m.prizeKind === 'heart'
            ? 'Plushie Heart! +1 life'
            : 'Bonus prize!'
          : 'Just missed — small payout',
        W / 2,
        caseY + caseH + 26
      );
    }
    ctx.textAlign = 'left';
  }

  _renderHoops(game, m) {
    const ctx = this.ctx;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#dd9c4a');
    bg.addColorStop(0.65, '#c47e2c');
    bg.addColorStop(1, '#7e4615');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 26px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#5b2a05';
    ctx.shadowOffsetY = 2;
    ctx.fillText('HOOPS', W / 2, 60);
    ctx.shadowOffsetY = 0;

    // Court line
    const floorY = HOOPS_GEOM.floorY;
    ctx.fillStyle = '#5b2a05';
    ctx.fillRect(0, floorY, W, H - floorY);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, floorY, W, 3);
    // Free throw arc
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W * 0.5, floorY, 90, Math.PI, 0);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Backboard
    const hx = HOOPS_GEOM.hoopX;
    const hy = HOOPS_GEOM.hoopY;
    ctx.fillStyle = '#fff';
    ctx.fillRect(hx + HOOPS_GEOM.hoopR + 2, hy - 56, 12, 90);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(hx + HOOPS_GEOM.hoopR + 2, hy - 14, 12, 26);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx + HOOPS_GEOM.hoopR + 2, hy - 56, 12, 90);
    ctx.lineWidth = 1;

    // Hoop ring
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hx - HOOPS_GEOM.hoopR, hy);
    ctx.lineTo(hx + HOOPS_GEOM.hoopR, hy);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Net
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const x1 = hx - HOOPS_GEOM.hoopR + t * HOOPS_GEOM.hoopR * 2;
      ctx.moveTo(x1, hy);
      ctx.lineTo(hx + (t - 0.5) * HOOPS_GEOM.hoopR * 1.4, hy + 24);
    }
    ctx.stroke();

    // Trail
    if (m.trail && m.trail.length) {
      for (let i = 0; i < m.trail.length; i++) {
        const t = i / m.trail.length;
        const p = m.trail[i];
        ctx.fillStyle = `rgba(255, 159, 67, ${0.05 + t * 0.45})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + t * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ball
    if (m.ball) {
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(m.ball.x, m.ball.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(m.ball.x, m.ball.y, 11, 0, Math.PI * 2);
      ctx.moveTo(m.ball.x - 11, m.ball.y);
      ctx.lineTo(m.ball.x + 11, m.ball.y);
      ctx.moveTo(m.ball.x, m.ball.y - 11);
      ctx.lineTo(m.ball.x, m.ball.y + 11);
      ctx.stroke();
    } else {
      // Ball at feet
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(70, floorY - 14, 11, 0, Math.PI * 2);
      ctx.fill();
    }

    // Power meter (vertical, more readable)
    const meterX = 36;
    const meterY = 130;
    const meterH = 280;
    const meterW = 26;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(meterX, meterY, meterW, meterH);
    const fillH = meterH * m.meter;
    const grad = ctx.createLinearGradient(0, meterY + meterH, 0, meterY);
    grad.addColorStop(0, '#06d6a0');
    grad.addColorStop(0.6, '#FFD66B');
    grad.addColorStop(1, '#ef476f');
    ctx.fillStyle = grad;
    ctx.fillRect(meterX, meterY + meterH - fillH, meterW, fillH);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(meterX, meterY, meterW, meterH);
    // Sweet-spot marker
    const sweetY = meterY + meterH - meterH * 0.78;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(meterX - 6, sweetY);
    ctx.lineTo(meterX + meterW + 6, sweetY);
    ctx.stroke();

    ctx.font = 'bold 16px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    if (m.phase === 'aim') {
      const pulse = 0.7 + 0.3 * Math.sin(game.frame * 0.2);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#fff';
      ctx.fillText('Press A to shoot', W / 2, H - 80);
      ctx.globalAlpha = 1;
    } else if (m.phase === 'done') {
      ctx.fillStyle = m.win ? '#7bed9f' : '#fff';
      ctx.fillText(m.win ? 'SWISH! Bonus points' : 'Air ball — small payout', W / 2, H - 80);
    }
    ctx.textAlign = 'left';
  }
}
