// ============================================================
// SPRITE: Slime — gelatinous wobble, eye tracking, shine
// ============================================================

const BODY = '#FF69B4';
const BODY_DARK = '#D14F90';
const BODY_HI = '#FFA8D2';
const SHINE = 'rgba(255,255,255,0.55)';
const PUPIL = '#5b1546';

export function drawSlime(ctx, x, y, frame, squished, opts) {
  const facing = opts && typeof opts.facing === 'number' ? opts.facing : 1;

  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1.3, 0.3);

  // Two-axis wobble: vertical squash/stretch + horizontal sway
  const wobble = Math.sin(frame * 0.12);
  const wobble2 = Math.sin(frame * 0.18 + 1.2);
  const sx = 1 + wobble * 0.08 + wobble2 * 0.03;
  const sy = 1 - wobble * 0.08;
  const bob = wobble * 2.5;

  // Drop tongue (rare drip)
  const dripPhase = frame % 240;
  if (dripPhase > 230) {
    ctx.fillStyle = BODY;
    const dy = (dripPhase - 230) * 0.6;
    ctx.beginPath();
    ctx.ellipse(2, 22 + bob + dy, 1.6, 2 + dy * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body shadow base
  ctx.fillStyle = BODY_DARK;
  ctx.beginPath();
  ctx.ellipse(0, 14 + bob, 22 * sx, 16 / sy, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body main
  ctx.fillStyle = BODY;
  ctx.beginPath();
  ctx.ellipse(0, 10 + bob, 20 * sx, 14 / sy, 0, 0, Math.PI * 2);
  ctx.fill();
  // Top highlight (lighter blob)
  ctx.fillStyle = BODY_HI;
  ctx.beginPath();
  ctx.ellipse(-3, 4 + bob, 12 * sx, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Specular shine
  ctx.fillStyle = SHINE;
  ctx.beginPath();
  ctx.ellipse(-7, 1 + bob, 4, 2, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — track facing direction
  const eyeOff = facing > 0 ? 1.2 : -1.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-7, 6 + bob, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7, 6 + bob, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  ctx.fillStyle = PUPIL;
  ctx.beginPath();
  ctx.ellipse(-7 + eyeOff, 7 + bob, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7 + eyeOff, 7 + bob, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupil glints
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-7 + eyeOff + 0.6, 6.2 + bob, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7 + eyeOff + 0.6, 6.2 + bob, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Mouth — smug little smile
  ctx.strokeStyle = '#8a1f5e';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 14 + bob, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Tooth nub
  ctx.fillStyle = '#fff';
  ctx.fillRect(-1, 16 + bob, 2, 1.5);
  ctx.lineCap = 'butt';

  ctx.restore();
}
