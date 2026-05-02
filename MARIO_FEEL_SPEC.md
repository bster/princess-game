# Mario-Like Feel Spec — Princess & Frank

---

## 1. What "Mario-Like Feel" Means (Concrete, Implementable)

### Movement

**Ground acceleration is fast but not instant.** Mario reaches top speed in ~12 frames (200ms). The player should feel "planted" — heavy enough to feel grounded, light enough to feel nimble. Our current GROUND_ACCEL (0.55) reaches MAX_SPEED (4.5) in ~8 frames, which is close but slightly too snappy. Increase to ~12 frames for more weight.

**Deceleration is asymmetric: skid vs stop.** When the player releases the stick, friction stops them in ~8 frames. When the player *reverses direction*, friction should be **2x stronger** (turnaround skid). Mario's signature skid exists because reverse-decel is higher than neutral-decel. Our code currently treats both identically.

**Air control is real but reduced.** Mario gives ~60% of ground acceleration in the air. Our AIR_ACCEL (0.35) vs GROUND_ACCEL (0.55) = 64%, which is correct. But AIR_DECEL should be **near zero** (0.02–0.05) — once you commit to a direction in the air, you drift. Our current 0.15 is too sticky.

**Max speed in air equals ground.** No separate air speed cap. Horizontal velocity carries through the jump arc.

### Jump

**Variable jump height is the core of Mario feel.** The difference between a tap and a hold must produce visibly different arc heights — at least 2:1 ratio between full jump and short hop.

The mechanism: two gravity values.
- **GRAVITY_RISE** (holding jump, going up): low gravity, slow rise
- **GRAVITY_CUT** (released jump, still going up): high gravity, fast cut — this is what makes short hops short
- **GRAVITY_FALL** (going down): medium-high gravity, slightly faster than rise

Our current values:
- GRAVITY_RISE = 0.38, GRAVITY_CUT = 0.85, GRAVITY_FALL = 0.62

Problem: GRAVITY_FALL (0.62) is lower than GRAVITY_CUT (0.85). This means releasing the button while rising cuts the jump sharply, but then *falling is slower than the cut*. Mario does the opposite: falling is fast and decisive. The descent should feel **heavier than the ascent**.

Recommended fix: GRAVITY_FALL >= GRAVITY_CUT, or at minimum GRAVITY_FALL = 0.75.

**Apex hang time.** We added this (0.45 modifier when |vy| < 2.5). This is correct in spirit — Mario World has subtle apex hang. But the threshold is too wide and the modifier too strong. Tighten to |vy| < 1.8, modifier = 0.6. The hang should be *felt, not seen*.

**Terminal velocity must be capped firmly.** MAX_FALL = 14 is fine. The player should never feel like they're in freefall — capped descent speed creates predictable landing timing.

### Forgiveness

**Coyote time: 5–7 frames (83–117ms).** We have 6. This is correct. The player gets a few frames after walking off a ledge where they can still jump. Essential for platform games — without it, edges feel "broken."

**Jump buffering: 6–8 frames (100–133ms).** We have 6. This is correct. If the player hits jump slightly before landing, the jump executes on landing. Without this, early jumps feel "eaten."

**Corner correction: 4–6px, airborne only.** We added this (8px). Reduce to 6px. Only active when falling, never when grounded (already fixed). This prevents the frustration of missing a platform by 2 pixels.

**Ledge forgiveness (not yet implemented).** When the player's center passes a platform edge but their trailing pixels still overlap, they should stay grounded for 2–3 extra frames. This is different from coyote time — it's a spatial grace period, not temporal.

### Collision

**One-way platforms must have a velocity gate.** Only land on platforms when vy >= 0 (falling or stationary). We do this correctly.

**No sticky edges.** Never resolve horizontal collision against one-way platforms. Our platforms are drop-through, so this isn't an issue. If we add solid walls, resolve X and Y axes independently: move X first, resolve X collisions, then move Y, resolve Y collisions. Never resolve both simultaneously.

