// ============================================================
// COLLIDER — Collision resolution, separate from movement
// ============================================================

import { CORNER_NUDGE_PX, CROUCH_H } from './constants.js';
import { isOverGap } from './utils.js';

export function resolvePlayerLevel(player, levelData) {
  if (player.dead) return;

  // Ground collision
  if (levelData.hasGround && player.y + player.h >= levelData.groundY) {
    if (!isOverGap(player.x - player.w / 2, player.w, levelData.gaps)) {
      player.y = levelData.groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // Platform collision (one-way) with corner correction
  for (const p of levelData.platforms) {
    const px = player.x - player.w / 2;
    const py = player.y + player.h;
    const prevPy = py - player.vy;

    if (player.vy >= 0 && prevPy <= p.y + 2 &&
        px + player.w > p.x && px < p.x + p.w &&
        py >= p.y && py <= p.y + 20) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (!player._wasOnGround && player.vy > 0 && prevPy <= p.y + 2 &&
               py >= p.y && py <= p.y + 20) {
      // Corner correction: only when airborne and falling onto a platform
      const leftMiss = p.x - (px + player.w);
      const rightMiss = px - (p.x + p.w);
      if (leftMiss > 0 && leftMiss < CORNER_NUDGE_PX) {
        player.x += leftMiss + 1;
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (rightMiss > 0 && rightMiss < CORNER_NUDGE_PX) {
        player.x -= rightMiss + 1;
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }

  // Barrier collision — solid wall for standing players, passable when crouching
  if (levelData.barriers) {
    resolvePlayerBarriers(player, levelData.barriers, levelData.groundY);
  }
}

/**
 * Resolve player vs barriers. A barrier blocks the upper portion
 * (from gapH to totalH above ground). Crouching players fit under the gap.
 * Standing players are pushed back horizontally.
 */
export function resolvePlayerBarriers(player, barriers, groundY) {
  const pw = player.w;
  const pLeft = player.x - pw / 2;
  const pRight = player.x + pw / 2;
  const pTop = player.y;
  const pBot = player.y + player.h;

  for (const b of barriers) {
    const bx = b.x;
    const bw = b.w || 40;
    const gapH = b.gapH || CROUCH_H;
    const totalH = b.totalH || 70;

    const blockTop = groundY - totalH;
    const blockBot = groundY - gapH;

    // Check horizontal overlap
    if (pRight <= bx || pLeft >= bx + bw) continue;

    // Check vertical overlap with the solid block portion
    if (pTop >= blockBot || pBot <= blockTop) continue;

    // Player overlaps the solid block — are they crouching and small enough to fit?
    if (player.crouching && player.h <= gapH) {
      // Player fits under the gap — no collision
      continue;
    }

    // Standing (or jumping through the block zone) — push player out horizontally
    const overlapLeft = pRight - bx;
    const overlapRight = (bx + bw) - pLeft;

    if (overlapLeft < overlapRight) {
      // Push left
      player.x -= overlapLeft;
      if (player.vx > 0) player.vx = 0;
    } else {
      // Push right
      player.x += overlapRight;
      if (player.vx < 0) player.vx = 0;
    }
  }
}
