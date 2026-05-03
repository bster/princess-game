// ============================================================
// SOUND MANAGER — Procedural WebAudio synth
// Lazy-init on first user gesture so iOS Safari is happy.
// ============================================================

/**
 * @typedef {{
 *   name: string,
 *   notes?: number[],
 *   step?: number,
 *   wave?: OscillatorType,
 *   dur?: number,
 *   vol?: number,
 *   sweep?: number,
 *   noise?: number,
 *   type?: 'tone' | 'sweep' | 'noise' | 'chord'
 * }} SfxDef
 */

/** @type {Record<string, SfxDef>} */
const SFX = {
  jump: { type: 'sweep', wave: 'square', notes: [520, 880], dur: 0.12, vol: 0.18 },
  doublejump: { type: 'sweep', wave: 'square', notes: [880, 1320], dur: 0.1, vol: 0.16 },
  stomp: { type: 'sweep', wave: 'triangle', notes: [220, 90], dur: 0.18, vol: 0.28 },
  coin: { type: 'tone', wave: 'square', notes: [988, 1568], step: 0.06, dur: 0.18, vol: 0.16 },
  gem: { type: 'tone', wave: 'square', notes: [988, 1318, 1568, 1976], step: 0.06, dur: 0.32, vol: 0.18 },
  hurt: { type: 'sweep', wave: 'sawtooth', notes: [380, 100], dur: 0.22, vol: 0.22 },
  death: { type: 'tone', wave: 'square', notes: [523, 392, 311, 233], step: 0.13, dur: 0.6, vol: 0.22 },
  fireball: { type: 'sweep', wave: 'square', notes: [620, 320], dur: 0.16, vol: 0.16 },
  fireImpact: { type: 'noise', dur: 0.16, vol: 0.18 },
  powerup: { type: 'tone', wave: 'square', notes: [392, 523, 659, 784, 988, 1318], step: 0.07, dur: 0.5, vol: 0.2 },
  shieldOn: { type: 'sweep', wave: 'sine', notes: [440, 990], dur: 0.18, vol: 0.18 },
  growthOn: { type: 'sweep', wave: 'triangle', notes: [220, 660], dur: 0.22, vol: 0.2 },
  bossHit: { type: 'sweep', wave: 'square', notes: [220, 90], dur: 0.22, vol: 0.3 },
  bossDown: { type: 'tone', wave: 'sawtooth', notes: [180, 130, 90], step: 0.16, dur: 0.6, vol: 0.28 },
  flagRaise: { type: 'tone', wave: 'square', notes: [523, 659, 784, 988], step: 0.09, dur: 0.45, vol: 0.2 },
  cageOpen: { type: 'tone', wave: 'square', notes: [523, 659, 784, 1047, 1319], step: 0.08, dur: 0.55, vol: 0.22 },
  levelClear: { type: 'tone', wave: 'square', notes: [392, 523, 659, 784, 1047, 1319, 1568], step: 0.09, dur: 0.7, vol: 0.22 },
  victory: { type: 'tone', wave: 'square', notes: [523, 659, 784, 1047, 988, 1319], step: 0.16, dur: 1.1, vol: 0.24 },
  gameover: { type: 'tone', wave: 'sawtooth', notes: [262, 233, 196, 165, 131], step: 0.18, dur: 1, vol: 0.2 },
  uiClick: { type: 'sweep', wave: 'square', notes: [520, 760], dur: 0.06, vol: 0.12 },
  uiBack: { type: 'sweep', wave: 'square', notes: [520, 280], dur: 0.08, vol: 0.12 },
  uiSelect: { type: 'tone', wave: 'square', notes: [659, 880], step: 0.05, dur: 0.14, vol: 0.16 },
  mapEnter: { type: 'tone', wave: 'square', notes: [523, 784, 1047], step: 0.05, dur: 0.2, vol: 0.18 },
  slotSpin: { type: 'sweep', wave: 'square', notes: [180, 220], dur: 0.12, vol: 0.1 },
  slotStop: { type: 'sweep', wave: 'square', notes: [320, 180], dur: 0.08, vol: 0.14 },
  slotWin: { type: 'tone', wave: 'square', notes: [523, 659, 784, 1047, 1319], step: 0.07, dur: 0.45, vol: 0.22 },
  slotLose: { type: 'sweep', wave: 'square', notes: [330, 200], dur: 0.18, vol: 0.14 },
  clawMove: { type: 'sweep', wave: 'triangle', notes: [220, 280], dur: 0.06, vol: 0.06 },
  clawDrop: { type: 'sweep', wave: 'sawtooth', notes: [400, 120], dur: 0.32, vol: 0.18 },
  clawWin: { type: 'tone', wave: 'square', notes: [659, 880, 1175], step: 0.07, dur: 0.3, vol: 0.2 },
  clawMiss: { type: 'noise', dur: 0.2, vol: 0.14 },
  hoopShoot: { type: 'sweep', wave: 'square', notes: [340, 180], dur: 0.14, vol: 0.14 },
  hoopSwish: { type: 'tone', wave: 'square', notes: [880, 1175, 1568], step: 0.06, dur: 0.3, vol: 0.2 },
  hoopMiss: { type: 'noise', dur: 0.18, vol: 0.14 },
  oneUp: { type: 'tone', wave: 'square', notes: [659, 880, 988, 1319], step: 0.08, dur: 0.4, vol: 0.22 },
};