**Head bonking.** When the player hits their head on a platform from below, vy should be set to 0 (or a small positive value like +1). Not currently implemented — should be added for solid-ceiling tiles.

### Enemy Interactions

**Stomp window.** The check is: player.vy > 0 AND player's bottom is above enemy's vertical midpoint. Our threshold (+5px grace) is reasonable. The stomp should feel generous — err on the side of the player.

**Knockback must be short and predictable.** Current: vx = 5, vy = -4, invincible = 60 frames (1s). The knockback distance should be ~40-60px (about 1-2 tiles). The invincibility window (60 frames) is correct for Mario-like feel — long enough to reposition, short enough to still feel dangerous.

**Invincibility blink rate: 6 frames.** We blink every 6 frames (visible for 3, invisible for 3). This is standard Mario. Correct.

---

## 2. Parameter Tuning Sheet

All values are per-frame at 60fps unless noted.

| Parameter | Current | Recommended | Range | What It Feels Like |
|---|---|---|---|---|
| **GROUND_ACCEL** | 0.55 | 0.40 | 0.30–0.55 | Lower = heavier/weightier. 0.40 reaches max speed in ~11 frames (183ms). |
| **GROUND_DECEL** | 0.45 | 0.35 | 0.25–0.50 | Lower = more slide on release. 0.35 = stops in ~13 frames (217ms). |
| **TURN_DECEL** *(new)* | — | 0.70 | 0.50–0.90 | Applied instead of GROUND_DECEL when input opposes velocity. Creates the Mario skid. |
| **AIR_ACCEL** | 0.35 | 0.30 | 0.20–0.40 | How much you can steer mid-air. 0.30 = meaningful but committed. |
| **AIR_DECEL** | 0.15 | 0.03 | 0.02–0.08 | Near-zero = momentum-preserving air. 0.03 = almost no air friction. |
| **MAX_SPEED** | 4.5 | 4.5 | 3.5–5.5 | Tiles per second = MAX_SPEED * 60 / tileWidth. 4.5 at 32px tiles = 8.4 tiles/s. |
| **JUMP_FORCE** | -12.5 | -13.0 | -11.0 to -14.5 | Higher magnitude = higher jump. -13.0 peaks at ~137px (4.3 tiles at 32px). |
| **GRAVITY_RISE** | 0.38 | 0.42 | 0.32–0.50 | Gravity while holding jump + rising. Lower = floatier rise. |
| **GRAVITY_FALL** | 0.62 | 0.78 | 0.65–0.90 | Gravity while falling. Higher = snappier descent. **Must be > GRAVITY_RISE.** |
| **GRAVITY_CUT** | 0.85 | 0.85 | 0.70–1.00 | Gravity when jump is released while still rising. Creates short-hop. |
| **APEX_THRESHOLD** *(new)* | 2.5 | 1.8 | 1.2–2.5 | vy range where apex hang activates. Wider = more floaty. |
| **APEX_GRAVITY_MOD** *(new)* | 0.45 | 0.60 | 0.40–0.75 | Gravity multiplier during apex. Lower = more hang time. |
| **MAX_FALL** | 14 | 12 | 10–16 | Terminal velocity. 12 keeps falling predictable. |
| **STOMP_BOUNCE** | -10 | -10 | -8 to -12 | Upward velocity after stomping. -10 gives enough height to chain stomps. |
| **COYOTE_FRAMES** | 6 | 6 | 4–8 | 6 frames = 100ms. Sweet spot for platformers. |
| **BUFFER_FRAMES** | 6 | 7 | 5–10 | 7 frames = 117ms. Slightly more generous than coyote for button timing. |
| **CORNER_NUDGE_PX** | 8 | 6 | 4–8 | Pixels of horizontal correction for near-miss platform landings. |
| **INVINCIBLE_FRAMES** | 60 | 60 | 45–90 | 60 = 1 second. Standard Mario post-hit invincibility. |
| **KNOCKBACK_VX** | 5 | 4 | 3–6 | Horizontal knockback speed. 4 = ~50px displacement (controllable). |
| **KNOCKBACK_VY** | -4 | -5 | -3 to -6 | Vertical knockback. -5 = visually clear "hit pop." |
| **FREEZE_STOMP** | 4 | 4 | 3–6 | Hit-freeze frames on stomp kill. 4 = 67ms. |
| **FREEZE_HIT** | 3 | 3 | 2–5 | Hit-freeze on player damage. Shorter than stomp — damage should feel fast. |
| **FREEZE_BOSS** | 6 | 6 | 4–8 | Longer freeze for boss hits. Rewards the player. |

