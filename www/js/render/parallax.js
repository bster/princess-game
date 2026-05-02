// ============================================================
// PARALLAX — Multi-layer scrolling backgrounds
// ============================================================
//
// Each level provides a `parallaxLayers` array. Each layer:
//   { speed, opacity, draw(ctx, offsetX, vpW, vpH, frame) }
//
// Generic shapes are drawn procedurally — no image assets.

import { PARALLAX_FAR_SPEED, PARALLAX_MID_SPEED } from '../constants.js';

// ---- Deterministic pseudo-random from seed (for repeatable hills) ----
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
}

// ---- Procedural mountain range ----
function drawMountainRange(ctx, offsetX, vpW, vpH, baseY, peakH, color, seed, count) {
  const rand = seededRand(seed);
  const segW = (vpW + 400) / count;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-200 - (offsetX % segW), vpH);

  for (let i = -1; i <= count + 1; i++) {
    const x = i * segW - (offsetX % segW);
    const h = peakH * (0.4 + rand() * 0.6);
    const cpOffset = segW * (0.2 + rand() * 0.3);
    ctx.lineTo(x - cpOffset, baseY - h * 0.3);
    ctx.lineTo(x, baseY - h);
    ctx.lineTo(x + cpOffset, baseY - h * 0.4);
  }

  ctx.lineTo(vpW + 200, vpH);
  ctx.closePath();
  ctx.fill();
}

// ---- Procedural rolling hills ----
function drawHills(ctx, offsetX, vpW, vpH, baseY, hillH, color, seed, count) {
  const rand = seededRand(seed);
  const segW = (vpW + 300) / count;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-200 - (offsetX % segW), vpH);

  let px = -200 - (offsetX % segW);
  ctx.lineTo(px, baseY);

  for (let i = -1; i <= count + 2; i++) {
    const x = i * segW - (offsetX % segW);
    const h = hillH * (0.3 + rand() * 0.7);
    const cpx = segW * 0.5;
    ctx.quadraticCurveTo(x - cpx, baseY - h, x, baseY - h * 0.4);
    ctx.quadraticCurveTo(x + cpx * 0.5, baseY, x + segW * 0.5, baseY);
  }

  ctx.lineTo(vpW + 200, vpH);
  ctx.closePath();
  ctx.fill();
}

// ---- Procedural trees silhouette (mid layer) ----
function drawTreeLine(ctx, offsetX, vpW, vpH, baseY, maxH, color, seed, count) {
  const rand = seededRand(seed);
  const segW = (vpW + 300) / count;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-100 - (offsetX % segW), vpH);
  ctx.lineTo(-100 - (offsetX % segW), baseY);

  for (let i = -1; i <= count + 2; i++) {
    const x = i * segW - (offsetX % segW);
    const h = maxH * (0.4 + rand() * 0.6);
    const w = segW * (0.3 + rand() * 0.4);
    // Tree-like bumpy canopy
    ctx.lineTo(x - w * 0.5, baseY);
    ctx.lineTo(x - w * 0.3, baseY - h * 0.6);
    ctx.lineTo(x - w * 0.1, baseY - h * 0.4);
    ctx.lineTo(x, baseY - h);
    ctx.lineTo(x + w * 0.1, baseY - h * 0.5);
    ctx.lineTo(x + w * 0.3, baseY - h * 0.7);
    ctx.lineTo(x + w * 0.5, baseY);
  }

  ctx.lineTo(vpW + 200, vpH);
  ctx.closePath();
  ctx.fill();
}

// ---- Pre-built layer configs per level theme ----

function meadowLayers(groundY) {
  return [
    {
      speed: PARALLAX_FAR_SPEED,
      opacity: 0.25,
      draw(ctx, ox, vpW, vpH) {
        drawMountainRange(ctx, ox, vpW, vpH, groundY - 60, 180, '#5b8a6f', 42, 6);
        drawMountainRange(ctx, ox * 1.3, vpW, vpH, groundY - 30, 120, '#4a7860', 77, 7);
      }
    },
    {
      speed: PARALLAX_MID_SPEED,
      opacity: 0.20,
      draw(ctx, ox, vpW, vpH) {
        drawHills(ctx, ox, vpW, vpH, groundY, 50, '#3a6a4a', 101, 8);
      }
    }
  ];
}

function sunsetLayers(groundY) {
  return [
    {
      speed: PARALLAX_FAR_SPEED,
      opacity: 0.30,
      draw(ctx, ox, vpW, vpH) {
        drawMountainRange(ctx, ox, vpW, vpH, groundY - 50, 160, '#8b4a3a', 55, 6);
        drawMountainRange(ctx, ox * 1.2, vpW, vpH, groundY - 20, 100, '#7a3a30', 88, 7);
      }
    },
    {
      speed: PARALLAX_MID_SPEED,
      opacity: 0.22,
      draw(ctx, ox, vpW, vpH) {
        drawHills(ctx, ox, vpW, vpH, groundY, 45, '#6a3828', 120, 8);
      }
    }
  ];
}

function cavernLayers(groundY) {
  return [
    {
      speed: PARALLAX_FAR_SPEED,
      opacity: 0.15,
      draw(ctx, ox, vpW, vpH) {
        // Stalactite/stalagmite shapes
        drawMountainRange(ctx, ox, vpW, vpH, groundY - 40, 100, '#1a1a30', 33, 8);
      }
    },
    {
      speed: PARALLAX_MID_SPEED,
      opacity: 0.12,
      draw(ctx, ox, vpW, vpH) {
        drawHills(ctx, ox, vpW, vpH, groundY, 35, '#151528', 66, 10);
      }
    }
  ];
}

function skyLayers(groundY) {
  return [
    {
      speed: PARALLAX_FAR_SPEED,
      opacity: 0.18,
      draw(ctx, ox, vpW, vpH) {
        drawMountainRange(ctx, ox, vpW, vpH, vpH - 80, 200, '#9a8ab0', 44, 5);
        drawMountainRange(ctx, ox * 1.2, vpW, vpH, vpH - 50, 140, '#8878a0', 99, 6);
      }
    },
    {
      speed: PARALLAX_MID_SPEED,
      opacity: 0.14,
      draw(ctx, ox, vpW, vpH) {
        // Distant floating islands
        drawHills(ctx, ox, vpW, vpH, vpH - 30, 60, '#776890', 77, 7);
      }
    }
  ];
}

function darkLayers(groundY) {
  return [
    {
      speed: PARALLAX_FAR_SPEED,
      opacity: 0.20,
      draw(ctx, ox, vpW, vpH) {
        drawMountainRange(ctx, ox, vpW, vpH, groundY - 50, 160, '#1a0a30', 60, 6);
        drawMountainRange(ctx, ox * 1.3, vpW, vpH, groundY - 20, 100, '#150828', 85, 7);
      }
    },
    {
      speed: PARALLAX_MID_SPEED,
      opacity: 0.16,
      draw(ctx, ox, vpW, vpH) {
        drawTreeLine(ctx, ox, vpW, vpH, groundY, 70, '#120620', 110, 10);
      }
    }
  ];
}

const LAYER_BUILDERS = [meadowLayers, sunsetLayers, cavernLayers, skyLayers, darkLayers];

// ---- Public API ----

export function getParallaxLayers(levelIndex, groundY) {
  const builder = LAYER_BUILDERS[levelIndex] || meadowLayers;
  return builder(groundY);
}

export function drawParallax(ctx, layers, camX, camY, vpW, vpH) {
  for (const layer of layers) {
    const offsetX = camX * layer.speed;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    layer.draw(ctx, offsetX, vpW, vpH);
    ctx.restore();
  }
}
