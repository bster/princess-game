// ============================================================
// OVERWORLD — Node-graph kingdom map (Mario-style)
// Player lives on a node; presses a direction; walks the curved
// path edge to the next node. No free roaming.
// ============================================================

import { getLevelCount } from '../levels/levelData';

export const OW_MAP_W = 1040;
export const OW_MAP_H = 1440;

/** Frames it takes to fully traverse one edge. */
const TRAVERSE_FRAMES = 70;
export const OW_TRAVERSE_DT = 1 / TRAVERSE_FRAMES;

/** Visual sprite scale for player on map. */
export const OW_PLAYER_SCALE = 0.5;

/** Raw node table — order matters only for ID stability. */
const RAW_NODES = [
  { id: 'L0', kind: 'level', levelIndex: 0, x: 180, y: 1260, w: 78, h: 70, label: '1' },
  { id: 'M_slot', kind: 'minigame', miniId: 'slot', x: 540, y: 1140, w: 96, h: 72, label: 'Slots' },
  { id: 'L1', kind: 'level', levelIndex: 1, x: 780, y: 1180, w: 78, h: 70, label: '2' },
  { id: 'L2', kind: 'level', levelIndex: 2, x: 280, y: 1060, w: 78, h: 70, label: '3' },
  { id: 'L3', kind: 'level', levelIndex: 3, x: 880, y: 940, w: 78, h: 70, label: '4' },
  { id: 'L4', kind: 'level', levelIndex: 4, x: 200, y: 820, w: 78, h: 70, label: '5', boss: true },
  { id: 'M_claw', kind: 'minigame', miniId: 'claw', x: 520, y: 780, w: 96, h: 72, label: 'Claw' },
  { id: 'L5', kind: 'level', levelIndex: 5, x: 760, y: 700, w: 78, h: 70, label: '6' },
  { id: 'L6', kind: 'level', levelIndex: 6, x: 320, y: 560, w: 78, h: 70, label: '7' },
  { id: 'M_hoops', kind: 'minigame', miniId: 'hoops', x: 540, y: 520, w: 96, h: 72, label: 'Hoops' },
  { id: 'L7', kind: 'level', levelIndex: 7, x: 840, y: 420, w: 78, h: 70, label: '8', final: true },
];

/**
 * Edges connect adjacent nodes. `curve` controls perpendicular bend:
 * positive = bow toward the right of the direction A→B.
 */
const RAW_EDGES = [
  { a: 'L0', b: 'M_slot', curve: 0.18 },
  { a: 'M_slot', b: 'L1', curve: -0.18 },
  { a: 'L1', b: 'L2', curve: 0.16 },
  { a: 'L2', b: 'L3', curve: -0.16 },
  { a: 'L3', b: 'L4', curve: 0.16 },
  { a: 'L4', b: 'M_claw', curve: -0.18 },
  { a: 'M_claw', b: 'L5', curve: 0.18 },
  { a: 'L5', b: 'L6', curve: -0.16 },
  { a: 'L6', b: 'M_hoops', curve: 0.18 },
  { a: 'M_hoops', b: 'L7', curve: -0.18 },
];

/** @type {Map<string, any>} */
const NODES_MAP = new Map();
/** @type {any[]} */
const EDGES = [];
let _built = false;

