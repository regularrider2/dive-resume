// NPC "Ghost Diver" sprite — a translucent, spectral diver hovering in place.
// Ghostly look: semi-transparent, pale gray-white palette, soft glow.
export function drawNPCDiver(ctx, x, y, direction, bobOffset, pixelSize) {
  const p = pixelSize ?? 3;
  const s = p * 5.8;
  const bob = bobOffset ?? 0;

  ctx.save();
  ctx.translate(x + 28 * p, y + 14 * p + bob);
  if (direction === -1) ctx.scale(-1, 1);

  // ─── Soft outer glow (ghost aura) ─────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.25;
  const glowR = s * 8;
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
  glowGrad.addColorStop(0,   'rgba(220,240,255,0.5)');
  glowGrad.addColorStop(0.5, 'rgba(180,220,255,0.15)');
  glowGrad.addColorStop(1,   'rgba(140,200,240,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ─── Ghost: semi-transparent overall ─────────────────────────────────────
  ctx.globalAlpha = 0.82;

  // ─── Colour palette (pale, ethereal — ghost diver) ───────────────────────
  const suitMain    = 'rgba(220,235,255,0.9)';
  const suitLight   = 'rgba(245,250,255,0.95)';
  const suitSeam    = 'rgba(180,200,230,0.85)';
  const suitPanel   = 'rgba(200,220,245,0.9)';
  const bcdColor    = 'rgba(190,210,240,0.8)';
  const bcdHighlight= 'rgba(230,240,255,0.9)';
  const tankColor   = 'rgba(200,215,235,0.85)';
  const tankHi      = 'rgba(235,245,255,0.9)';
  const tankDark    = 'rgba(160,185,220,0.8)';
  const tankValve   = 'rgba(120,140,180,0.7)';
  const hoseColor   = 'rgba(170,195,225,0.8)';
  const skinColor   = 'rgba(245,240,235,0.75)';
  const skinShadow  = 'rgba(220,215,210,0.6)';
  const maskFrame   = 'rgba(80,100,130,0.6)';
  const finColor    = 'rgba(220,235,250,0.85)';
  const finDark     = 'rgba(180,205,235,0.8)';
  const finLight    = 'rgba(245,250,255,0.9)';
  const gloveColor  = 'rgba(200,215,230,0.7)';
  const outlineCol  = 'rgba(180,200,230,0.5)';

  // ─── FINS (no kick — static hover pose) ──────────────────────────────────
  const finSpread = s * 0.4;
  ctx.save();
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(-s * 2.8,  finSpread * 0.6 - s * 0.1);
  ctx.bezierCurveTo(-s * 4.2, finSpread * 0.8 - s * 0.15, -s * 6.2, finSpread * 1.1, -s * 7.0, finSpread * 0.85);
  ctx.bezierCurveTo(-s * 6.8, finSpread * 0.45, -s * 5.0, finSpread * 0.1, -s * 3.0, finSpread * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = finDark;
  ctx.beginPath();
  ctx.moveTo(-s * 3.2, finSpread * 0.55);
  ctx.bezierCurveTo(-s * 4.8, finSpread * 0.75, -s * 6.4, finSpread * 1.05, -s * 7.0, finSpread * 0.85);
  ctx.bezierCurveTo(-s * 6.5, finSpread * 0.72, -s * 5.0, finSpread * 0.6, -s * 3.4, finSpread * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = finLight;
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(-s * 3.0, finSpread * 0.3);
  ctx.bezierCurveTo(-s * 5.0, finSpread * 0.55, -s * 6.2, finSpread * 0.75, -s * 6.8, finSpread * 0.82);
  ctx.stroke();
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(-s * 2.8, -finSpread * 0.6 + s * 0.1);
  ctx.bezierCurveTo(-s * 4.2, -finSpread * 0.8 + s * 0.15, -s * 6.2, -finSpread * 1.1, -s * 7.0, -finSpread * 0.85);
  ctx.bezierCurveTo(-s * 6.8, -finSpread * 0.45, -s * 5.0, -finSpread * 0.1, -s * 3.0, -finSpread * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = finDark;
  ctx.beginPath();
  ctx.moveTo(-s * 3.2, -finSpread * 0.55);
  ctx.bezierCurveTo(-s * 4.8, -finSpread * 0.75, -s * 6.4, -finSpread * 1.05, -s * 7.0, -finSpread * 0.85);
  ctx.bezierCurveTo(-s * 6.5, -finSpread * 0.72, -s * 5.0, -finSpread * 0.6, -s * 3.4, -finSpread * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ─── LEGS ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.ellipse(-s * 2.2,  finSpread * 0.35, s * 1.5, s * 0.55, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 2.2, -finSpread * 0.35, s * 1.5, s * 0.55, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = suitSeam;
  ctx.beginPath();
  ctx.ellipse(-s * 3.1,  finSpread * 0.4, s * 0.55, s * 0.35, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 3.1, -finSpread * 0.4, s * 0.55, s * 0.35, -0.08, 0, Math.PI * 2);
  ctx.fill();

  // ─── TANK & BCD ───────────────────────────────────────────────────────────
  ctx.fillStyle = bcdColor;
  ctx.beginPath();
  ctx.roundRect(-s * 0.9, -s * 3.2, s * 2.6, s * 1.0, s * 0.15);
  ctx.fill();
  ctx.fillStyle = bcdHighlight;
  ctx.beginPath();
  ctx.roundRect(-s * 0.9, -s * 3.2, s * 2.6, s * 0.25, [s * 0.15, s * 0.15, 0, 0]);
  ctx.fill();
  ctx.fillStyle = tankColor;
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 3.55, s * 2.2, s * 0.8, s * 0.18);
  ctx.fill();
  ctx.fillStyle = tankHi;
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 3.55, s * 2.2, s * 0.22, [s * 0.18, s * 0.18, 0, 0]);
  ctx.fill();
  ctx.fillStyle = tankDark;
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 2.97, s * 2.2, s * 0.22, [0, 0, s * 0.18, s * 0.18]);
  ctx.fill();
  ctx.fillStyle = tankDark;
  ctx.fillRect(-s * 0.7, -s * 3.22, s * 2.2, s * 0.1);
  ctx.fillStyle = tankValve;
  ctx.beginPath();
  ctx.roundRect(s * 1.1, -s * 3.72, s * 0.38, s * 0.28, s * 0.06);
  ctx.fill();

  // ─── REGULATOR HOSE ───────────────────────────────────────────────────────
  ctx.strokeStyle = hoseColor;
  ctx.lineWidth = s * 0.18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 1.4, -s * 3.6);
  ctx.bezierCurveTo(s * 2.0, -s * 3.2, s * 2.8, -s * 2.2, s * 3.1, -s * 1.1);
  ctx.bezierCurveTo(s * 3.2, -s * 0.7, s * 3.3, -s * 0.2, s * 3.5, s * 0.5);
  ctx.stroke();
  ctx.fillStyle = 'rgba(120,150,190,0.6)';
  ctx.beginPath();
  ctx.roundRect(s * 3.3, s * 0.42, s * 0.5, s * 0.32, s * 0.08);
  ctx.fill();

  // ─── BODY / TORSO ─────────────────────────────────────────────────────────
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.moveTo(s * 3.6,  s * 0.1);
  ctx.bezierCurveTo(s * 3.2, -s * 0.6, s * 1.2, -s * 1.8, -s * 1.0, -s * 1.5);
  ctx.bezierCurveTo(-s * 2.2, -s * 1.3, -s * 2.8, -s * 0.8, -s * 2.8, -s * 0.05);
  ctx.bezierCurveTo(-s * 2.8,  s * 0.8, -s * 2.2,  s * 1.4, -s * 1.0,  s * 1.5);
  ctx.bezierCurveTo( s * 1.2,  s * 1.9,  s * 3.2,  s * 0.8,  s * 3.6,  s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = suitLight;
  ctx.beginPath();
  ctx.ellipse(s * 0.6, -s * 0.7, s * 1.6, s * 0.5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = suitSeam;
  ctx.lineWidth = s * 0.06;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 3.2, -s * 0.35);
  ctx.bezierCurveTo(s * 1.0, -s * 1.6, -s * 1.5, -s * 1.4, -s * 2.6, -s * 0.5);
  ctx.stroke();

  // ─── BCD WINGS ────────────────────────────────────────────────────────────
  ctx.fillStyle = bcdColor;
  ctx.beginPath();
  ctx.ellipse(s * 0.2, -s * 1.75, s * 0.9, s * 0.28, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = bcdColor;
  ctx.lineWidth = s * 0.2;
  ctx.beginPath();
  ctx.moveTo(s * 0.6, -s * 1.55);
  ctx.bezierCurveTo(s * 1.4, -s * 1.35, s * 2.0, -s * 1.0, s * 2.4, -s * 0.55);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,248,255,0.9)';
  ctx.beginPath();
  ctx.roundRect(s * 1.8, -s * 0.62, s * 0.3, s * 0.18, s * 0.04);
  ctx.fill();

  // ─── BACK ARM ─────────────────────────────────────────────────────────────
  ctx.fillStyle = suitSeam;
  ctx.beginPath();
  ctx.ellipse(s * 0.8, -s * 1.5, s * 1.2, s * 0.38, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // ─── FRONT ARM — relaxed, hanging down slightly ───────────────────────────
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.ellipse(s * 1.0, s * 1.6, s * 1.35, s * 0.42, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = suitPanel;
  ctx.beginPath();
  ctx.ellipse(s * 0.4, s * 1.55, s * 0.4, s * 0.3, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gloveColor;
  ctx.beginPath();
  ctx.ellipse(s * 2.15, s * 1.75, s * 0.42, s * 0.28, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,180,220,0.5)';
  ctx.lineWidth = s * 0.05;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(s * (1.92 + i * 0.14), s * 1.62);
    ctx.lineTo(s * (1.92 + i * 0.14), s * 1.88);
    ctx.stroke();
  }

  // ─── HEAD ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(s * 3.0, s * 0.2, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hood
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.arc(s * 3.4, -s * 0.15, s * 1.35, 0, Math.PI * 2);
  ctx.fill();
  // Wispy pale hair at hood edge (ghostly)
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(s * 3.4, s * 1.1, s * 0.7, s * 0.22, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(240,248,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(s * 3.55, s * 1.18, s * 0.45, s * 0.14, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Hood seam
  ctx.strokeStyle = suitSeam;
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.arc(s * 3.4, -s * 0.15, s * 1.35, Math.PI * 0.55, Math.PI * 1.35);
  ctx.stroke();
  // Face skin
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(s * 3.55, s * 0.25, s * 0.65, s * 0.55, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.ellipse(s * 3.7, s * 0.55, s * 0.35, s * 0.22, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // ─── MASK (pale ghostly blue-gray) ─────────────────────────────────────────
  ctx.fillStyle = 'rgba(60,80,110,0.5)';
  ctx.beginPath();
  ctx.roundRect(s * 3.85, -s * 1.05, s * 1.4, s * 1.65, s * 0.28);
  ctx.fill();
  ctx.fillStyle = maskFrame;
  ctx.beginPath();
  ctx.roundRect(s * 3.92, -s * 0.98, s * 1.26, s * 1.52, s * 0.22);
  ctx.fill();
  // Pale ghostly lenses
  const lensGrad = ctx.createLinearGradient(s * 4.0, -s * 0.85, s * 4.0, s * 0.35);
  lensGrad.addColorStop(0,   'rgba(200,220,255,0.6)');
  lensGrad.addColorStop(0.5, 'rgba(180,205,240,0.5)');
  lensGrad.addColorStop(1,   'rgba(160,190,230,0.45)');
  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.roundRect(s * 3.97, -s * 0.92, s * 0.52, s * 1.1, s * 0.12);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(s * 4.56, -s * 0.92, s * 0.52, s * 1.1, s * 0.12);
  ctx.fill();
  ctx.fillStyle = maskFrame;
  ctx.fillRect(s * 4.48, -s * 0.85, s * 0.1, s * 0.95);
  // Lens reflections (soft ghost glow)
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(s * 4.12, -s * 0.72, s * 0.1, s * 0.22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 4.70, -s * 0.72, s * 0.1, s * 0.22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Mask strap
  ctx.strokeStyle = 'rgba(100,130,170,0.5)';
  ctx.lineWidth = s * 0.12;
  ctx.beginPath();
  ctx.moveTo(s * 3.92, -s * 0.4);
  ctx.bezierCurveTo(s * 3.6, -s * 0.6, s * 2.8, -s * 1.1, s * 2.4, -s * 1.0);
  ctx.stroke();

  // ─── OUTLINE ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = outlineCol;
  ctx.lineWidth = s * 0.09;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 3.6,  s * 0.1);
  ctx.bezierCurveTo(s * 3.2, -s * 0.6, s * 1.2, -s * 1.8, -s * 1.0, -s * 1.5);
  ctx.bezierCurveTo(-s * 2.2, -s * 1.3, -s * 2.8, -s * 0.8, -s * 2.8, -s * 0.05);
  ctx.bezierCurveTo(-s * 2.8,  s * 0.8, -s * 2.2,  s * 1.4, -s * 1.0,  s * 1.5);
  ctx.bezierCurveTo( s * 1.2,  s * 1.9,  s * 3.2,  s * 0.8,  s * 3.6,  s * 0.1);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 3.4, -s * 0.15, s * 1.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
