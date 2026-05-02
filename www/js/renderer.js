// ============================================================
// RENDERER — Sky, ground, HUD, menus, controls overlay
// ============================================================

import { W, H, C } from './constants.js';
import { easeOutBack, easeOutElastic } from './utils.js';
import { drawParallax, getParallaxLayers } from './render/parallax.js';
import { drawContactShadow } from './render/shadows.js';
import { drawPlatformWithBevel, drawGroundWithDepth } from './render/materials.js';
import { drawPrincess } from './sprites/princess.js';
import { drawGoblin } from './sprites/goblin.js';
import { drawSlime } from './sprites/slime.js';
import { drawFlyingEnemy } from './sprites/flyingEnemy.js';
import { drawShooterEnemy } from './sprites/shooterEnemy.js';
import { drawBoss } from './sprites/boss.js';
import { drawFrank, drawFrankPlayer } from './sprites/frank.js';
import { drawCloud, drawBush, drawTree, drawCastleBg, drawCrystal, drawTorch, drawRuins, drawFlag, drawCage, drawBarrier } from './sprites/environment.js';
import { drawStar, drawHeart, drawFireball, drawEnemyShot, drawShieldBubble, drawWings } from './sprites/effects.js';
import { drawTiara } from './sprites/tiara.js';
import { drawPowerUpOrb, drawAbilityHUD } from './sprites/powerupIcons.js';

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
    const bw = 64, bh = 32;
    const bc = document.createElement('canvas');
    bc.width = bw; bc.height = bh;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = '#8B7355';
    bctx.fillRect(0, 0, bw, bh);
    const colors = ['#DAA520', '#D4992A', '#E0AD2C', '#CFA030'];
    bctx.fillStyle = colors[0]; bctx.fillRect(1, 1, 30, 14);
    bctx.fillStyle = colors[1]; bctx.fillRect(33, 1, 30, 14);
    bctx.fillStyle = colors[2]; bctx.fillRect(1, 17, 14, 14);
    bctx.fillStyle = colors[3]; bctx.fillRect(17, 17, 30, 14);
    bctx.fillStyle = colors[0]; bctx.fillRect(49, 17, 14, 14);
    bctx.fillStyle = 'rgba(255,235,180,0.35)';
    [1,33].forEach(x => bctx.fillRect(x, 1, 30, 2));
    [1,49].forEach(x => bctx.fillRect(x, 17, 14, 2));
    bctx.fillRect(17, 17, 30, 2);
    bctx.fillStyle = 'rgba(100,70,20,0.3)';
    [1,33].forEach(x => bctx.fillRect(x, 13, 30, 2));
    [1,49].forEach(x => bctx.fillRect(x, 29, 14, 2));
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
      const sx = ld.sun[0], sy = ld.sun[1], sr = ld.sun[2];
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
      const starSeed = [30,90,120,200,280,60,170,320,350,40,150,250,310,100,210,340,80,260,180,50];
      for (let i = 0; i < 20; i++) {
        const sx = (starSeed[i] * 3 + i * 200) % W;
        const sy = 50 + (starSeed[(i + 5) % 20] * 2) % 200;
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
        const sx = i * 30 + 10 - (camX * 0.8) % 30;
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
          t.x + (Math.random() - 0.5) * 20, t.y - 5 + (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 0.5, -Math.random() * 0.8,
          '#FFD700', 15, 2, 'star'
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
        else if (en.subtype === 'shooter') drawShooterEnemy(ctx, ex, en.y, en.frame, en.facing, false);
        else if (en.subtype === 'boss') drawBoss(ctx, ex, en.y, en.frame, en.phase, en.hp, en.maxHp, en.dazed, en.facing);
        else drawGoblin(ctx, ex, en.y, en.frame, false);

        // White flash overlay on damage
        if (en.flashTimer > 0 && en.flashTimer % 2 === 0) {
          this._flashOverlay(ctx, ex - en.w / 2, en.y, en.w, en.h);
        }
      } else if (en.squishTimer > 0) {
        if (en.subtype === 'slime') drawSlime(ctx, ex, en.y + 12, en.frame, true);
        else if (en.subtype === 'boss') drawBoss(ctx, ex, en.y, en.frame, en.phase, 0, en.maxHp, true, en.facing);
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
          drawFrankPlayer(ctx, px, player.y + player.h, player.facing, player.frame,
                          !player.onGround, player.crouching,
                          player.scaleX * growthScale, player.scaleY * growthScale);
        } else {
          drawPrincess(ctx, px, player.y + player.h, player.facing, player.frame,
                       !player.onGround, player.crouching,
                       player.scaleX * growthScale, player.scaleY * growthScale);
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
    ctx.fillStyle = game.levelTiarasCollected >= game.levelTotalTiaras ? 'rgba(90,200,90,0.6)' : 'rgba(255,215,0,0.4)';
    ctx.fillText(game.levelTiarasCollected + '/' + game.levelTotalTiaras, W / 2 + 25, hudY + 20);
    ctx.textAlign = 'left';

    // Ability HUD icons
    const abilities = game.player.abilities;
    for (let i = 0; i < abilities.length; i++) {
      drawAbilityHUD(ctx, 30 + i * 36, hudY + 45, abilities[i].type, abilities[i].remaining, abilities[i].total, game.frame);
    }

    // Boss HP bar
    const boss = game.enemies.find(e => e.type === 'boss' && e.alive);
    if (boss) {
      this._renderBossHP(boss);
    }
  }

  _renderBossHP(boss) {
    const ctx = this.ctx;
    const barW = 200, barH = 12;
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

  renderControls() {
    const ctx = this.ctx;
    ctx.globalAlpha = 0.3;

    // D-pad
    const dpadX = 80, dpadY = H - 80;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(dpadX - 50, dpadY - 17, 100, 34, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(dpadX - 17, dpadY - 50, 34, 100, 8);
    ctx.fill();

    // D-pad arrows (left, right, down)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(dpadX - 35, dpadY);
    ctx.lineTo(dpadX - 25, dpadY - 7);
    ctx.lineTo(dpadX - 25, dpadY + 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dpadX + 35, dpadY);
    ctx.lineTo(dpadX + 25, dpadY - 7);
    ctx.lineTo(dpadX + 25, dpadY + 7);
    ctx.fill();
    // Down arrow
    ctx.beginPath();
    ctx.moveTo(dpadX, dpadY + 35);
    ctx.lineTo(dpadX - 7, dpadY + 25);
    ctx.lineTo(dpadX + 7, dpadY + 25);
    ctx.fill();

    // A button (jump) — bottom-right
    const aBtnX = W - 60, aBtnY = H - 80;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(aBtnX, aBtnY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', aBtnX, aBtnY);

    // B button (fire) — upper-right
    const bBtnX = W - 60, bBtnY = H - 160;
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(bBtnX, bBtnY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('B', bBtnX, bBtnY);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  renderTitle(game) {
    const frame = game.frame;
    const ctx = this.ctx;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a5276');
    grad.addColorStop(0.3, '#2e86c1');
    grad.addColorStop(0.6, '#85c1e9');
    grad.addColorStop(1, '#d6eaf8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const tsg = ctx.createRadialGradient(310, 100, 10, 310, 100, 100);
    tsg.addColorStop(0, 'rgba(255,250,220,0.4)');
    tsg.addColorStop(0.5, 'rgba(255,240,200,0.1)');
    tsg.addColorStop(1, 'rgba(255,230,180,0)');
    ctx.fillStyle = tsg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,250,230,0.9)';
    ctx.beginPath();
    ctx.arc(310, 100, 25, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    drawCloud(ctx, 60, 120, 80);
    drawCloud(ctx, 250, 90, 60);
    drawCloud(ctx, 340, 160, 70);

    // Ground
    ctx.fillStyle = '#E8C252';
    ctx.fillRect(0, H - 150, W, 4);
    ctx.fillStyle = this.brickPattern;
    ctx.fillRect(0, H - 146, W, 146);

    // Princess
    drawPrincess(ctx, W * 0.35, H - 150, 1, frame, false);

    // Caged Frank
    drawCage(ctx, W * 0.55, H - 230, false);
    drawFrank(ctx, W * 0.55 + 35, H - 175, frame, false);

    // Goblins
    drawGoblin(ctx, W * 0.15, H - 188, frame, false);
    drawGoblin(ctx, W * 0.85, H - 188, frame, false);

    // Title
    const pulse = 1 + Math.sin(frame * 0.03) * 0.05;
    ctx.save();
    ctx.translate(W / 2, 200);
    ctx.scale(pulse, pulse);
    ctx.font = 'bold 42px Georgia';
    ctx.fillStyle = C.crown;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('Princess', 0, 0);
    ctx.fillText('& Frank', 0, 48);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    // Subtitle
    ctx.font = '18px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Save Frank the Pug!', W / 2, 280);

    // Tap to start
    if (Math.sin(frame * 0.08) > 0) {
      ctx.font = 'bold 22px Georgia';
      ctx.fillStyle = '#fff';
      ctx.fillText('Tap to Start', W / 2, H / 2 + 60);
    }

    // Medal progress (only if player has earned at least 1)
    const earned = game.medalManager.getTotalEarned();
    if (earned > 0) {
      const total = game.medalManager.getTotalPossible();
      const medalY = H / 2 + 100;
      drawStar(ctx, W / 2 - 40, medalY, 10, '#FFD700');
      ctx.font = '16px Georgia';
      ctx.fillStyle = earned >= total ? '#FFD700' : 'rgba(255,215,0,0.8)';
      ctx.fillText(earned + ' / ' + total, W / 2 + 5, medalY + 5);
    }

    ctx.textAlign = 'left';
  }

  renderCharacterSelect(game) {
    const ctx = this.ctx;
    const frame = game.frame;
    const cursor = game.selectCursor;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a5276');
    grad.addColorStop(0.3, '#2e86c1');
    grad.addColorStop(0.6, '#85c1e9');
    grad.addColorStop(1, '#d6eaf8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const tsg = ctx.createRadialGradient(310, 100, 10, 310, 100, 100);
    tsg.addColorStop(0, 'rgba(255,250,220,0.4)');
    tsg.addColorStop(0.5, 'rgba(255,240,200,0.1)');
    tsg.addColorStop(1, 'rgba(255,230,180,0)');
    ctx.fillStyle = tsg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,250,230,0.9)';
    ctx.beginPath();
    ctx.arc(310, 100, 25, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    drawCloud(ctx, 60, 120, 80);
    drawCloud(ctx, 250, 90, 60);
    drawCloud(ctx, 340, 160, 70);

    // Ground
    ctx.fillStyle = '#E8C252';
    ctx.fillRect(0, H - 150, W, 4);
    ctx.fillStyle = this.brickPattern;
    ctx.fillRect(0, H - 146, W, 146);

    // Title
    ctx.font = 'bold 32px Georgia';
    ctx.fillStyle = C.crown;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('Choose Your Hero', W / 2, 160);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Two character panels
    const panelW = 140, panelH = 200;
    const panelY = 220;
    const leftX = W / 2 - panelW - 15;
    const rightX = W / 2 + 15;

    // Selection highlight
    for (let i = 0; i < 2; i++) {
      const px = i === 0 ? leftX : rightX;
      const selected = cursor === i;
      const pulse = selected ? 1 + Math.sin(frame * 0.08) * 0.03 : 1;

      ctx.save();
      ctx.translate(px + panelW / 2, panelY + panelH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-(px + panelW / 2), -(panelY + panelH / 2));

      // Panel bg
      if (selected) {
        ctx.fillStyle = 'rgba(255,215,0,0.25)';
        ctx.strokeStyle = C.crown;
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
      }
      ctx.beginPath();
      ctx.roundRect(px, panelY, panelW, panelH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Draw Princess (left panel)
    drawPrincess(ctx, leftX + panelW / 2, panelY + panelH - 40, 1, frame, false);
    ctx.font = 'bold 16px Georgia';
    ctx.fillStyle = cursor === 0 ? '#fff' : 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('Princess', leftX + panelW / 2, panelY + panelH - 10);

    // Draw Frank (right panel)
    drawFrank(ctx, rightX + panelW / 2 - 10, panelY + panelH - 55, frame, true);
    ctx.font = 'bold 16px Georgia';
    ctx.fillStyle = cursor === 1 ? '#fff' : 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('Frank', rightX + panelW / 2, panelY + panelH - 10);

    // Mission text
    ctx.font = '16px Georgia';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    if (cursor === 0) {
      ctx.fillText('Rescue Frank the Pug!', W / 2, panelY + panelH + 40);
    } else {
      ctx.fillText('Rescue the Princess!', W / 2, panelY + panelH + 40);
    }

    // Navigation hint
    ctx.font = '14px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('\u25C0  \u25B6  to choose', W / 2, panelY + panelH + 70);

    // Confirm hint
    if (Math.sin(frame * 0.08) > 0) {
      ctx.font = 'bold 20px Georgia';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press A to Start', W / 2, panelY + panelH + 110);
    }

    // Goblins
    drawGoblin(ctx, W * 0.1, H - 188, frame, false);
    drawGoblin(ctx, W * 0.9, H - 188, frame, false);

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
          ctx.fillText(r.value === 0 ? 'Perfect!' : r.value + ' hit' + (r.value !== 1 ? 's' : ''), 130, 6);
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
      ctx.fillText('Tap to Continue', W / 2, H * 0.72);
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
        ctx.font = '20px Georgia';
        ctx.fillStyle = '#fff';
        ctx.fillText('Tap to Retry', W / 2, H * 0.55);
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
          ctx.fillText(r.value === 0 ? 'Perfect!' : r.value + ' hit' + (r.value !== 1 ? 's' : ''), W / 2 + 130, rowY + 5);
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
}