function buildGraph() {
  if (_built) return;
  for (const n of RAW_NODES) {
    NODES_MAP.set(n.id, { ...n, neighbors: [] });
  }
  for (const e of RAW_EDGES) {
    const a = NODES_MAP.get(e.a);
    const b = NODES_MAP.get(e.b);
    if (!a || !b) continue;
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    // Perpendicular for curve (rotated 90° from A→B)
    const px = -dy / len;
    const py = dx / len;
    const cx = (ax + bx) / 2 + px * len * e.curve;
    const cy = (ay + by) / 2 + py * len * e.curve;
    const edge = {
      id: `${e.a}|${e.b}`,
      aId: e.a,
      bId: e.b,
      ax,
      ay,
      bx,
      by,
      cx,
      cy,
    };
    EDGES.push(edge);

    // Neighbor entries with start-tangent direction (unit, pointing AWAY from current node)
    const t0x = 2 * (cx - ax);
    const t0y = 2 * (cy - ay);
    const lt0 = Math.hypot(t0x, t0y) || 1;
    const t1x = 2 * (bx - cx);
    const t1y = 2 * (by - cy);
    const lt1 = Math.hypot(t1x, t1y) || 1;
    a.neighbors.push({
      otherId: b.id,
      edge,
      dirX: t0x / lt0,
      dirY: t0y / lt0,
    });
    b.neighbors.push({
      otherId: a.id,
      edge,
      dirX: -t1x / lt1,
      dirY: -t1y / lt1,
    });
  }
  _built = true;
}

export function getOwNode(id) {
  buildGraph();
  return NODES_MAP.get(id);
}

/** All visible nodes (filtered to current campaign size). */
export function getOwNodes() {
  buildGraph();
  const lc = getLevelCount();
  const out = [];
  for (const n of NODES_MAP.values()) {
    if (n.kind === 'level' && n.levelIndex >= lc) continue;
    out.push(n);
  }
  return out;
}

/** All visible edges (skipping any whose endpoint is hidden). */
export function getOwEdges() {
  buildGraph();
  const visible = new Set(getOwNodes().map((n) => n.id));
  return EDGES.filter((e) => visible.has(e.aId) && visible.has(e.bId));
}

/** Is this node walkable given current run state? */
export function isNodeReachable(node, maxReachableLevel) {
  if (!node) return false;
  if (node.kind === 'level') return node.levelIndex <= maxReachableLevel;
  // Mini-game: reachable if any neighboring level is itself reachable
  return node.neighbors.some((nb) => {
    const o = NODES_MAP.get(nb.otherId);
    return o && o.kind === 'level' && o.levelIndex <= maxReachableLevel;
  });
}

export function getStartNodeId() {
  return 'L0';
}

export function getNodeIdForLevel(levelIndex) {
  buildGraph();
  for (const n of NODES_MAP.values()) {
    if (n.kind === 'level' && n.levelIndex === levelIndex) return n.id;
  }
  return getStartNodeId();
}

/** Quadratic bezier point at t∈[0,1] along edge A→B. */
export function bezierPoint(edge, t) {
  const omt = 1 - t;
  return {
    x: omt * omt * edge.ax + 2 * omt * t * edge.cx + t * t * edge.bx,
    y: omt * omt * edge.ay + 2 * omt * t * edge.cy + t * t * edge.by,
  };
}