### Derived Timings

| Metric | Value | How to Calculate |
|---|---|---|
| Full jump height | ~137px | JUMP_FORCE^2 / (2 * GRAVITY_RISE) |
| Short hop height | ~48px | ≈ 35% of full jump (depends on release timing) |
| Jump duration (full) | ~42 frames (700ms) | Rise + fall at respective gravities |
| Short hop duration | ~22 frames (367ms) | Cut gravity kicks in fast |
| Time to max speed (ground) | 11 frames (183ms) | MAX_SPEED / GROUND_ACCEL |
| Stop distance (ground) | ~29px | MAX_SPEED^2 / (2 * GROUND_DECEL) |
| Skid distance (turnaround) | ~14px | MAX_SPEED^2 / (2 * TURN_DECEL) |
| Coyote window | 100ms | 6 frames |
| Jump buffer window | 117ms | 7 frames |
| Invincibility duration | 1000ms | 60 frames |

---

## 3. Feel Testing Protocol

Build a single test room (one flat level with specific geometry). Run each test, observe, and adjust.

### Test Room Layout
```
                  [P3: 32px wide]
                         ___
          [P2: 64px]    |   |
             ___        |   |
[P1: 96px]  |   |       |   |
  ___       |   |  gap2  |   |  [wall]
 |   |      |   |  64px  |   |  |||||
 |   | gap1 |   |        |   |  |||||
_|___|_32px_|___|________|___|__|||||___
         GROUND
```

### Micro-Tests

| # | Test | What to Do | What to Observe | If Wrong, Adjust |
|---|---|---|---|---|
| 1 | **Short hop vs full hop** | Tap jump, then hold jump | Short hop should be ~1/3 full height. Must be visually distinct. | If hops are same height: increase GRAVITY_CUT. If short hop too stubby: decrease GRAVITY_CUT. |
| 2 | **1-tile gap (32px)** | Walk off edge, don't jump | Player should clear the gap with coyote time alone (barely). | If they fall in: increase COYOTE_FRAMES. If too easy: gap is too narrow for the test. |
| 3 | **2-tile gap (64px)** | Running jump | Should clear with comfortable margin. Shouldn't need frame-perfect timing. | If tight: increase JUMP_FORCE or reduce GRAVITY_RISE. If trivial: widen gap to 80px. |
| 4 | **Edge jump** | Run to platform edge, jump at last moment | With coyote + buffer, this should always work. Missing = params too tight. | Increase COYOTE_FRAMES or BUFFER_FRAMES by 1–2. |
| 5 | **Platform landing (P3, 32px wide)** | Jump to narrow platform | Corner correction should help. Should land if center is within 6px of edge. | If falling off: increase CORNER_NUDGE_PX. If snapping weirdly: decrease it. |
| 6 | **Turnaround** | Run right at max speed, immediately press left | Should see brief skid (~14px), then accelerate left. Should feel weighty, not sluggish. | If too slippery: increase TURN_DECEL. If too instant: decrease it. |
| 7 | **Air commitment** | Jump right, try to reverse left mid-air | Should be able to curve the arc but not reverse it. Momentum preserved. | If too much air control: decrease AIR_ACCEL. If helpless: increase it. |
| 8 | **Landing feel** | Jump high, land | Should see squash animation + dust particles. Landing should feel like impact, not like floating down. | If floaty: increase GRAVITY_FALL. If harsh: increase landing squash duration. |
| 9 | **Stomp chain** | Jump on enemy, immediately steer to next enemy | STOMP_BOUNCE should give enough height to reach a nearby enemy. Air control lets you steer. | If can't reach: increase STOMP_BOUNCE magnitude. If too pinball-y: decrease it. |
| 10 | **Walk off → die** | Walk off platform, fall into pit | Should feel committed and fair. No surprise deaths from corner correction pushing you. | If correction pulls you back: corner correction is active when grounded (bug). |
| 11 | **Apex hang** | Hold jump at peak of arc | Should feel a subtle float at the top. NOT a freeze or hover — just slightly extended airtime. | If too floaty: decrease APEX_THRESHOLD or increase APEX_GRAVITY_MOD toward 1.0. If imperceptible: widen threshold. |
| 12 | **Wall run** | Run into a wall | Velocity should zero out, no sticking. Releasing away from wall should move immediately. | If sticky: check collision resolution order (X before Y). |