export class SoundManager {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    /** @type {GainNode | null} */
    this.master = null;
    this.muted = false;
    this._lastPlayedAt = new Map();

    const init = () => {
      if (this.ctx) return;
      const Ctx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      if (!Ctx) return;
      try {
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.6;
        this.master.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
      }
    };

    const events = ['pointerdown', 'touchstart', 'keydown'];
    const onceInit = () => {
      init();
      for (const e of events) window.removeEventListener(e, onceInit);
    };
    for (const e of events) window.addEventListener(e, onceInit, { passive: true, once: false });
  }

  toggle() {
    this.muted = !this.muted;
  }

  setMuted(v) {
    this.muted = !!v;
  }

  play(name) {
    if (this.muted || !this.ctx || !this.master) return;
    const def = SFX[name];
    if (!def) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const last = this._lastPlayedAt.get(name) || 0;
    const now = this.ctx.currentTime;
    if (now - last < 0.018) return;
    this._lastPlayedAt.set(name, now);

    if (def.type === 'noise') return this._noise(def, now);
    if (def.type === 'sweep') return this._sweep(def, now);
    return this._tone(def, now);
  }

  playMusic(_name) {
    /* music intentionally omitted */
  }

  stopMusic() {
    /* noop */
  }

  _envelope(node, t, dur, peak) {
    const a = 0.005;
    const r = Math.max(dur - a, 0.04);
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + r);
  }

  _tone(def, startAt) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const notes = def.notes || [440];
    const step = def.step || 0.07;
    const peak = def.vol ?? 0.18;
    for (let i = 0; i < notes.length; i++) {
      const t = startAt + i * step;
      const osc = ctx.createOscillator();
      osc.type = def.wave || 'square';
      osc.frequency.setValueAtTime(notes[i], t);
      const g = ctx.createGain();
      this._envelope(g, t, step + 0.05, peak);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + step + 0.1);
    }
  }

  _sweep(def, t) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const [a, b] = def.notes || [440, 220];
    const dur = def.dur ?? 0.16;
    const peak = def.vol ?? 0.18;
    const osc = ctx.createOscillator();
    osc.type = def.wave || 'square';
    osc.frequency.setValueAtTime(a, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(b, 30), t + dur);
    const g = ctx.createGain();
    this._envelope(g, t, dur, peak);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  _noise(def, t) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const dur = def.dur ?? 0.18;
    const peak = def.vol ?? 0.18;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    this._envelope(g, t, dur, peak);
    src.connect(filter).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }
}
