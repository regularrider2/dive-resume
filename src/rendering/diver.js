import theme from '../config/theme.json';

// Draw a scuba diver in horizontal prone swimming position.
// Origin is the logical player position; the sprite is translated so the
// centre of the torso sits at (playerX, playerY).
export function drawDiver(ctx, x, y, direction, frame, pixelSize, colorOverride) {
  const p  = pixelSize ?? theme.pixelSize ?? 2;
  const c  = colorOverride ?? theme.diver.colors;
  const s  = p * 5.8;   // scale unit — bump here to resize everything uniformly

  ctx.save();
  ctx.translate(x + 28 * p, y + 14 * p);
  if (direction === -1) ctx.scale(-1, 1);

  // Animation values
  const finKick   = frame === 1 ?  s * 0.55 : -s * 0.28;
  const armSwing  = frame === 1 ?  s * 0.14 : -s * 0.09;

  // ─── Colour palette ───────────────────────────────────────────────────────
  const suitMain   = c.suit         ?? '#1a1a2e';
  const suitLight  = c.suitLight    ?? '#26264a';
  const suitSeam   = c.suitDark     ?? '#111126';
  const suitPanel  = '#222244';
  const bcdColor   = '#2a3a50';
  const bcdHighlight = '#3a5070';
  const tankColor  = c.tank         ?? '#8a8a8a';
  const tankHi     = c.tankHighlight ?? '#c0c0c0';
  const tankDark   = c.tankDark     ?? '#505050';
  const tankValve  = '#444444';
  const hoseColor  = c.hose         ?? '#444444';
  const skinColor  = c.skin         ?? '#e8b882';
  const skinShadow = c.skinShadow   ?? '#c8946a';
  const maskFrame  = c.maskFrame    ?? '#222222';
  const maskLens   = c.mask         ?? '#33bbe0';
  const finColor   = c.fins         ?? '#1e7a3a';
  const finDark    = c.finsDark     ?? '#155528';
  const finLight   = '#28a050';
  const gloveColor = '#1a2a1a';
  const outlineCol = c.outline      ?? '#0d0d1e';

  // ─── FINS ─────────────────────────────────────────────────────────────────
  // Blade — boot foot, pointed tip, two-tone
  ctx.save();
  // Upper fin blade
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(-s * 2.8,  finKick * 0.6 - s * 0.1);
  ctx.bezierCurveTo(-s * 4.2, finKick * 0.8 - s * 0.15,
                    -s * 6.2, finKick * 1.1,
                    -s * 7.0, finKick * 0.85);
  ctx.bezierCurveTo(-s * 6.8, finKick * 0.45,
                    -s * 5.0, finKick * 0.1,
                    -s * 3.0, finKick * 0.05);
  ctx.closePath();
  ctx.fill();
  // Fin rail (darker strip along blade edge)
  ctx.fillStyle = finDark;
  ctx.beginPath();
  ctx.moveTo(-s * 3.2, finKick * 0.55);
  ctx.bezierCurveTo(-s * 4.8, finKick * 0.75,
                    -s * 6.4, finKick * 1.05,
                    -s * 7.0, finKick * 0.85);
  ctx.bezierCurveTo(-s * 6.5, finKick * 0.72,
                    -s * 5.0, finKick * 0.6,
                    -s * 3.4, finKick * 0.5);
  ctx.closePath();
  ctx.fill();
  // Fin mid-rib
  ctx.strokeStyle = finLight;
  ctx.lineWidth   = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(-s * 3.0, finKick * 0.3);
  ctx.bezierCurveTo(-s * 5.0, finKick * 0.55, -s * 6.2, finKick * 0.75, -s * 6.8, finKick * 0.82);
  ctx.stroke();

  // Lower fin blade (mirror)
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(-s * 2.8, -finKick * 0.6 + s * 0.1);
  ctx.bezierCurveTo(-s * 4.2, -finKick * 0.8 + s * 0.15,
                    -s * 6.2, -finKick * 1.1,
                    -s * 7.0, -finKick * 0.85);
  ctx.bezierCurveTo(-s * 6.8, -finKick * 0.45,
                    -s * 5.0, -finKick * 0.1,
                    -s * 3.0, -finKick * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = finDark;
  ctx.beginPath();
  ctx.moveTo(-s * 3.2, -finKick * 0.55);
  ctx.bezierCurveTo(-s * 4.8, -finKick * 0.75,
                    -s * 6.4, -finKick * 1.05,
                    -s * 7.0, -finKick * 0.85);
  ctx.bezierCurveTo(-s * 6.5, -finKick * 0.72,
                    -s * 5.0, -finKick * 0.6,
                    -s * 3.4, -finKick * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = finLight;
  ctx.lineWidth   = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(-s * 3.0, -finKick * 0.3);
  ctx.bezierCurveTo(-s * 5.0, -finKick * 0.55, -s * 6.2, -finKick * 0.75, -s * 6.8, -finKick * 0.82);
  ctx.stroke();
  ctx.restore();

  // ─── LEGS ─────────────────────────────────────────────────────────────────
  // Two legs, tapered, with knee hint
  ctx.fillStyle = suitMain;
  // Upper leg pair
  ctx.beginPath();
  ctx.ellipse(-s * 2.2,  finKick * 0.35, s * 1.5, s * 0.55, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 2.2, -finKick * 0.35, s * 1.5, s * 0.55, -0.08, 0, Math.PI * 2);
  ctx.fill();
  // Boot cuff
  ctx.fillStyle = suitSeam;
  ctx.beginPath();
  ctx.ellipse(-s * 3.1,  finKick * 0.4, s * 0.55, s * 0.35, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 3.1, -finKick * 0.4, s * 0.55, s * 0.35, -0.08, 0, Math.PI * 2);
  ctx.fill();
  // Kneecap highlight
  ctx.fillStyle = suitPanel;
  ctx.beginPath();
  ctx.ellipse(-s * 1.6,  finKick * 0.3, s * 0.45, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 1.6, -finKick * 0.3, s * 0.45, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // ─── TANK & BCD ───────────────────────────────────────────────────────────
  // BCD backplate (behind tank, sits on diver's back = above body in prone)
  ctx.fillStyle = bcdColor;
  ctx.beginPath();
  ctx.roundRect(-s * 0.9, -s * 3.2, s * 2.6, s * 1.0, s * 0.15);
  ctx.fill();
  ctx.fillStyle = bcdHighlight;
  ctx.beginPath();
  ctx.roundRect(-s * 0.9, -s * 3.2, s * 2.6, s * 0.25, [s * 0.15, s * 0.15, 0, 0]);
  ctx.fill();

  // Tank cylinder — 3D with gradient shading
  ctx.fillStyle = tankColor;
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 3.55, s * 2.2, s * 0.8, s * 0.18);
  ctx.fill();
  // Tank highlight (top-left catch light)
  ctx.fillStyle = tankHi;
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 3.55, s * 2.2, s * 0.22, [s * 0.18, s * 0.18, 0, 0]);
  ctx.fill();
  // Tank shadow strip (bottom)
  ctx.fillStyle = tankDark;
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 2.97, s * 2.2, s * 0.22, [0, 0, s * 0.18, s * 0.18]);
  ctx.fill();
  // Tank band (strap ring)
  ctx.fillStyle = tankDark;
  ctx.fillRect(-s * 0.7, -s * 3.22, s * 2.2, s * 0.1);

  // Tank valve / pillar valve at top-right
  ctx.fillStyle = tankValve;
  ctx.beginPath();
  ctx.roundRect(s * 1.1, -s * 3.72, s * 0.38, s * 0.28, s * 0.06);
  ctx.fill();
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.arc(s * 1.3, -s * 3.72, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // ─── REGULATOR HOSE (tank valve → mouth) ─────────────────────────────────
  ctx.strokeStyle = hoseColor;
  ctx.lineWidth   = s * 0.18;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 1.4, -s * 3.6);
  ctx.bezierCurveTo(s * 2.0, -s * 3.2, s * 2.8, -s * 2.2, s * 3.1, -s * 1.1);
  ctx.bezierCurveTo(s * 3.2, -s * 0.7, s * 3.3, -s * 0.2, s * 3.5,  s * 0.5);
  ctx.stroke();
  // Second stage / reg body at mouth
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.roundRect(s * 3.3, s * 0.42, s * 0.5, s * 0.32, s * 0.08);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(s * 3.55, s * 0.72, s * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // ─── BODY / TORSO ─────────────────────────────────────────────────────────
  // Main wetsuit body — smooth bezier torpedo shape
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.moveTo(s * 3.6,  s * 0.1);
  ctx.bezierCurveTo(s * 3.2, -s * 0.6, s * 1.2, -s * 1.8, -s * 1.0, -s * 1.5);
  ctx.bezierCurveTo(-s * 2.2, -s * 1.3, -s * 2.8, -s * 0.8, -s * 2.8, -s * 0.05);
  ctx.bezierCurveTo(-s * 2.8,  s * 0.8, -s * 2.2,  s * 1.4, -s * 1.0,  s * 1.5);
  ctx.bezierCurveTo( s * 1.2,  s * 1.9,  s * 3.2,  s * 0.8,  s * 3.6,  s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Wetsuit panels — chest highlight
  ctx.fillStyle = suitLight;
  ctx.beginPath();
  ctx.ellipse(s * 0.6, -s * 0.7, s * 1.6, s * 0.5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Wetsuit seam lines
  ctx.strokeStyle = suitSeam;
  ctx.lineWidth   = s * 0.06;
  ctx.lineCap     = 'round';
  // Spine seam (along dorsal side)
  ctx.beginPath();
  ctx.moveTo(s * 3.2, -s * 0.35);
  ctx.bezierCurveTo(s * 1.0, -s * 1.6, -s * 1.5, -s * 1.4, -s * 2.6, -s * 0.5);
  ctx.stroke();
  // Side zip panel
  ctx.beginPath();
  ctx.moveTo(s * 1.8, -s * 1.55);
  ctx.bezierCurveTo(s * 1.2, -s * 0.6, s * 1.0,  s * 0.4, s * 1.4,  s * 1.3);
  ctx.stroke();

  // ─── BCD WINGS (inflatable bladder visible on sides) ──────────────────────
  ctx.fillStyle = bcdColor;
  ctx.beginPath();
  ctx.ellipse(s * 0.2, -s * 1.75, s * 0.9, s * 0.28, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // BCD shoulder strap
  ctx.strokeStyle = bcdColor;
  ctx.lineWidth   = s * 0.2;
  ctx.beginPath();
  ctx.moveTo(s * 0.6, -s * 1.55);
  ctx.bezierCurveTo(s * 1.4, -s * 1.35, s * 2.0, -s * 1.0, s * 2.4, -s * 0.55);
  ctx.stroke();
  // BCD chest strap buckle
  ctx.fillStyle = '#ccaa44';
  ctx.beginPath();
  ctx.roundRect(s * 1.8, -s * 0.62, s * 0.3, s * 0.18, s * 0.04);
  ctx.fill();

  // ─── BACK ARM (further from viewer — drawn before front arm) ──────────────
  ctx.fillStyle = suitSeam;
  ctx.beginPath();
  ctx.ellipse(s * 0.8, -s * 1.5 + armSwing * 0.5, s * 1.2, s * 0.38, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // ─── FRONT ARM (nearer viewer, below body) ────────────────────────────────
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.ellipse(s * 1.0,  s * 1.6 + armSwing, s * 1.35, s * 0.42, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = suitPanel;
  ctx.beginPath();
  ctx.ellipse(s * 0.4,  s * 1.55 + armSwing, s * 0.4, s * 0.3, 0.12, 0, Math.PI * 2);
  ctx.fill();
  // Glove
  ctx.fillStyle = gloveColor;
  ctx.beginPath();
  ctx.ellipse(s * 2.15, s * 1.75 + armSwing, s * 0.42, s * 0.28, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Finger detail
  ctx.strokeStyle = '#2a3a2a';
  ctx.lineWidth   = s * 0.05;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(s * (1.92 + i * 0.14), s * 1.62 + armSwing);
    ctx.lineTo(s * (1.92 + i * 0.14), s * 1.88 + armSwing);
    ctx.stroke();
  }

  // ─── HEAD ─────────────────────────────────────────────────────────────────
  // Neck
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(s * 3.0, s * 0.2, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hood (wetsuit hood covers most of head)
  ctx.fillStyle = suitMain;
  ctx.beginPath();
  ctx.arc(s * 3.4, -s * 0.15, s * 1.35, 0, Math.PI * 2);
  ctx.fill();
  // Hood seam
  ctx.strokeStyle = suitSeam;
  ctx.lineWidth   = s * 0.07;
  ctx.beginPath();
  ctx.arc(s * 3.4, -s * 0.15, s * 1.35, Math.PI * 0.55, Math.PI * 1.35);
  ctx.stroke();
  // Face skin visible below hood
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(s * 3.55, s * 0.25, s * 0.65, s * 0.55, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Chin shadow
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.ellipse(s * 3.7, s * 0.55, s * 0.35, s * 0.22, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // ─── MASK ─────────────────────────────────────────────────────────────────
  // Mask skirt (silicone — slightly lighter than frame)
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.roundRect(s * 3.85, -s * 1.05, s * 1.4, s * 1.65, s * 0.28);
  ctx.fill();
  // Mask frame
  ctx.fillStyle = maskFrame;
  ctx.beginPath();
  ctx.roundRect(s * 3.92, -s * 0.98, s * 1.26, s * 1.52, s * 0.22);
  ctx.fill();
  // Two lenses (twin-lens mask)
  const lensGrad = ctx.createLinearGradient(s * 4.0, -s * 0.85, s * 4.0, s * 0.35);
  lensGrad.addColorStop(0,   'rgba(80,200,240,0.95)');
  lensGrad.addColorStop(0.5, 'rgba(40,160,210,0.9)');
  lensGrad.addColorStop(1,   'rgba(20,110,160,0.85)');
  // Left lens
  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.roundRect(s * 3.97, -s * 0.92, s * 0.52, s * 1.1, s * 0.12);
  ctx.fill();
  // Right lens
  ctx.beginPath();
  ctx.roundRect(s * 4.56, -s * 0.92, s * 0.52, s * 1.1, s * 0.12);
  ctx.fill();
  // Nose piece divider between lenses
  ctx.fillStyle = maskFrame;
  ctx.fillRect(s * 4.48, -s * 0.85, s * 0.1, s * 0.95);
  // Lens reflections
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath();
  ctx.ellipse(s * 4.12, -s * 0.72, s * 0.1, s * 0.22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 4.70, -s * 0.72, s * 0.1, s * 0.22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Mask strap going around head
  ctx.strokeStyle = '#111';
  ctx.lineWidth   = s * 0.12;
  ctx.beginPath();
  ctx.moveTo(s * 3.92, -s * 0.4);
  ctx.bezierCurveTo(s * 3.6, -s * 0.6, s * 2.8, -s * 1.1, s * 2.4, -s * 1.0);
  ctx.stroke();

  // ─── OUTLINE / DEPTH ──────────────────────────────────────────────────────
  ctx.strokeStyle = outlineCol;
  ctx.lineWidth   = s * 0.09;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  // Body outline
  ctx.beginPath();
  ctx.moveTo(s * 3.6,  s * 0.1);
  ctx.bezierCurveTo(s * 3.2, -s * 0.6, s * 1.2, -s * 1.8, -s * 1.0, -s * 1.5);
  ctx.bezierCurveTo(-s * 2.2, -s * 1.3, -s * 2.8, -s * 0.8, -s * 2.8, -s * 0.05);
  ctx.bezierCurveTo(-s * 2.8,  s * 0.8, -s * 2.2,  s * 1.4, -s * 1.0,  s * 1.5);
  ctx.bezierCurveTo( s * 1.2,  s * 1.9,  s * 3.2,  s * 0.8,  s * 3.6,  s * 0.1);
  ctx.closePath();
  ctx.stroke();
  // Head outline
  ctx.beginPath();
  ctx.arc(s * 3.4, -s * 0.15, s * 1.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