### Observation Checklist (run every tuning pass)
- [ ] Does a full jump feel like it has a clear *arc* (fast rise, hang, fast fall)?
- [ ] Can I distinguish short hop from full hop without thinking about it?
- [ ] Does running feel like I'm controlling a character with *weight*, not a cursor?
- [ ] Do turnarounds have a visible skid frame?
- [ ] When I land, does the ground feel solid (squash + dust + small shake)?
- [ ] After a stomp, do I feel rewarded (freeze + particles + bounce)?
- [ ] When I get hit, is there a clear "ow" moment (freeze + knockback + flash)?
- [ ] Can I make every jump in the level without frame-perfect timing?

---

## 4. Feedback & Juice Plan

### Research Context

**Normoyle et al. (2014)** found that constant delays up to 300ms barely affect player experience, but *jitter* (varying delay) is devastating. At 200ms + 150ms jitter, 100% of players noticed the lag vs. <50% at a constant 300ms. **Implication: fixed timestep physics is more important than low latency. Never skip frames or vary update rate.** A consistent 60fps with occasional visual-only drops is far better than variable-rate physics.

**Chen (2006)** defines Flow as the balance between challenge and player ability. The forgiveness mechanics (coyote time, buffering, corner correction) exist to *widen the Flow Zone* — they make the game accessible to casual players without removing challenge for skilled ones. Juice (particles, shake, freeze) provides the *direct feedback* that Flow theory identifies as essential: every action has an immediate, readable consequence.

### Hit-Stop Rules

| Event | Freeze Frames | Camera Shake | Why |
|---|---|---|---|
| Stomp kill | 4 (67ms) | Medium (intensity 5) | Reward. The pause lets you *feel* the kill. |
| Stomp (boss, not dead) | 6 (100ms) | Heavy (intensity 8) | Bigger reward for harder target. |
| Player hit (non-lethal) | 3 (50ms) | Light (intensity 4) | Interrupt. Brief enough to not feel sluggish. |
| Player death | 5 (83ms) + 15 slow-mo | Heavy (intensity 8) | Drama. Slow-mo lets you see what killed you. |
| Power-up collect | 0 | Light (intensity 3) | Celebration, not interruption. |
| Boss ground slam | 0 | Heavy (intensity 10) | Environmental impact, not player action. |

### Camera Rules

- **Follow**: Lerp to player at 0.1 per frame (current). This is correct — smooth but responsive.
- **Look-ahead**: Camera target should be `playerX + facing * 40` (shift 40px in movement direction). Gives the player more view of where they're going. Not yet implemented.
- **Vertical follow**: Don't follow player vertically during short hops. Only adjust camera Y when player is >100px from vertical center. Prevents jittery vertical movement.
- **Trauma-based shake** (already implemented): Quadratic falloff, sine-wave offsets. Correct approach.
- **Landing shake**: Keep small (intensity 3). Landing happens constantly — shake must not become noise.
- **Death**: Freeze camera position during death animation. Don't follow the corpse off-screen.

### Particle Rules

