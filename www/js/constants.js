// ============================================================
// CONSTANTS — Physics, dimensions, colors
// ============================================================

export const W = 393, H = 852;

// Physics — tuned for Mario-like feel
export const GRAVITY_RISE = 0.42;
export const GRAVITY_FALL = 0.78;
export const GRAVITY_CUT = 0.85;
export const JUMP_FORCE = -13.0;
export const MAX_SPEED = 4.5;
export const GROUND_ACCEL = 0.40;
export const GROUND_DECEL = 0.35;
export const TURN_DECEL = 0.70;    // applied when input opposes velocity (skid)
export const AIR_ACCEL = 0.30;
export const AIR_DECEL = 0.03;     // near-zero: preserve momentum in air
export const MAX_FALL = 12;
export const STOMP_BOUNCE = -10;
export const COYOTE_FRAMES = 6;
export const BUFFER_FRAMES = 7;
export const CROUCH_H = 35;
export const STAND_H = 60;
export const APEX_THRESHOLD = 1.8;
export const APEX_GRAVITY_MOD = 0.60;
export const CORNER_NUDGE_PX = 6;
export const KNOCKBACK_VX = 4;
export const KNOCKBACK_VY = -5;

// Colors
export const C = {
  skin: '#FFD5B8', hair: '#FF9F1C', dress: '#FF69B4', dressLight: '#FF85C8',
  crown: '#FFD700', gem: '#ff4466', eyes: '#2c1810', mouth: '#e77', shoe: '#ff69b4',
  blush: 'rgba(255,150,150,0.5)',
  gobHead: '#9B59B6', gobBody: '#7B4BA0', gobHorn: '#7B4BA0', gobFeet: '#6B3A90',
  gobEyePupil: '#c0392b',
  pugBody: '#D4A574', pugFace: '#1a1a1a', pugEar: '#2a1a0a', pugLeg: '#C49564',
  pugTongue: '#ff7b8a',
  grass: '#4a7', dirt: '#8B5E3C',
  platform: '#6B8E23', platformTop: '#8FBC3A',
  tiara: '#FFD700', tiaraBorder: '#DAA520',
  castle: '#8875a8', castleDoor: '#6b5280',
  cage: '#888', cageTop: '#999',
  heart: '#ff4466',
  flagPole: '#888', flagColor: '#ff69b4',
  // Power-up colors
  firePrimary: '#FF4500', fireSecondary: '#FFD700',
  flightPrimary: '#87CEEB', flightSecondary: '#FFFFFF',
  shieldPrimary: '#4169E1', shieldSecondary: '#87CEFA',
  growthPrimary: '#32CD32', growthSecondary: '#ADFF2F',
};

// Power-up durations (frames at 60fps)
export const FIRE_DURATION = 600;    // 10s
export const FLIGHT_DURATION = 240;  // 4s
export const SHIELD_DURATION = 480;  // 8s
export const GROWTH_DURATION = 720;  // 12s
export const FIRE_COOLDOWN = 20;     // frames between shots

// Enemy HP
export const ENEMY_HP = {
  patrol: 1,
  flying: 1,
  shooter: 2,
  boss: 8
};

// Boss phases
export const BOSS_PHASE1_HP = 5; // transitions at 5
export const BOSS_PHASE2_HP = 2; // transitions at 2

// --- Graphics tunables ---

// Parallax
export const PARALLAX_FAR_SPEED = 0.15;   // far layer scroll multiplier
export const PARALLAX_MID_SPEED = 0.40;   // mid layer scroll multiplier

// Contact shadows
export const SHADOW_MAX_OPACITY = 0.25;   // darkest shadow alpha
export const SHADOW_FADE_HEIGHT = 200;    // px above ground where shadow vanishes
export const SHADOW_BASE_RADIUS = 18;     // shadow ellipse X radius at ground
export const SHADOW_SQUASH = 0.35;        // Y/X ratio (flatter = more squashed)

// Platform materials
export const PLATFORM_HIGHLIGHT = 'rgba(255,255,255,0.25)';
export const PLATFORM_SHADOW = 'rgba(0,0,0,0.20)';
export const PLATFORM_GRAD_TOP = '#8FBC3A';
export const PLATFORM_GRAD_BOT = '#5A7A1A';
export const BRICK_VARIATION = 0.06;      // max color jitter per brick tile

// Juice VFX
export const DUST_LANDING_COUNT = 6;
export const DUST_LANDING_LIFE = 18;
export const DUST_LANDING_SPREAD = 24;
export const DUST_SKID_COUNT = 3;
export const DUST_SKID_LIFE = 14;
export const DUST_SKID_SPREAD = 10;
