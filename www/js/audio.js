// ============================================================
// SOUND MANAGER — Stubs (no-op, logs to console)
// ============================================================

export class SoundManager {
  constructor() {
    this.muted = false;
  }

  play(name) {
    if (!this.muted) {
      // console.log('[SFX]', name);
    }
  }

  playMusic(name) {
    if (!this.muted) {
      // console.log('[Music]', name);
    }
  }

  stopMusic() {
    // console.log('[Music] stop');
  }

  toggle() {
    this.muted = !this.muted;
  }
}