| Event | Particle Type | Count | Purpose |
|---|---|---|---|
| Jump | None | 0 | Mario doesn't particle on jump. Keeps the action clean. |
| Land (from height) | Dust puffs | 3–4 | Communicates "ground contact." Brown/tan, fade fast. |
| Run (on ground) | Small dust | 1 per 4 frames | Communicates speed. Only when |vx| > 2. |
| Stomp kill | Stars + burst | 6 | Communicates "enemy dead." Gold, radiates outward. |
| Player hit | White flash | — | Sprite turns white for 2–3 frames. No particles needed. |
| Player death | Burst + body pop | 10 | Communicates finality. White dots, large radius. |
| Tiara collect | Sparkle | 5 | Communicates "got it." Gold stars, upward float. |
| Power-up collect | Colored burst | 8 | Communicates type via color. Larger than tiara. |
| Tiara idle | Tiny sparkle | 1 per 20 frames | Communicates "I'm here, pick me up." Subtle. |
| Fireball trail | Fire dots | 1 per 3 frames | Communicates projectile path. Orange + gold. |
| Fireball impact | Fire burst | 8+4 | Communicates hit. Larger radius than trail. |

### Audio Layering (When Implemented)

| Event | Sound Character | Priority |
|---|---|---|
| Jump | Short, percussive "bwip" | High — must play every time |
| Land | Soft thud, scaled by fall distance | Medium |
| Stomp | Crunchy "bonk" + enemy squish | High |
| Player hit | Sharp "ow" + shield-break if shielded | High |
| Death | Descending tone, sad | High |
| Tiara collect | Bright chime, ascending pitch for consecutive | Medium |
| Power-up | Triumphant ascending arpeggio | High |
| Run footsteps | DO NOT ADD. Mario has no footstep sounds. They add noise, not information. | — |
| Background music | Per-level theme, reduce volume during boss phase transitions | Low (continuous) |

---

## 5. Minimal Architecture for Iteration

### Current State

The code is organized well for a first pass but has physics coupled to input and collision in the same update loop. This makes tuning difficult because changing one parameter has cascading effects.

### Target Architecture (Minimal Refactor)

```
Input Sampling          → InputManager.update()        [already separate]
  ↓
Movement Simulation     → Player.simulate(input, dt)   [pure physics, no collision]
  ↓
Collision Resolution    → Collider.resolve(player, level)  [separate pass]
  ↓
Game Rules              → Game._updatePlaying()         [stomp, collect, state]
  ↓
Animation State         → Player.animState()            [derived from physics state]
  ↓
Rendering               → Renderer.renderLevel()        [reads state, never writes]
```

### Key Refactor: Separate Simulation from Collision in Player

Current `player.update()` does movement AND collision in one function. Split into:

```javascript
// In player.js
simulate(input) {
  // Apply accel/decel/gravity to vx, vy
  // Apply squash-stretch recovery
  // Update abilities
  // DO NOT move position or check collisions here
}

applyMovement() {
  // this.x += this.vx; this.y += this.vy;
}
```

```javascript
// New file: collider.js
resolvePlayerLevel(player, levelData) {
  // Ground check, platform check, gap check
  // Sets player.onGround, corrects player.y
  // Corner correction lives here
}
```

```javascript
// In game.js _updatePlaying():
player.simulate(input);
player.applyMovement();
Collider.resolvePlayerLevel(player, levelData);
// ... then enemy/projectile/collection logic
```

**Why this matters**: When tuning GRAVITY_FALL, you currently have to mentally trace through collision checks to understand the arc. With separation, you change gravity → simulate → see the arc → collision resolves independently.

### Fixed Timestep (Critical — Normoyle Finding)

The research paper's key finding: **jitter destroys feel more than latency**. Our `requestAnimationFrame` loop runs at variable intervals. If a frame takes 20ms instead of 16.7ms, the physics step is longer, producing jitter in the character's movement.

Add a fixed timestep accumulator:

