import theme from '../config/theme.json';

// Lobster - side-facing view, iconic silhouette
// Faces right, with big claws forward, segmented tail curling back
export function drawLobster(ctx, x, y, discovered, frame, glowPhase, pixelSize, direction, noGlow) {
  const p = pixelSize ?? theme.pixelSize ?? 2;
  const sc = p * 5; // larger base unit for better visibility
  const c = theme.lobster;

  ctx.save();
  ctx.translate(x, y);
  // Mirror to match diver direction (default faces right = direction 1)
  if (direction === -1) ctx.scale(-1, 1);

  if (discovered) {
    ctx.scale(0.75, 0.75);
  } else if (!noGlow) {
    const glowAlpha = 0.22 + 0.18 * Math.sin(glowPhase * Math.PI * 2);
    ctx.fillStyle = c.glowColor;
    ctx.globalAlpha = glowAlpha;
    ctx.beginPath();
    ctx.arc(0, 0, sc * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const clawOpen = frame === 1;
  const legWave = frame === 1 ? 1 : -1;

  // ── ANTENNAE (long, sweeping forward) ──
  ctx.strokeStyle = c.antennaeColor ?? '#aa2200';
  ctx.lineWidth = sc * 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sc * 1.2, -sc * 1.2);
  ctx.bezierCurveTo(sc * 2.5, -sc * 2.0, sc * 4.0, -sc * 2.8, sc * 5.5, -sc * 2.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sc * 1.0, -sc * 0.9);
  ctx.bezierCurveTo(sc * 2.2, -sc * 1.2, sc * 3.5, -sc * 1.0, sc * 5.0, -sc * 0.5);
  ctx.stroke();
  // short antennules
  ctx.lineWidth = sc * 0.08;
  ctx.beginPath();
  ctx.moveTo(sc * 1.1, -sc * 1.0);
  ctx.lineTo(sc * 2.2, -sc * 1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sc * 1.0, -sc * 0.8);
  ctx.lineTo(sc * 2.0, -sc * 0.6);
  ctx.stroke();

  // ── TAIL SEGMENTS (curling left/back) ──
  // Draw 5 tail segments getting smaller, curling slightly upward
  const tailSegs = [
    { x: -sc * 0.5, y: sc * 0.2, rx: sc * 0.85, ry: sc * 0.65 },
    { x: -sc * 1.5, y: sc * 0.1, rx: sc * 0.75, ry: sc * 0.58 },
    { x: -sc * 2.4, y: -sc * 0.1, rx: sc * 0.65, ry: sc * 0.5 },
    { x: -sc * 3.2, y: -sc * 0.35, rx: sc * 0.55, ry: sc * 0.42 },
    { x: -sc * 3.9, y: -sc * 0.65, rx: sc * 0.45, ry: sc * 0.35 },
  ];
  for (let i = tailSegs.length - 1; i >= 0; i--) {
    const seg = tailSegs[i];
    ctx.fillStyle = i % 2 === 0 ? c.shellColor : c.shellLight;
    ctx.beginPath();
    ctx.ellipse(seg.x, seg.y, seg.rx, seg.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.outline ?? '#880000';
    ctx.lineWidth = sc * 0.1;
    ctx.stroke();
  }

  // Tail fan (uropods) at the end
  const tfx = -sc * 4.3;
  const tfy = -sc * 0.9;
  ctx.fillStyle = c.shellDark ?? '#991a1a';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(tfx, tfy);
    ctx.rotate(i * 0.28 - 0.2);
    ctx.beginPath();
    ctx.ellipse(-sc * 0.6, 0, sc * 0.9, sc * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.outline ?? '#880000';
    ctx.lineWidth = sc * 0.08;
    ctx.stroke();
    ctx.restore();
  }

  // ── WALKING LEGS (5 pairs, along underside) ──
  ctx.strokeStyle = c.legColor ?? '#cc3300';
  ctx.lineWidth = sc * 0.18;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const lx = sc * 0.8 - i * sc * 0.7;
    const ly = sc * 0.5;
    const wave = legWave * (i % 2 === 0 ? 0.25 : -0.25);
    // upper segment
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx - sc * 0.2, ly + sc * 0.8 + wave * sc);
    ctx.stroke();
    // lower segment (knee bend)
    ctx.beginPath();
    ctx.moveTo(lx - sc * 0.2, ly + sc * 0.8 + wave * sc);
    ctx.lineTo(lx + sc * 0.1, ly + sc * 1.5);
    ctx.stroke();
  }

  // ── CARAPACE (main body shell) ──
  ctx.fillStyle = c.shellColor ?? '#dd3300';
  ctx.beginPath();
  ctx.ellipse(sc * 0.3, -sc * 0.1, sc * 1.5, sc * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.lineWidth = sc * 0.14;
  ctx.stroke();
  // Carapace highlight
  ctx.fillStyle = 'rgba(255,160,120,0.4)';
  ctx.beginPath();
  ctx.ellipse(sc * 0.0, -sc * 0.4, sc * 0.8, sc * 0.38, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Rostrum (pointed spike on top-front)
  ctx.fillStyle = c.shellDark ?? '#991a1a';
  ctx.beginPath();
  ctx.moveTo(sc * 1.5, -sc * 0.1);
  ctx.lineTo(sc * 2.4, -sc * 0.7);
  ctx.lineTo(sc * 1.6, sc * 0.2);
  ctx.closePath();
  ctx.fill();

  // ── BIG CLAWS (chelipeds) - the defining feature ──
  // Right claw (upper, reaching forward)
  ctx.save();
  ctx.translate(sc * 2.0, -sc * 0.3);
  ctx.rotate(-0.25);
  // arm segment
  ctx.fillStyle = c.clawColor ?? '#cc2200';
  ctx.beginPath();
  ctx.ellipse(sc * 0.5, 0, sc * 0.7, sc * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.lineWidth = sc * 0.1;
  ctx.stroke();
  // claw body (merus)
  ctx.fillStyle = c.clawColor ?? '#cc2200';
  ctx.beginPath();
  ctx.ellipse(sc * 1.5, 0, sc * 1.1, sc * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.stroke();
  // claw highlight
  ctx.fillStyle = 'rgba(255,140,100,0.35)';
  ctx.beginPath();
  ctx.ellipse(sc * 1.3, -sc * 0.2, sc * 0.6, sc * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // upper pincer (dactylus)
  ctx.fillStyle = c.clawDark ?? '#aa1100';
  ctx.beginPath();
  ctx.moveTo(sc * 2.4, -sc * 0.15);
  ctx.lineTo(sc * 3.6, clawOpen ? -sc * 0.9 : -sc * 0.35);
  ctx.lineTo(sc * 3.3, clawOpen ? -sc * 0.55 : -sc * 0.1);
  ctx.lineTo(sc * 2.2, -sc * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.lineWidth = sc * 0.09;
  ctx.stroke();
  // lower pincer (propodus finger)
  ctx.fillStyle = c.shellColor ?? '#dd3300';
  ctx.beginPath();
  ctx.moveTo(sc * 2.4, sc * 0.15);
  ctx.lineTo(sc * 3.5, clawOpen ? sc * 0.6 : sc * 0.3);
  ctx.lineTo(sc * 3.2, clawOpen ? sc * 0.35 : sc * 0.1);
  ctx.lineTo(sc * 2.2, sc * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.stroke();
  ctx.restore();

  // Left claw (lower, slightly behind)
  ctx.save();
  ctx.translate(sc * 1.6, sc * 0.5);
  ctx.rotate(0.3);
  ctx.fillStyle = c.clawColor ?? '#cc2200';
  ctx.beginPath();
  ctx.ellipse(sc * 0.5, 0, sc * 0.65, sc * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.lineWidth = sc * 0.1;
  ctx.stroke();
  ctx.fillStyle = c.clawColor ?? '#cc2200';
  ctx.beginPath();
  ctx.ellipse(sc * 1.5, 0, sc * 1.0, sc * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.stroke();
  ctx.fillStyle = c.clawDark ?? '#aa1100';
  ctx.beginPath();
  ctx.moveTo(sc * 2.3, -sc * 0.12);
  ctx.lineTo(sc * 3.3, clawOpen ? -sc * 0.75 : -sc * 0.28);
  ctx.lineTo(sc * 3.0, clawOpen ? -sc * 0.45 : -sc * 0.08);
  ctx.lineTo(sc * 2.1, -sc * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.lineWidth = sc * 0.09;
  ctx.stroke();
  ctx.fillStyle = c.shellColor ?? '#dd3300';
  ctx.beginPath();
  ctx.moveTo(sc * 2.3, sc * 0.12);
  ctx.lineTo(sc * 3.2, clawOpen ? sc * 0.5 : sc * 0.25);
  ctx.lineTo(sc * 2.9, clawOpen ? sc * 0.28 : sc * 0.08);
  ctx.lineTo(sc * 2.1, sc * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.outline ?? '#880000';
  ctx.stroke();
  ctx.restore();

  // ── EYES ON STALKS ──
  // Eye stalks
  ctx.fillStyle = c.shellDark ?? '#991a1a';
  ctx.beginPath();
  ctx.ellipse(sc * 1.3, -sc * 0.85, sc * 0.12, sc * 0.35, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sc * 1.55, -sc * 0.8, sc * 0.12, sc * 0.32, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Eye balls
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(sc * 1.2, -sc * 1.15, sc * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sc * 1.55, -sc * 1.1, sc * 0.22, 0, Math.PI * 2);
  ctx.fill();
  // Eye glare
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(sc * 1.14, -sc * 1.2, sc * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sc * 1.49, -sc * 1.15, sc * 0.09, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
