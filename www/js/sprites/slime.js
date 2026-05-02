// ============================================================
// SPRITE: Slime
// ============================================================

export function drawSlime(ctx, x, y, frame, squished) {
  ctx.save();
  ctx.translate(x, y);
  if (squished) ctx.scale(1.3, 0.3);

  const bob = Math.sin(frame * 0.12) * 2;
  const squash = 1 + Math.sin(frame * 0.12) * 0.06;

  // Body blob
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(0, 10 + bob, 20 * squash, 14 / squash, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = '#FF85C8';
  ctx.beginPath();
  ctx.ellipse(-5, 4 + bob, 7, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-7, 6 + bob, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7, 6 + bob, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#d63384';
  ctx.beginPath();
  ctx.ellipse(-5.5, 7 + bob, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8.5, 7 + bob, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#c2185b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 14 + bob, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.restore();
}