```javascript
const FIXED_DT = 1000 / 60; // 16.667ms
let accumulator = 0;
let lastTime = 0;

function gameLoop(timestamp) {
  accumulator += timestamp - lastTime;
  lastTime = timestamp;

  // Cap accumulator to prevent spiral of death
  if (accumulator > FIXED_DT * 5) accumulator = FIXED_DT * 5;

  while (accumulator >= FIXED_DT) {
    game.update(input);  // always exactly 1/60th second
    accumulator -= FIXED_DT;
  }

  render(); // render at whatever rate the display allows
  requestAnimationFrame(gameLoop);
}
```

This ensures physics runs at exactly 60 ticks per second regardless of frame rate, eliminating the jitter that Normoyle found destroys player experience.

### Debug Overlay

Add a toggleable debug HUD (press backtick `` ` `` to toggle):

```javascript
// debug.js
export function renderDebug(ctx, game) {
  const p = game.player;
  const lines = [
    `vx: ${p.vx.toFixed(2)}  vy: ${p.vy.toFixed(2)}`,
    `ground: ${p.onGround}  coyote: ${p.coyoteTime}  buffer: ${p.jumpBuffer}`,
    `pos: ${p.x.toFixed(0)}, ${p.y.toFixed(0)}`,
    `scale: ${p.scaleX.toFixed(2)}, ${p.scaleY.toFixed(2)}`,
    `freeze: ${game.freezeTimer}  slowmo: ${game.slowMoTimer}`,
    `trauma: ${game.camera._trauma.toFixed(2)}`,
    `abilities: ${p.abilities.map(a => a.type + ':' + a.remaining).join(', ')}`,
    `flash: ${p.flashTimer}  invincible: ${p.invincible}`,
  ];
  ctx.save();
  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, 220, lines.length * 14 + 8);
  ctx.fillStyle = '#0f0';
  lines.forEach((l, i) => ctx.fillText(l, 4, 14 + i * 14));
  ctx.restore();
}
```

This is essential for tuning — you need to see the numbers while playing to correlate feel with values.

---

## 6. Tech Recommendation

### Stay on Canvas2D.

Canvas2D is not limiting the *feel* or the *look* of this game. The visual style is sprite-based procedural drawing (ellipses, rects, arcs) — this is Canvas2D's sweet spot. There is no shader effect, blend mode, or rendering technique needed for Mario-like feel that Canvas2D can't handle.

Specific capabilities confirmed sufficient:
- `globalAlpha` for flash/blink effects
- `globalCompositeOperation` for isolated effects (use sparingly, on offscreen canvases)
- `createRadialGradient` for glows and atmosphere
- `drawImage` for brick patterns (already using offscreen canvas)
- Transform stack (`save/restore/translate/scale/rotate`) for squash-stretch and character drawing

**Do NOT migrate to WebGL/Pixi.** The complexity cost (build tooling, WebGL context management, shader debugging) would consume weeks that should go to tuning and content. Capacitor's WKWebView has excellent Canvas2D performance.

If you later want:
- **Additive blending** (for fire/magic effects): use an offscreen canvas with `lighter` composite, then `drawImage` it onto the main canvas
- **Full-screen post-processing** (screen flash, vignette): draw to offscreen canvas, manipulate with `getImageData`/`putImageData` — adequate for 393x852 at 60fps
- **Parallax with many layers**: already working with camera offset multipliers, no change needed

### Next 2-Week Goals

**Week 1: Tuning**
1. Add TURN_DECEL constant and implement the skid mechanic (2 hours)
2. Apply recommended parameter values from the tuning sheet (1 hour)
3. Implement fixed timestep game loop (1 hour)
4. Build the test room level (1 hour)
5. Add debug overlay with backtick toggle (1 hour)
6. Run the feel testing protocol, iterate parameters (ongoing)

**Week 2: Separation + Polish**
7. Split Player.update() into simulate() + applyMovement() (2 hours)
8. Extract collision into collider.js (2 hours)
9. Add camera look-ahead (30 minutes)
10. Tighten apex hang parameters (30 minutes)
11. Lower AIR_DECEL to near-zero, playtest (30 minutes)
12. Full playthrough with new parameters, final adjustments (ongoing)
13. `npx cap sync ios` + device test for frame timing consistency