/** Unit tangent at t along A→B. */
export function bezierTangent(edge, t) {
  const dx = 2 * (1 - t) * (edge.cx - edge.ax) + 2 * t * (edge.bx - edge.cx);
  const dy = 2 * (1 - t) * (edge.cy - edge.ay) + 2 * t * (edge.by - edge.cy);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/**
 * Player visual position from state.
 * State shape: { nodeId, traversal: { edge, fromId, t } | null, facing: -1|1 }
 */
export function getOwPlayerPos(state) {
  buildGraph();
  if (state.traversal) {
    const { edge, fromId, t } = state.traversal;
    const paramT = fromId === edge.aId ? t : 1 - t;
    return bezierPoint(edge, paramT);
  }
  const n = NODES_MAP.get(state.nodeId);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

export function getOwPlayerFacing(state) {
  buildGraph();
  if (state.traversal) {
    const { edge, fromId, t } = state.traversal;
    const paramT = fromId === edge.aId ? t : 1 - t;
    const tan = bezierTangent(edge, paramT);
    const fx = fromId === edge.aId ? tan.x : -tan.x;
    return fx >= 0 ? 1 : -1;
  }
  return state.facing || 1;
}

/** Pick the neighbor whose direction best matches input vector (normalized). */
function pickNeighborByDir(node, ix, iy, maxReachableLevel, excludeEdgeId) {
  let best = null;
  let bestScore = 0.4; // dot threshold so perpendicular presses don't trigger
  for (const nb of node.neighbors) {
    if (excludeEdgeId && nb.edge.id === excludeEdgeId) continue;
    const other = NODES_MAP.get(nb.otherId);
    if (!isNodeReachable(other, maxReachableLevel)) continue;
    const dot = nb.dirX * ix + nb.dirY * iy;
    if (dot > bestScore) {
      bestScore = dot;
      best = nb;
    }
  }
  return best;
}

/** Build initial state at a given node id. */
export function createOwState(startId, facing) {
  return {
    nodeId: startId || getStartNodeId(),
    traversal: null,
    facing: facing || 1,
    lastEdgeId: null,
    /** True while held direction came from a node arrival (consume on release). */
    heldSinceArrival: false,
  };
}

/**
 * Advance the overworld one frame.
 * @returns {{ arrivedAt: string | null }}
 */
export function tickOverworld(state, input, maxReachableLevel) {
  buildGraph();

  // Read directional input as a normalized vector
  let ix = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let iy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const ilen = Math.hypot(ix, iy);
  if (ilen > 0.01) {
    ix /= ilen;
    iy /= ilen;
  } else {
    state.heldSinceArrival = false;
  }

  if (state.traversal) {
    // Allow flip-around if user clearly presses opposite of forward tangent
    if (ilen > 0.01) {
      const { edge, fromId, t } = state.traversal;
      const paramT = fromId === edge.aId ? t : 1 - t;
      const tan = bezierTangent(edge, paramT);
      const fx = fromId === edge.aId ? tan.x : -tan.x;
      const fy = fromId === edge.aId ? tan.y : -tan.y;
      const dot = fx * ix + fy * iy;
      if (dot < -0.55) {
        const newFromId = state.traversal.toId;
        const newToId = state.traversal.fromId;
        state.traversal.fromId = newFromId;
        state.traversal.toId = newToId;
        state.traversal.t = 1 - state.traversal.t;
      }
    }

    state.traversal.t += OW_TRAVERSE_DT;
    if (state.traversal.t >= 1) {
      const arrivedAt = state.traversal.toId;
      state.lastEdgeId = state.traversal.edge.id;
      state.nodeId = arrivedAt;
      // Update facing from final tangent
      state.facing = getOwPlayerFacing(state);
      state.traversal = null;
      // Mark held input as "leftover" — must be released before re-firing
      state.heldSinceArrival = ilen > 0.01;
      return { arrivedAt };
    }
    return { arrivedAt: null };
  }

  // At rest at a node
  if (ilen < 0.01) return { arrivedAt: null };

  const node = NODES_MAP.get(state.nodeId);
  if (!node) return { arrivedAt: null };

  // If the press is leftover from a recent arrival, exclude going back
  // along the just-traversed edge (so chains continue cleanly forward and
  // backtracking requires a fresh press).
  const exclude = state.heldSinceArrival ? state.lastEdgeId : null;
  const nb = pickNeighborByDir(node, ix, iy, maxReachableLevel, exclude);
  if (!nb) return { arrivedAt: null };

  state.traversal = {
    edge: nb.edge,
    fromId: state.nodeId,
    toId: nb.otherId,
    t: 0,
  };
  state.facing = nb.dirX >= 0 ? 1 : -1;
  state.heldSinceArrival = false;
  return { arrivedAt: null };
}

/**
 * What can the player interact with right now? Returns a node or null.
 * Only fires when standing still on a node.
 */
export function getInteractTarget(state, maxReachableLevel, minigamesUsed) {
  if (state.traversal) return null;
  const node = NODES_MAP.get(state.nodeId);
  if (!node) return null;
  if (node.kind === 'level') {
    if (node.levelIndex > maxReachableLevel) return null;
    return node;
  }
  if (node.kind === 'minigame') {
    if (minigamesUsed && minigamesUsed[node.miniId]) return null;
    return node;
  }
  return null;
}
