import theme from '../config/theme.json';

function fishColors(colorIndex, color) {
  const tc = theme.creatures?.fish;
  if (tc && colorIndex != null && colorIndex >= 0 && colorIndex < tc.colors.length) {
    return { main: tc.colors[colorIndex], dark: tc.darkColors[colorIndex], belly: tc.bellyColors[colorIndex] };
  }
  return { main: color, dark: color, belly: color };
}

// Draws a recognizable tropical fish using canvas paths
export function drawFish(ctx, x, y, color, size, direction, pixelSize, colorIndex) {
  const p = pixelSize ?? 2;
  const sc = (size ?? 6) * p * 0.9;
  const c = fishColors(colorIndex, color);

  ctx.save();
  ctx.translate(x, y);
  if (direction === -1) ctx.scale(-1, 1);

  // Tail fin (forked)
  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.moveTo(-sc * 0.9, 0);
  ctx.lineTo(-sc * 1.8, -sc * 0.7);
  ctx.lineTo(-sc * 1.5, 0);
  ctx.lineTo(-sc * 1.8, sc * 0.7);
  ctx.closePath();
  ctx.fill();

  // Body - main oval
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 0.9, sc * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly lighter
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(sc * 0.1, sc * 0.15, sc * 0.65, sc * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fin (top)
  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.moveTo(-sc * 0.2, -sc * 0.5);
  ctx.lineTo(sc * 0.1, -sc * 1.1);
  ctx.lineTo(sc * 0.6, -sc * 0.55);
  ctx.closePath();
  ctx.fill();

  // Pectoral fin
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.ellipse(sc * 0.2, sc * 0.1, sc * 0.3, sc * 0.18, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Stripe detail
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = sc * 0.08;
  ctx.beginPath();
  ctx.moveTo(sc * 0.3, -sc * 0.45);
  ctx.lineTo(sc * 0.3, sc * 0.45);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sc * 0.6, -sc * 0.1, sc * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(sc * 0.65, -sc * 0.1, sc * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // eye glare
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(sc * 0.6, -sc * 0.15, sc * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = sc * 0.07;
  ctx.beginPath();
  ctx.arc(sc * 0.88, sc * 0.05, sc * 0.12, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = sc * 0.07;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 0.9, sc * 0.55, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Sea turtle using canvas paths
export function drawTurtle(ctx, x, y, direction, frame, pixelSize) {
  const p = pixelSize ?? 2;
  const sc = p * 8;
  const c = theme.creatures.turtle;
  const flipAngle = frame === 1 ? 0.4 : -0.1;

  ctx.save();
  ctx.translate(x, y);
  if (direction === -1) ctx.scale(-1, 1);

  // Back flippers
  ctx.fillStyle = c.flipperColor;
  ctx.save();
  ctx.translate(-sc * 0.6, sc * 0.3);
  ctx.rotate(flipAngle + 0.3);
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.1, sc * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(-sc * 0.6, -sc * 0.3);
  ctx.rotate(-flipAngle - 0.3);
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.1, sc * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front flippers
  ctx.save();
  ctx.translate(sc * 0.5, sc * 0.5);
  ctx.rotate(flipAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.4, sc * 0.38, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(sc * 0.5, -sc * 0.5);
  ctx.rotate(-flipAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.4, sc * 0.38, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shell base
  ctx.fillStyle = c.shellColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.3, sc * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern - hexagonal scutes
  ctx.strokeStyle = c.shellPattern;
  ctx.lineWidth = sc * 0.12;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 0.55, sc * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-sc * 0.6, -sc * 0.4);
  ctx.lineTo(0, -sc * 0.8);
  ctx.lineTo(sc * 0.6, -sc * 0.4);
  ctx.moveTo(-sc * 0.6, sc * 0.4);
  ctx.lineTo(0, sc * 0.8);
  ctx.lineTo(sc * 0.6, sc * 0.4);
  ctx.stroke();

  // Shell highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(-sc * 0.2, -sc * 0.3, sc * 0.6, sc * 0.4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Shell outline
  ctx.strokeStyle = c.colorDark;
  ctx.lineWidth = sc * 0.15;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.3, sc * 1.0, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Head
  ctx.fillStyle = c.headColor;
  ctx.beginPath();
  ctx.ellipse(sc * 1.5, 0, sc * 0.55, sc * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.colorDark;
  ctx.lineWidth = sc * 0.12;
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sc * 1.75, -sc * 0.15, sc * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.eyeColor;
  ctx.beginPath();
  ctx.arc(sc * 1.78, -sc * 0.15, sc * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Jellyfish — translucent bell with flowing tentacles
export function drawJellyfish(ctx, x, y, phase, pixelSize) {
  const p = pixelSize ?? 2;
  const sc = p * 5;
  const c = theme.creatures.jellyfish ?? {};

  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(phase) * 0.12;
  const bellRx = sc * (1.1 + pulse);
  const bellRy = sc * (0.85 - pulse * 0.5);

  // Glow
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = c.glowColor ?? '#cc88ff';
  ctx.beginPath();
  ctx.arc(0, 0, sc * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Tentacles
  ctx.strokeStyle = c.tentacleColor ?? 'rgba(180,140,220,0.5)';
  ctx.lineWidth = sc * 0.08;
  ctx.lineCap = 'round';
  for (let i = -3; i <= 3; i++) {
    const tx = i * sc * 0.28;
    const drift = Math.sin(phase + i * 0.8) * sc * 0.3;
    ctx.beginPath();
    ctx.moveTo(tx, bellRy * 0.6);
    ctx.bezierCurveTo(tx + drift * 0.4, bellRy + sc * 1.0, tx - drift * 0.6, bellRy + sc * 1.8, tx + drift, bellRy + sc * 2.5);
    ctx.stroke();
  }

  // Oral arms (thicker, center)
  ctx.strokeStyle = c.armColor ?? 'rgba(200,160,240,0.6)';
  ctx.lineWidth = sc * 0.15;
  for (let i = -1; i <= 1; i++) {
    const tx = i * sc * 0.2;
    const drift = Math.sin(phase + i * 1.2) * sc * 0.25;
    ctx.beginPath();
    ctx.moveTo(tx, bellRy * 0.5);
    ctx.bezierCurveTo(tx + drift, bellRy + sc * 0.8, tx - drift * 0.5, bellRy + sc * 1.5, tx + drift * 0.3, bellRy + sc * 2.0);
    ctx.stroke();
  }

  // Bell
  ctx.globalAlpha = c.opacity ?? 0.65;
  ctx.fillStyle = c.bellColor ?? '#dda0ff';
  ctx.beginPath();
  ctx.ellipse(0, 0, bellRx, bellRy, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Bell highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-sc * 0.2, -sc * 0.2, bellRx * 0.45, bellRy * 0.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Bell rim (scalloped bottom edge)
  ctx.globalAlpha = (c.opacity ?? 0.65) + 0.15;
  ctx.fillStyle = c.rimColor ?? '#cc80ee';
  ctx.beginPath();
  ctx.ellipse(0, 0, bellRx, bellRy * 0.3, 0, 0, Math.PI);
  ctx.fill();

  // Inner markings
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = c.innerColor ?? '#bb66dd';
  ctx.lineWidth = sc * 0.06;
  for (let i = 0; i < 4; i++) {
    const r = bellRy * (0.3 + i * 0.15);
    ctx.beginPath();
    ctx.ellipse(0, -sc * 0.1, bellRx * (0.2 + i * 0.15), r * 0.4, 0, Math.PI + 0.3, -0.3);
    ctx.stroke();
  }

  ctx.restore();
}

// Manta ray — wide, flat, graceful glide
export function drawMantaRay(ctx, x, y, direction, phase, pixelSize) {
  const p = pixelSize ?? 2;
  const sc = p * 6;
  const c = theme.creatures.mantaRay ?? {};

  ctx.save();
  ctx.translate(x, y);
  if (direction === -1) ctx.scale(-1, 1);

  const wingFlap = Math.sin(phase) * 0.2;

  // Wings (pectoral fins) — the defining feature
  ctx.fillStyle = c.bodyColor ?? '#3a4a5a';
  ctx.beginPath();
  ctx.moveTo(sc * 1.5, 0);
  ctx.bezierCurveTo(sc * 1.0, -sc * 0.4, sc * 0.2, -sc * (1.8 + wingFlap), -sc * 1.5, -sc * (2.2 + wingFlap * 1.5));
  ctx.bezierCurveTo(-sc * 2.0, -sc * (1.8 + wingFlap), -sc * 2.5, -sc * 0.6, -sc * 2.5, 0);
  ctx.bezierCurveTo(-sc * 2.5, sc * 0.6, -sc * 2.0, sc * (1.8 - wingFlap), -sc * 1.5, sc * (2.2 - wingFlap * 1.5));
  ctx.bezierCurveTo(sc * 0.2, sc * (1.8 - wingFlap), sc * 1.0, sc * 0.4, sc * 1.5, 0);
  ctx.closePath();
  ctx.fill();

  // Belly (lighter underside, center stripe)
  ctx.fillStyle = c.bellyColor ?? '#8899aa';
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 1.2, sc * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail — long, thin, trailing behind
  ctx.strokeStyle = c.tailColor ?? '#2a3a4a';
  ctx.lineWidth = sc * 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-sc * 2.3, 0);
  ctx.bezierCurveTo(-sc * 3.0, Math.sin(phase * 0.7) * sc * 0.3, -sc * 4.0, Math.sin(phase * 0.5) * sc * 0.2, -sc * 4.5, 0);
  ctx.stroke();

  // Cephalic fins (horn-like flaps at the front)
  ctx.fillStyle = c.bodyColor ?? '#3a4a5a';
  ctx.beginPath();
  ctx.moveTo(sc * 1.3, -sc * 0.25);
  ctx.lineTo(sc * 2.3, -sc * 0.55);
  ctx.lineTo(sc * 1.8, -sc * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sc * 1.3, sc * 0.25);
  ctx.lineTo(sc * 2.3, sc * 0.55);
  ctx.lineTo(sc * 1.8, sc * 0.1);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sc * 1.0, -sc * 0.45, sc * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.arc(sc * 1.0, sc * 0.45, sc * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(sc * 1.03, -sc * 0.45, sc * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.arc(sc * 1.03, sc * 0.45, sc * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Wing markings
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = sc * 0.08;
  ctx.beginPath();
  ctx.ellipse(-sc * 0.3, -sc * 0.8, sc * 0.8, sc * 0.3, -0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-sc * 0.3, sc * 0.8, sc * 0.8, sc * 0.3, 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = sc * 0.08;
  ctx.beginPath();
  ctx.moveTo(sc * 1.5, 0);
  ctx.bezierCurveTo(sc * 1.0, -sc * 0.4, sc * 0.2, -sc * (1.8 + wingFlap), -sc * 1.5, -sc * (2.2 + wingFlap * 1.5));
  ctx.bezierCurveTo(-sc * 2.0, -sc * (1.8 + wingFlap), -sc * 2.5, -sc * 0.6, -sc * 2.5, 0);
  ctx.bezierCurveTo(-sc * 2.5, sc * 0.6, -sc * 2.0, sc * (1.8 - wingFlap), -sc * 1.5, sc * (2.2 - wingFlap * 1.5));
  ctx.bezierCurveTo(sc * 0.2, sc * (1.8 - wingFlap), sc * 1.0, sc * 0.4, sc * 1.5, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

// Shark using canvas paths - big, aggressive, open jaw
export function drawShark(ctx, x, y, direction, pixelSize) {
  const p = pixelSize ?? 2;
  const sc = p * 10;
  const c = theme.creatures.shark;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = c.opacity ?? 0.92;
  if (direction === -1) ctx.scale(-1, 1);

  const bodyColor  = c.color    ?? '#4a5f72';
  const darkColor  = c.colorDark ?? '#354555';
  const bellyColor = c.belly    ?? '#ccdce8';

  // ── TAIL (draw first so body overlaps it) ───────────────────────────────
  // Upper lobe — larger, classic crescent shape
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(-sc * 4.0, -sc * 0.05);
  ctx.bezierCurveTo(-sc * 4.6, -sc * 0.8, -sc * 5.8, -sc * 2.0, -sc * 6.5, -sc * 2.4);
  ctx.bezierCurveTo(-sc * 6.2, -sc * 1.8, -sc * 5.6, -sc * 0.8, -sc * 4.8, -sc * 0.1);
  ctx.closePath();
  ctx.fill();
  // Lower lobe — slightly smaller
  ctx.beginPath();
  ctx.moveTo(-sc * 4.0, sc * 0.05);
  ctx.bezierCurveTo(-sc * 4.6, sc * 0.6, -sc * 5.6, sc * 1.6, -sc * 6.2, sc * 1.9);
  ctx.bezierCurveTo(-sc * 5.9, sc * 1.3, -sc * 5.2, sc * 0.6, -sc * 4.8, sc * 0.1);
  ctx.closePath();
  ctx.fill();

  // ── MAIN BODY ────────────────────────────────────────────────────────────
  // Full silhouette — one smooth closed path
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  // Start at snout top
  ctx.moveTo(sc * 4.8, -sc * 0.3);
  // Dorsal ridge back to tail
  ctx.bezierCurveTo(sc * 3.5, -sc * 1.5, sc * 0.5, -sc * 1.7, -sc * 2.0, -sc * 1.1);
  ctx.bezierCurveTo(-sc * 3.4, -sc * 0.7, -sc * 4.2, -sc * 0.3, -sc * 4.8, -sc * 0.05);
  // Tail peduncle to belly back
  ctx.bezierCurveTo(-sc * 4.2, sc * 0.2, -sc * 3.4, sc * 0.5, -sc * 2.0, sc * 0.95);
  // Belly forward to jaw
  ctx.bezierCurveTo(sc * 0.5, sc * 1.55, sc * 3.2, sc * 1.3, sc * 4.4, sc * 0.55);
  // Snout bottom back to start
  ctx.bezierCurveTo(sc * 4.8, sc * 0.35, sc * 5.0, sc * 0.05, sc * 4.8, -sc * 0.3);
  ctx.closePath();
  ctx.fill();

  // ── COUNTER-SHADING (white belly) ────────────────────────────────────────
  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.moveTo(sc * 4.2, sc * 0.3);
  ctx.bezierCurveTo(sc * 3.0, sc * 0.85, sc * 0.5, sc * 1.1, -sc * 2.0, sc * 0.75);
  ctx.bezierCurveTo(-sc * 3.5, sc * 0.45, -sc * 4.4, sc * 0.15, -sc * 4.8, -sc * 0.05);
  ctx.bezierCurveTo(-sc * 4.4, -sc * 0.05, -sc * 3.5, sc * 0.05, -sc * 2.0, sc * 0.15);
  ctx.bezierCurveTo(sc * 0.5, sc * 0.25, sc * 3.0, sc * 0.2, sc * 4.2, sc * 0.3);
  ctx.closePath();
  ctx.fill();

  // Subtle dorsal shading — darker stripe along the top
  ctx.save();
  const dorsalGrad = ctx.createLinearGradient(0, -sc * 1.7, 0, -sc * 0.3);
  dorsalGrad.addColorStop(0, 'rgba(30,45,60,0.55)');
  dorsalGrad.addColorStop(1, 'rgba(30,45,60,0)');
  ctx.fillStyle = dorsalGrad;
  ctx.beginPath();
  ctx.moveTo(sc * 4.8, -sc * 0.3);
  ctx.bezierCurveTo(sc * 3.5, -sc * 1.5, sc * 0.5, -sc * 1.7, -sc * 2.0, -sc * 1.1);
  ctx.bezierCurveTo(-sc * 3.4, -sc * 0.7, -sc * 4.8, -sc * 0.05, -sc * 4.8, -sc * 0.05);
  ctx.bezierCurveTo(-sc * 3.4, sc * 0.0, sc * 0.5, sc * 0.05, sc * 4.8, -sc * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── OPEN MOUTH ───────────────────────────────────────────────────────────
  // Upper jaw plate
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(sc * 4.8, -sc * 0.3);
  ctx.bezierCurveTo(sc * 5.5, -sc * 0.2, sc * 5.7, sc * 0.1, sc * 5.5, sc * 0.35);
  ctx.bezierCurveTo(sc * 5.2, sc * 0.25, sc * 5.0, sc * 0.1, sc * 4.8, -sc * 0.3);
  ctx.closePath();
  ctx.fill();

  // Lower jaw — dropped open
  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.moveTo(sc * 4.4, sc * 0.55);
  ctx.bezierCurveTo(sc * 4.8, sc * 0.6, sc * 5.5, sc * 0.55, sc * 5.5, sc * 0.35);
  ctx.bezierCurveTo(sc * 5.5, sc * 0.9, sc * 5.0, sc * 1.2, sc * 4.2, sc * 1.15);
  ctx.bezierCurveTo(sc * 3.8, sc * 1.1, sc * 4.0, sc * 0.8, sc * 4.4, sc * 0.55);
  ctx.closePath();
  ctx.fill();

  // Mouth cavity — deep dark red-black
  ctx.fillStyle = '#1a0505';
  ctx.beginPath();
  ctx.moveTo(sc * 4.8, sc * 0.05);
  ctx.bezierCurveTo(sc * 5.3, sc * 0.1, sc * 5.5, sc * 0.35, sc * 5.3, sc * 0.6);
  ctx.bezierCurveTo(sc * 5.0, sc * 0.85, sc * 4.6, sc * 0.9, sc * 4.3, sc * 0.85);
  ctx.bezierCurveTo(sc * 4.0, sc * 0.7, sc * 4.6, sc * 0.25, sc * 4.8, sc * 0.05);
  ctx.closePath();
  ctx.fill();

  // Gum line — pink
  ctx.fillStyle = 'rgba(200,100,100,0.7)';
  ctx.beginPath();
  ctx.ellipse(sc * 5.0, sc * 0.32, sc * 0.32, sc * 0.12, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Upper teeth (4, triangular, slightly varied sizes)
  ctx.fillStyle = '#f5f5f5';
  const upperTeeth = [
    { x: sc * 4.88, h: sc * 0.38, w: sc * 0.095 },
    { x: sc * 5.10, h: sc * 0.30, w: sc * 0.085 },
    { x: sc * 5.28, h: sc * 0.22, w: sc * 0.075 },
    { x: sc * 5.42, h: sc * 0.14, w: sc * 0.06  },
  ];
  for (const t of upperTeeth) {
    ctx.beginPath();
    ctx.moveTo(t.x - t.w, sc * 0.06);
    ctx.lineTo(t.x, sc * 0.06 + t.h);
    ctx.lineTo(t.x + t.w, sc * 0.06);
    ctx.closePath();
    ctx.fill();
  }
  // Lower teeth (3, pointing up)
  const lowerTeeth = [
    { x: sc * 4.92, h: sc * 0.28, w: sc * 0.08 },
    { x: sc * 5.14, h: sc * 0.22, w: sc * 0.07 },
    { x: sc * 5.32, h: sc * 0.16, w: sc * 0.06 },
  ];
  for (const t of lowerTeeth) {
    ctx.beginPath();
    ctx.moveTo(t.x - t.w, sc * 0.88);
    ctx.lineTo(t.x, sc * 0.88 - t.h);
    ctx.lineTo(t.x + t.w, sc * 0.88);
    ctx.closePath();
    ctx.fill();
  }

  // ── DORSAL FIN ───────────────────────────────────────────────────────────
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(sc * 0.5, -sc * 1.6);   // base front
  ctx.bezierCurveTo(sc * 0.8, -sc * 2.2, sc * 1.2, -sc * 3.8, sc * 1.6, -sc * 4.2); // tip
  ctx.bezierCurveTo(sc * 2.2, -sc * 3.4, sc * 2.8, -sc * 2.2, sc * 3.0, -sc * 1.6); // trailing edge sweeps back
  ctx.bezierCurveTo(sc * 2.2, -sc * 1.45, sc * 1.2, -sc * 1.45, sc * 0.5, -sc * 1.6);
  ctx.closePath();
  ctx.fill();
  // Fin highlight — lighter leading edge
  ctx.strokeStyle = 'rgba(90,115,140,0.5)';
  ctx.lineWidth = sc * 0.08;
  ctx.beginPath();
  ctx.moveTo(sc * 0.5, -sc * 1.6);
  ctx.bezierCurveTo(sc * 0.8, -sc * 2.2, sc * 1.2, -sc * 3.8, sc * 1.6, -sc * 4.2);
  ctx.stroke();

  // ── PECTORAL FIN ─────────────────────────────────────────────────────────
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(sc * 1.2, sc * 0.7);    // root front
  ctx.bezierCurveTo(sc * 1.0, sc * 1.4, sc * 0.4, sc * 2.8, sc * 1.2, sc * 3.0);
  ctx.bezierCurveTo(sc * 2.2, sc * 2.9, sc * 3.2, sc * 2.0, sc * 3.0, sc * 1.1);
  ctx.bezierCurveTo(sc * 2.6, sc * 0.85, sc * 1.8, sc * 0.75, sc * 1.2, sc * 0.7);
  ctx.closePath();
  ctx.fill();

  // ── SECOND DORSAL ────────────────────────────────────────────────────────
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(-sc * 1.8, -sc * 1.0);
  ctx.bezierCurveTo(-sc * 1.5, -sc * 1.7, -sc * 1.1, -sc * 1.8, -sc * 0.8, -sc * 1.0);
  ctx.bezierCurveTo(-sc * 1.1, -sc * 0.9, -sc * 1.5, -sc * 0.9, -sc * 1.8, -sc * 1.0);
  ctx.closePath();
  ctx.fill();

  // Anal fin (small, under belly near tail)
  ctx.beginPath();
  ctx.moveTo(-sc * 1.8, sc * 0.7);
  ctx.bezierCurveTo(-sc * 1.5, sc * 1.3, -sc * 1.1, sc * 1.4, -sc * 0.8, sc * 0.8);
  ctx.bezierCurveTo(-sc * 1.1, sc * 0.75, -sc * 1.5, sc * 0.72, -sc * 1.8, sc * 0.7);
  ctx.closePath();
  ctx.fill();

  // ── GILL SLITS ───────────────────────────────────────────────────────────
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = sc * 0.09;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const gx = sc * (2.8 - i * 0.42);
    const curve = sc * 0.08;
    ctx.beginPath();
    ctx.moveTo(gx, -sc * 0.62);
    ctx.bezierCurveTo(gx - curve, -sc * 0.1, gx - curve, sc * 0.2, gx + sc * 0.02, sc * 0.48);
    ctx.stroke();
  }

  // ── EYE ──────────────────────────────────────────────────────────────────
  // Outer socket (slightly darker skin)
  ctx.fillStyle = 'rgba(30,40,55,0.6)';
  ctx.beginPath();
  ctx.ellipse(sc * 3.6, -sc * 0.5, sc * 0.42, sc * 0.36, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Iris — dead black
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(sc * 3.6, -sc * 0.5, sc * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Nictitating membrane sliver (whites of eyes, barely showing — sinister)
  ctx.fillStyle = 'rgba(240,240,240,0.45)';
  ctx.beginPath();
  ctx.ellipse(sc * 3.6, -sc * 0.62, sc * 0.22, sc * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── BODY OUTLINE ─────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(20,35,50,0.4)';
  ctx.lineWidth = sc * 0.09;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sc * 4.8, -sc * 0.3);
  ctx.bezierCurveTo(sc * 3.5, -sc * 1.5, sc * 0.5, -sc * 1.7, -sc * 2.0, -sc * 1.1);
  ctx.bezierCurveTo(-sc * 3.4, -sc * 0.7, -sc * 4.2, -sc * 0.3, -sc * 4.8, -sc * 0.05);
  ctx.bezierCurveTo(-sc * 4.2, sc * 0.2, -sc * 3.4, sc * 0.5, -sc * 2.0, sc * 0.95);
  ctx.bezierCurveTo(sc * 0.5, sc * 1.55, sc * 3.2, sc * 1.3, sc * 4.4, sc * 0.55);
  ctx.stroke();

  ctx.restore();
}

/**
 * Returns the world-space mouth hitbox for a shark creature object.
 * The hitbox is a small circle centred on the open mouth cavity.
 * pixelSize must match what drawShark uses.
 */
export function getSharkMouthHitbox(creature, pixelSize) {
  const p = pixelSize ?? 2;
  const sc = p * 10;
  // Mouth cavity is centred around local (sc*5.05, sc*0.45)
  // direction=1 → mouth is to the right (positive x offset)
  // direction=-1 → flipped, mouth is to the left
  const localMouthX = sc * 5.05;
  const localMouthY = sc * 0.45;
  const worldMouthX = creature.direction === -1
    ? creature.x - localMouthX
    : creature.x + localMouthX;
  const worldMouthY = creature.y + localMouthY;
  const radius = sc * 0.38; // small — only the cavity itself
  return { x: worldMouthX, y: worldMouthY, r: radius };
}
