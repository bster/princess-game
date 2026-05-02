# Graphics Upgrade Plan — Prioritized Top 6

## 1. Parallax Background Layers (HIGH)
**Why:** Single biggest bang-for-buck depth cue. Two+ layers scrolling at different speeds immediately creates a sense of world depth and scale that flat backgrounds cannot achieve. Players subconsciously read parallax as "this world is real."

**Files:** `renderer.js`, new `render/parallax.js`, `constants.js`, `levels/levelData.js`

**Steps:**
1. Create `render/parallax.js` with `drawParallax(ctx, layers, camX, camY, vpW, vpH)` API
2. Define 2 layer types: far mountains/hills (0.15x) and mid foliage/terrain (0.4x)
3. Each layer = array of procedural shape functions with per-level color palette
4. Draw after sky gradient, before existing clouds
5. Use low-saturation, low-contrast colors so gameplay layer stays readable

**Tunables:** `PARALLAX_FAR_SPEED`, `PARALLAX_MID_SPEED`, per-level layer colors/shapes, layer opacity

---

## 2. Ground Contact Shadows (HIGH)
**Why:** Entities "float" without shadows — adding soft oval shadows under characters grounds them visually and communicates height-above-ground (critical for a platformer).

**Files:** `renderer.js`, new `render/shadows.js`, `constants.js`

**Steps:**
1. Create `drawContactShadow(ctx, x, groundY, heightAboveGround, baseRadius)` helper
2. Shadow = radial-gradient ellipse, opacity falls off with height
3. Size shrinks with height (parallax depth cue)
4. Render shadows before entities, after platforms
5. Apply to player + all alive enemies

**Tunables:** `SHADOW_MAX_OPACITY`, `SHADOW_FADE_HEIGHT`, `SHADOW_BASE_RADIUS`, `SHADOW_SQUASH`

---

## 3. Material Depth for Platforms/Ground (MEDIUM-HIGH)
**Why:** Flat-colored rectangles read as placeholder art. Vertical gradients + edge highlights make platforms feel solid and 3D. Small brick variation breaks visual monotony.

**Files:** `renderer.js`, new `render/materials.js`, `constants.js`

**Steps:**
1. Create `drawPlatformWithBevel(ctx, x, y, w, h, colors)` helper
2. Add vertical gradient fill (lighter top → darker bottom)
3. Add 2px top-edge highlight (bright) and 1px bottom shadow
4. Add grass tufts on platform top edges
5. For bricks: add deterministic per-tile color jitter using seeded hash

**Tunables:** Platform gradient colors, highlight/shadow intensity, grass tuft density, brick variation amount

---

## 4. Ambient Particles (MEDIUM)
**Why:** Floating dust motes, leaves, or fireflies add life to static scenes. Very cheap to render, huge atmosphere payoff.

**Files:** `particles.js`, `renderer.js`, `levels/levelData.js`

**Steps:**
1. Add ambient particle type with slow drift, no gravity
2. Per-level ambient config (leaves for meadow, embers for fortress, crystals for cavern)
3. Spawn continuously at edges of viewport
4. Very low opacity (0.1–0.3)

**Tunables:** Ambient count, drift speed, size range, per-level color/type

---

## 5. Entity Outline/Rim Light (MEDIUM)
**Why:** Sprites can blend into busy backgrounds. A subtle 1px outline or top-edge rim light separates entities from the world and improves readability.

**Files:** `renderer.js`, sprite files

**Steps:**
1. After drawing each entity sprite, overdraw with slight offset or glow
2. Use `ctx.shadowColor/shadowBlur` for cheap rim light
3. Only apply in playing state, not menus

**Tunables:** Rim color, blur radius, offset

---

## 6. Sky Atmosphere Effects (LOW-MEDIUM)
**Why:** Animated light rays, color-cycling sky, or horizon fog add premium atmosphere with minimal code.

**Files:** `renderer.js`, new `render/atmosphere.js`

**Steps:**
1. Add animated gradient bands that shift over time
2. Optional god-ray triangles from sun position
3. Horizon fog strip between sky and ground

**Tunables:** Ray count, fog height, animation speed, ray opacity

---

## Implementation Priority
| # | Upgrade | Impact | Effort | Ship Order |
|---|---------|--------|--------|------------|
| 1 | Parallax layers | ★★★★★ | Medium | First |
| 2 | Contact shadows | ★★★★☆ | Low | Second |
| 3 | Platform materials | ★★★★☆ | Medium | Third |
| 4 | Ambient particles | ★★★☆☆ | Low | Fourth |
| 5 | Entity rim light | ★★★☆☆ | Low | Fifth |
| 6 | Sky atmosphere | ★★☆☆☆ | Medium | Sixth |
