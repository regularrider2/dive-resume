import theme from '../config/theme.json';

const GLOW_COLOR = theme.colors.treasureGlow ?? '#ffdd44';

function applyGlow(ctx, discovered, glowPhase, radius) {
  if (discovered) {
    ctx.globalAlpha = 0.4;
  } else {
    const a = 0.22 + 0.18 * Math.sin(glowPhase * Math.PI * 2);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = GLOW_COLOR;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// === 1. MESSAGE IN A BOTTLE ===
function drawBottle(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);
  ctx.rotate(-0.2);

  // Bottle body
  ctx.fillStyle = 'rgba(110, 190, 150, 0.7)';
  ctx.beginPath();
  ctx.roundRect(-sc * 2, -sc * 1.5, sc * 4, sc * 3, sc * 0.8);
  ctx.fill();
  // Glass highlight
  ctx.fillStyle = 'rgba(190, 245, 220, 0.4)';
  ctx.beginPath();
  ctx.roundRect(-sc * 1.5, -sc * 1.2, sc * 1, sc * 2.4, sc * 0.3);
  ctx.fill();
  // Neck
  ctx.fillStyle = 'rgba(110, 190, 150, 0.7)';
  ctx.beginPath();
  ctx.roundRect(-sc * 0.6, -sc * 3.5, sc * 1.2, sc * 2.2, sc * 0.3);
  ctx.fill();
  // Cork
  ctx.fillStyle = '#c4956a';
  ctx.beginPath();
  ctx.roundRect(-sc * 0.45, -sc * 4.2, sc * 0.9, sc * 1, sc * 0.2);
  ctx.fill();
  ctx.fillStyle = '#a87850';
  ctx.fillRect(-sc * 0.45, -sc * 3.8, sc * 0.9, sc * 0.12);
  ctx.fillRect(-sc * 0.45, -sc * 3.5, sc * 0.9, sc * 0.12);
  // Paper inside
  ctx.fillStyle = '#f5e6c8';
  ctx.beginPath();
  ctx.roundRect(-sc * 1.2, -sc * 0.8, sc * 2.4, sc * 1.6, sc * 0.15);
  ctx.fill();
  ctx.fillStyle = '#e0cfb0';
  ctx.fillRect(-sc * 1.0, -sc * 0.8, sc * 2.0, sc * 0.25);
  // Outline
  ctx.strokeStyle = 'rgba(70, 140, 110, 0.8)';
  ctx.lineWidth = sc * 0.15;
  ctx.beginPath();
  ctx.roundRect(-sc * 2, -sc * 1.5, sc * 4, sc * 3, sc * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-sc * 0.6, -sc * 3.5, sc * 1.2, sc * 2.2, sc * 0.3);
  ctx.stroke();
}

// === 2. ECHO SHOW ===
function drawEchoShow(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  // Device body
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.roundRect(-sc * 3.5, -sc * 2.5, sc * 7, sc * 5, sc * 0.5);
  ctx.fill();
  // Screen
  ctx.fillStyle = '#0a0a1a';
  ctx.beginPath();
  ctx.roundRect(-sc * 3, -sc * 2, sc * 6, sc * 4, sc * 0.3);
  ctx.fill();
  // Alexa blue screen glow
  ctx.save();
  ctx.globalAlpha = discovered ? 0.15 : 0.3;
  ctx.fillStyle = '#31d8ff';
  ctx.beginPath();
  ctx.roundRect(-sc * 3, -sc * 2, sc * 6, sc * 4, sc * 0.3);
  ctx.fill();
  ctx.restore();
  if (discovered) ctx.globalAlpha = 0.4;
  // Alexa blue light bar at bottom of screen
  const grad = ctx.createLinearGradient(-sc * 2.5, 0, sc * 2.5, 0);
  grad.addColorStop(0, 'rgba(49, 216, 255, 0)');
  grad.addColorStop(0.3, 'rgba(49, 216, 255, 0.9)');
  grad.addColorStop(0.5, 'rgba(100, 230, 255, 1)');
  grad.addColorStop(0.7, 'rgba(49, 216, 255, 0.9)');
  grad.addColorStop(1, 'rgba(49, 216, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-sc * 2.5, sc * 1.2, sc * 5, sc * 0.5, sc * 0.2);
  ctx.fill();
  // "alexa" text on screen
  ctx.fillStyle = '#88ddff';
  ctx.font = `bold ${sc * 1.1}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('alexa', 0, -sc * 0.2);
  // Outline
  ctx.strokeStyle = '#333355';
  ctx.lineWidth = sc * 0.18;
  ctx.beginPath();
  ctx.roundRect(-sc * 3.5, -sc * 2.5, sc * 7, sc * 5, sc * 0.5);
  ctx.stroke();
}

// === 3. RING DOORBELL ===
function drawRingDoorbell(ctx, sc, discovered, glowPhase, ts) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  // Ring Video Doorbell — two-tone: black top (camera), silver bottom (button)
  const W  = sc * 4.0;
  const H  = sc * 7.8;
  const bx = -W / 2;
  const by = -H / 2;
  const R  = sc * 0.75; // corner radius

  // Drop shadow
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.roundRect(bx + sc * 0.35, by + sc * 0.45, W, H, R);
  ctx.fill();
  ctx.restore();

  // Outer bezel — thin dark border
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.roundRect(bx - sc * 0.12, by - sc * 0.12, W + sc * 0.24, H + sc * 0.24, R + sc * 0.12);
  ctx.fill();

  // ── TOP SECTION: black camera housing (~42% of height) ──
  const topH = H * 0.42;
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(bx, by, W, topH + R, [R, R, 0, 0]);
  ctx.fill();

  // ── BOTTOM SECTION: satin silver (~58% of height) ──
  const botY = by + topH;
  const botH = H - topH;
  const silverGrad = ctx.createLinearGradient(bx, botY, bx + W, botY);
  silverGrad.addColorStop(0,    '#b0b0b0');
  silverGrad.addColorStop(0.15, '#d8d8d8');
  silverGrad.addColorStop(0.5,  '#e8e8e8');
  silverGrad.addColorStop(0.85, '#c8c8c8');
  silverGrad.addColorStop(1,    '#a0a0a0');
  ctx.fillStyle = silverGrad;
  ctx.beginPath();
  ctx.roundRect(bx, botY, W, botH, [0, 0, R, R]);
  ctx.fill();

  // Seam line between black and silver
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = sc * 0.18;
  ctx.beginPath();
  ctx.moveTo(bx, botY);
  ctx.lineTo(bx + W, botY);
  ctx.stroke();

  // ── CAMERA LENS — centered in black top section ──
  const lensY = by + topH * 0.52;

  // Outer lens housing ring
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(0, lensY, sc * 1.05, 0, Math.PI * 2);
  ctx.fill();

  // Dark grey inner ring
  ctx.fillStyle = '#1e1e1e';
  ctx.beginPath();
  ctx.arc(0, lensY, sc * 0.88, 0, Math.PI * 2);
  ctx.fill();

  // Lens glass — dark blue-black with radial gradient
  const lensGrad = ctx.createRadialGradient(-sc * 0.22, lensY - sc * 0.22, 0, 0, lensY, sc * 0.72);
  lensGrad.addColorStop(0,   '#1e3a5a');
  lensGrad.addColorStop(0.5, '#0d1e30');
  lensGrad.addColorStop(1,   '#050c14');
  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.arc(0, lensY, sc * 0.72, 0, Math.PI * 2);
  ctx.fill();

  // Lens inner barrel
  ctx.fillStyle = '#08121c';
  ctx.beginPath();
  ctx.arc(0, lensY, sc * 0.44, 0, Math.PI * 2);
  ctx.fill();

  // Lens reflection — small bright arc top-left
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.beginPath();
  ctx.ellipse(-sc * 0.22, lensY - sc * 0.26, sc * 0.2, sc * 0.1, -0.6, 0, Math.PI * 2);
  ctx.fill();

  // Small dot LED top-right of camera (blinking)
  const ledOn = Math.sin((ts ?? 0) * 0.005) > 0;
  ctx.save();
  ctx.fillStyle = '#1db8ff';
  ctx.globalAlpha = ledOn ? 0.95 : 0.25;
  ctx.beginPath();
  ctx.arc(sc * 1.3, by + sc * 0.55, sc * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── BUTTON — large circle centered in silver section ──
  const btnY = botY + botH * 0.42;
  const btnR = sc * 1.1;

  // Button base — slightly recessed silver circle
  ctx.fillStyle = '#c8c8c8';
  ctx.beginPath();
  ctx.arc(0, btnY, btnR, 0, Math.PI * 2);
  ctx.fill();

  // Button face — lighter center
  const btnGrad = ctx.createRadialGradient(-sc * 0.2, btnY - sc * 0.2, 0, 0, btnY, btnR);
  btnGrad.addColorStop(0,   '#f0f0f0');
  btnGrad.addColorStop(0.6, '#e0e0e0');
  btnGrad.addColorStop(1,   '#c0c0c0');
  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.arc(0, btnY, btnR * 0.88, 0, Math.PI * 2);
  ctx.fill();

  // THE Ring blue light — glowing circle around button
  const ringPulse = 0.7 + 0.3 * Math.sin((ts ?? 0) * 0.004);
  ctx.save();
  ctx.globalAlpha = ringPulse;
  ctx.strokeStyle = '#1db8ff';
  ctx.lineWidth = sc * 0.28;
  ctx.shadowColor = '#1db8ff';
  ctx.shadowBlur = sc * 1.5;
  ctx.beginPath();
  ctx.arc(0, btnY, btnR * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // "ring" text label at bottom of silver section
  ctx.fillStyle = '#555555';
  ctx.font = `italic bold ${sc * 0.7}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ring', 0, botY + botH * 0.85);

  // Outer chrome bezel outline
  ctx.strokeStyle = '#555';
  ctx.lineWidth = sc * 0.12;
  ctx.beginPath();
  ctx.roundRect(bx, by, W, H, R);
  ctx.stroke();
}

// === 4. BLUEPRINT (rolled-up scroll) ===
function drawBlueprint(ctx, sc, discovered, glowPhase, ts) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);
  ctx.rotate(0.15);

  // Unrolled portion (flat section trailing from the roll)
  ctx.fillStyle = '#1e4d8c';
  ctx.beginPath();
  ctx.moveTo(-sc * 1.5, -sc * 1.8);
  ctx.lineTo(sc * 4, -sc * 2.2);
  ctx.lineTo(sc * 4, sc * 2.2);
  ctx.lineTo(-sc * 1.5, sc * 1.8);
  ctx.closePath();
  ctx.fill();
  // Grid on unrolled portion
  ctx.strokeStyle = 'rgba(140, 195, 255, 0.3)';
  ctx.lineWidth = sc * 0.06;
  for (let i = 0; i <= 4; i++) {
    const lx = -sc * 1.5 + i * sc * 1.4;
    ctx.beginPath();
    ctx.moveTo(lx, -sc * 1.7);
    ctx.lineTo(lx, sc * 1.7);
    ctx.stroke();
  }
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-sc * 1.2, sc * i * 1.2);
    ctx.lineTo(sc * 3.8, sc * i * 1.2);
    ctx.stroke();
  }
  // Simple room shapes on the unrolled section
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
  ctx.lineWidth = sc * 0.12;
  ctx.strokeRect(sc * 0, -sc * 1.0, sc * 1.8, sc * 1.4);
  ctx.strokeRect(sc * 2.0, -sc * 0.8, sc * 1.5, sc * 1.8);
  ctx.strokeRect(sc * 0, sc * 0.6, sc * 1.2, sc * 0.9);
  // Rolled-up cylinder (left side)
  ctx.fillStyle = '#2558a8';
  ctx.beginPath();
  ctx.ellipse(-sc * 1.5, 0, sc * 1.0, sc * 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a4585';
  ctx.beginPath();
  ctx.ellipse(-sc * 1.5, 0, sc * 1.0, sc * 2.2, 0, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();
  // Roll highlight
  ctx.fillStyle = '#3a70c0';
  ctx.beginPath();
  ctx.ellipse(-sc * 1.8, 0, sc * 0.3, sc * 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Roll edge rings
  ctx.strokeStyle = '#1a4080';
  ctx.lineWidth = sc * 0.1;
  ctx.beginPath();
  ctx.ellipse(-sc * 1.5, -sc * 2.0, sc * 1.0, sc * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-sc * 1.5, sc * 2.0, sc * 1.0, sc * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Small rocks weighing down the corner
  ctx.fillStyle = '#556666';
  ctx.beginPath();
  ctx.ellipse(sc * 3.6, sc * 2.0, sc * 0.8, sc * 0.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#667777';
  ctx.beginPath();
  ctx.ellipse(sc * 3.2, sc * 2.3, sc * 0.6, sc * 0.4, -0.1, 0, Math.PI * 2);
  ctx.fill();
}

// === 5. SWISS ARMY KNIFE ===
function drawSwissKnife(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);
  ctx.rotate(-0.15);

  // Blade
  ctx.fillStyle = '#c0c8d0';
  ctx.beginPath();
  ctx.moveTo(sc * 1.5, -sc * 0.15);
  ctx.lineTo(sc * 5, -sc * 0.3);
  ctx.lineTo(sc * 5.5, 0);
  ctx.lineTo(sc * 1.5, sc * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8e0e8';
  ctx.beginPath();
  ctx.moveTo(sc * 2, -sc * 0.1);
  ctx.lineTo(sc * 4.8, -sc * 0.25);
  ctx.lineTo(sc * 5.3, -sc * 0.05);
  ctx.lineTo(sc * 2, sc * 0.02);
  ctx.closePath();
  ctx.fill();
  // Handle
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.roundRect(-sc * 2.5, -sc * 0.8, sc * 4, sc * 1.6, sc * 0.3);
  ctx.fill();
  ctx.fillStyle = '#dd3333';
  ctx.beginPath();
  ctx.roundRect(-sc * 2.3, -sc * 0.6, sc * 3.6, sc * 0.5, sc * 0.15);
  ctx.fill();
  // Swiss cross
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-sc * 0.8, -sc * 0.08, sc * 0.7, sc * 0.16);
  ctx.fillRect(-sc * 0.53, -sc * 0.35, sc * 0.16, sc * 0.7);
  // Pivot
  ctx.fillStyle = '#999999';
  ctx.beginPath();
  ctx.arc(sc * 1.5, 0, sc * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Handle outline
  ctx.strokeStyle = '#881111';
  ctx.lineWidth = sc * 0.12;
  ctx.beginPath();
  ctx.roundRect(-sc * 2.5, -sc * 0.8, sc * 4, sc * 1.6, sc * 0.3);
  ctx.stroke();
}

// === 6. SUBMERSIBLE ===
function drawSubmersible(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  // Hull
  ctx.fillStyle = '#ddaa22';
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 4, sc * 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eebb33';
  ctx.beginPath();
  ctx.ellipse(0, -sc * 0.5, sc * 3.2, sc * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  // Viewport
  ctx.fillStyle = '#224466';
  ctx.beginPath();
  ctx.arc(sc * 1.8, -sc * 0.2, sc * 1.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3388bb';
  ctx.beginPath();
  ctx.arc(sc * 1.8, -sc * 0.2, sc * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(sc * 1.5, -sc * 0.5, sc * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cc8811';
  ctx.lineWidth = sc * 0.2;
  ctx.beginPath();
  ctx.arc(sc * 1.8, -sc * 0.2, sc * 1.0, 0, Math.PI * 2);
  ctx.stroke();
  // Conning tower
  ctx.fillStyle = '#cc9918';
  ctx.beginPath();
  ctx.roundRect(-sc * 0.8, -sc * 3, sc * 1.6, sc * 1.5, sc * 0.3);
  ctx.fill();
  ctx.fillStyle = '#ddaa22';
  ctx.beginPath();
  ctx.roundRect(-sc * 0.6, -sc * 2.8, sc * 0.5, sc * 1.0, sc * 0.15);
  ctx.fill();
  // Propeller
  ctx.fillStyle = '#888888';
  ctx.save();
  ctx.translate(-sc * 4, 0);
  ctx.fillRect(-sc * 0.3, -sc * 1.2, sc * 0.6, sc * 2.4);
  ctx.fillRect(-sc * 0.3, -sc * 0.3, sc * 1.0, sc * 0.6);
  ctx.restore();
  // Hull outline
  ctx.strokeStyle = '#997711';
  ctx.lineWidth = sc * 0.15;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 4, sc * 2, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// === 7. COMPASS ===
function drawCompass(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  const r = sc * 3;
  // Outer ring
  ctx.fillStyle = '#c8a050';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Inner face
  ctx.fillStyle = '#f5ecd4';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  // Directional arrows
  const dirs = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  const labels = ['N', 'E', 'S', 'W'];
  const colors = ['#cc2222', '#333', '#333', '#333'];
  for (let i = 0; i < 4; i++) {
    const a = dirs[i] - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.65);
    ctx.lineTo(-sc * 0.3, -r * 0.25);
    ctx.lineTo(sc * 0.3, -r * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = colors[i];
    ctx.font = `bold ${sc * 0.7}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68);
  }
  // Secondary arrows (diagonal)
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 4) + i * (Math.PI / 2) - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.4);
    ctx.lineTo(-sc * 0.15, -r * 0.15);
    ctx.lineTo(sc * 0.15, -r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Center pivot
  ctx.fillStyle = '#c8a050';
  ctx.beginPath();
  ctx.arc(0, 0, sc * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // Glass dome
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(-sc * 0.5, -sc * 0.5, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  // Ring outline
  ctx.strokeStyle = '#8a6830';
  ctx.lineWidth = sc * 0.2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
}

// === 8. AMAZON SHIPPING BOX ===
function drawShippingBox(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);
  ctx.rotate(0.05);

  const bw = sc * 6, bh = sc * 4.5;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(sc * 0.3, bh / 2 + sc * 0.5, bw * 0.4, sc * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Front face
  ctx.fillStyle = '#c4923a';
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  // Top face
  ctx.fillStyle = '#d4a24a';
  ctx.beginPath();
  ctx.moveTo(-bw / 2, -bh / 2);
  ctx.lineTo(-bw / 2 + sc * 0.8, -bh / 2 - sc * 0.6);
  ctx.lineTo(bw / 2 + sc * 0.8, -bh / 2 - sc * 0.6);
  ctx.lineTo(bw / 2, -bh / 2);
  ctx.closePath();
  ctx.fill();
  // Right face
  ctx.fillStyle = '#a47828';
  ctx.beginPath();
  ctx.moveTo(bw / 2, -bh / 2);
  ctx.lineTo(bw / 2 + sc * 0.8, -bh / 2 - sc * 0.6);
  ctx.lineTo(bw / 2 + sc * 0.8, bh / 2 - sc * 0.6);
  ctx.lineTo(bw / 2, bh / 2);
  ctx.closePath();
  ctx.fill();
  // Tape seam
  ctx.fillStyle = '#b08830';
  ctx.fillRect(-sc * 0.3, -bh / 2, sc * 0.6, bh);
  ctx.beginPath();
  ctx.moveTo(-sc * 0.3, -bh / 2);
  ctx.lineTo(-sc * 0.15, -bh / 2 - sc * 0.6);
  ctx.lineTo(sc * 0.45, -bh / 2 - sc * 0.6);
  ctx.lineTo(sc * 0.3, -bh / 2);
  ctx.closePath();
  ctx.fill();
  // Simple right-pointing arrow (→) on front
  ctx.strokeStyle = '#8a6020';
  ctx.lineWidth = sc * 0.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-sc * 1.2, sc * 0.3);
  ctx.lineTo(sc * 1.0, sc * 0.3);
  ctx.lineTo(sc * 0.4, -sc * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sc * 1.0, sc * 0.3);
  ctx.lineTo(sc * 0.4, sc * 0.8);
  ctx.stroke();
  // Box outline
  ctx.strokeStyle = '#8a6828';
  ctx.lineWidth = sc * 0.12;
  ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
}

// === 9. SHIP'S WHEEL ===
function drawShipsWheel(ctx, sc, discovered, glowPhase) {
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  const r = sc * 3;
  // Outer rim
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = sc * 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  // Inner rim
  ctx.strokeStyle = '#7a5533';
  ctx.lineWidth = sc * 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  // Spokes + handles
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cx = Math.cos(a), sy = Math.sin(a);
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = sc * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx * r * 0.3, sy * r * 0.3);
    ctx.lineTo(cx * r, sy * r);
    ctx.stroke();
    ctx.fillStyle = '#7a5533';
    ctx.beginPath();
    ctx.arc(cx * (r + sc * 0.5), sy * (r + sc * 0.5), sc * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a3313';
    ctx.beginPath();
    ctx.arc(cx * (r + sc * 0.5), sy * (r + sc * 0.5), sc * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  // Hub
  ctx.fillStyle = '#8a6838';
  ctx.beginPath();
  ctx.arc(0, 0, sc * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.arc(0, 0, sc * 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Barnacles
  const barnacles = [
    [r * 0.7, r * 0.3, 0.35], [-r * 0.4, r * 0.6, 0.25],
    [r * 0.1, -r * 0.8, 0.3], [-r * 0.7, -r * 0.4, 0.4], [r * 0.9, -r * 0.2, 0.2],
  ];
  for (const [bx, by, bs] of barnacles) {
    ctx.fillStyle = '#556655';
    ctx.beginPath();
    ctx.arc(bx, by, sc * bs, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#445544';
    ctx.beginPath();
    ctx.arc(bx - sc * 0.05, by - sc * 0.05, sc * bs * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Weathering overlay
  ctx.fillStyle = 'rgba(80, 120, 80, 0.12)';
  ctx.beginPath();
  ctx.arc(0, 0, r + sc * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

// === 10. TREASURE CHEST (Deal Expert) — 15% smaller ===
function drawTreasureChest(ctx, sc, discovered, glowPhase) {
  sc = sc * 0.85;
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  const W = sc * 8, BH = sc * 4, LH = sc * 1.6;
  const bx = -W / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(sc * 0.4, BH + sc * 0.6, W * 0.42, sc * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  // Chest body
  ctx.fillStyle = '#6b3a18';
  ctx.beginPath();
  ctx.roundRect(bx, 0, W, BH, [0, 0, sc * 0.4, sc * 0.4]);
  ctx.fill();
  // Wood planks
  ctx.strokeStyle = '#4a2808';
  ctx.lineWidth = sc * 0.18;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(bx + W * (i / 4), sc * 0.3);
    ctx.lineTo(bx + W * (i / 4), BH - sc * 0.3);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a4e28';
  ctx.beginPath();
  ctx.roundRect(bx + sc * 0.3, sc * 0.3, W * 0.4, BH - sc * 0.6, sc * 0.2);
  ctx.fill();
  // Gold bands
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(bx, -sc * 0.2, W, sc * 0.7);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(bx, -sc * 0.2, W, sc * 0.3);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(bx, BH - sc * 0.65, W, sc * 0.65);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(bx, BH - sc * 0.65, W, sc * 0.28);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(bx, BH * 0.45, W, sc * 0.55);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(bx, BH * 0.45, W, sc * 0.22);
  // Lid
  const lt = -LH;
  ctx.fillStyle = '#7a4420';
  ctx.beginPath();
  ctx.moveTo(bx, 0);
  ctx.lineTo(bx, lt + LH * 0.5);
  ctx.bezierCurveTo(bx, lt, bx + W * 0.1, lt - sc * 0.3, bx + W / 2, lt - sc * 0.3);
  ctx.bezierCurveTo(bx + W * 0.9, lt - sc * 0.3, bx + W, lt, bx + W, lt + LH * 0.5);
  ctx.lineTo(bx + W, 0);
  ctx.closePath();
  ctx.fill();
  // Lid band
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(bx, -sc * 0.2, W, sc * 0.7);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(bx, -sc * 0.2, W, sc * 0.28);
  // Lock
  ctx.fillStyle = '#c8900a';
  ctx.beginPath();
  ctx.roundRect(-sc * 1.1, BH * 0.18, sc * 2.2, sc * 2.0, sc * 0.3);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.roundRect(-sc * 0.9, BH * 0.18 + sc * 0.15, sc * 1.8, sc * 1.7, sc * 0.2);
  ctx.fill();
  ctx.fillStyle = '#7a5000';
  ctx.beginPath();
  ctx.arc(0, BH * 0.18 + sc * 0.85, sc * 0.32, 0, Math.PI * 2);
  ctx.fill();
  // Body outline
  ctx.strokeStyle = '#2a1000';
  ctx.lineWidth = sc * 0.22;
  ctx.beginPath();
  ctx.roundRect(bx, 0, W, BH, [0, 0, sc * 0.4, sc * 0.4]);
  ctx.stroke();
}

// === 11. PENN (Education) — big PENN text on blue (top) + red (bottom) background ===
function drawPennLogo(ctx, sc, discovered, glowPhase) {
  sc = sc * 1.5; // 50% larger to match treasure-chest presence
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  const PENN_NAVY = '#1a2e5c';
  const PENN_RED = '#7a0e0e';
  const padding = sc * 0.4;
  const fontSize = sc * 1.5;

  ctx.font = `bold ${fontSize}px sans-serif`;
  const textWidth = ctx.measureText('PENN').width;
  const w = textWidth + padding * 2;
  const h = fontSize + padding * 2;
  const r = sc * 0.35;

  // Blue (top half) background
  ctx.fillStyle = PENN_NAVY;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h / 2, [r, r, 0, 0]);
  ctx.fill();

  // Red (bottom half) background
  ctx.fillStyle = PENN_RED;
  ctx.beginPath();
  ctx.roundRect(-w / 2, 0, w, h / 2, [0, 0, r, r]);
  ctx.fill();

  // Outline
  ctx.strokeStyle = PENN_NAVY;
  ctx.lineWidth = sc * 0.18;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PENN', 0, 0);
}

// === 12. AMAZON — "amazon" above, smile only: shallow arc, clearly fat in middle / thin at ends, a-to-n ===
const AMAZON_ORANGE = '#FF9900';

function drawAmazonLogoCore(ctx, sc) {
  const fontSize = sc * 1.5;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const textWidth = ctx.measureText('amazon').width;
  const leftX = -textWidth / 2;
  const rightX = textWidth / 2;
  const midX = (leftX + rightX) / 2;
  const dip = sc * 0.58;
  const smileY = sc * 0.48;

  // 1. "amazon" text
  ctx.fillStyle = AMAZON_ORANGE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('amazon', 0, -sc * 1.0);

  // 2. Smile only: shallow arc, moderate middle / visible ends (not too fat, not needle-thin)
  const curve = (t) => {
    const u = 1 - t;
    const x = u * u * leftX + 2 * u * t * midX + t * t * rightX;
    const y = smileY + 4 * u * t * dip;
    return { x, y };
  };
  const tangent = (t) => {
    const u = 1 - t;
    const dx = 2 * u * (midX - leftX) + 2 * t * (rightX - midX);
    const dy = 4 * (u - t) * dip;
    const len = Math.hypot(dx, dy) || 1;
    return { nx: -dy / len, ny: dx / len };
  };
  const minThick = sc * 0.14;
  const maxThick = sc * 0.28;
  const widthAt = (t) => minThick + (maxThick - minThick) * Math.sin(Math.PI * t);

  ctx.fillStyle = AMAZON_ORANGE;
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const c = curve(t);
    const p = tangent(t);
    const w = widthAt(t);
    const x = c.x + p.nx * w;
    const y = c.y + p.ny * w;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const c = curve(t);
    const p = tangent(t);
    const w = widthAt(t);
    ctx.lineTo(c.x - p.nx * w, c.y - p.ny * w);
  }
  ctx.closePath();
  ctx.fill();
}

function drawAmazonLogo(ctx, sc, discovered, glowPhase) {
  sc = sc * 1.5; // 50% larger to match treasure-chest presence
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  const scaleUp = 8;
  const bufSc = sc * scaleUp;
  const halfW = sc * 2.8;
  const halfH = sc * 2.0; // taller so "amazon" and smile have room (no cut-off)
  const bufW = Math.ceil(halfW * scaleUp * 2);
  const bufH = Math.ceil(halfH * scaleUp * 2);

  let off = null;
  try {
    off = document.createElement('canvas');
    off.width = bufW;
    off.height = bufH;
  } catch (_) {
    off = null;
  }

  if (off && off.getContext('2d')) {
    const bctx = off.getContext('2d');
    bctx.imageSmoothingEnabled = true;
    bctx.imageSmoothingQuality = 'high';
    bctx.translate(bufW / 2, bufH / 2);
    drawAmazonLogoCore(bctx, bufSc);
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, bufW, bufH, -halfW, -halfH, halfW * 2, halfH * 2);
    ctx.restore();
  } else {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawAmazonLogoCore(ctx, sc);
    ctx.restore();
  }
}

// === 13. LIO (Centric Brands) — Tiffany blue, large spaced "l i o" contained in square ===
function drawLioLogo(ctx, sc, discovered, glowPhase) {
  sc = sc * 1.5; // 50% larger to match treasure-chest presence
  applyGlow(ctx, discovered, glowPhase, sc * 5);

  const TIFFANY = '#0ABAB5';
  const letterSpacing = sc * 0.5;
  const fontSize = sc * 2.7; // twice previous (1.35 -> 2.7)

  ctx.font = `bold ${fontSize}px sans-serif`;
  const letters = ['l', 'i', 'o'];
  const totalWidth = letters.reduce((acc, l) => acc + ctx.measureText(l).width, 0) + letterSpacing * (letters.length - 1);
  const textHeight = fontSize;
  const padding = sc * 0.4;
  const w = totalWidth + padding * 2;
  const h = textHeight + padding * 2;

  ctx.fillStyle = TIFFANY;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, sc * 0.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = sc * 0.18;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let x = -totalWidth / 2;
  for (const letter of letters) {
    ctx.fillText(letter, x, 0);
    x += ctx.measureText(letter).width + letterSpacing;
  }
}

// === DISPATCHER ===
const DRAW_MAP = {
  'bottle': drawBottle,
  'echo-show': drawEchoShow,
  'ring-doorbell': drawRingDoorbell,
  'blueprint': drawBlueprint,
  'swiss-knife': drawSwissKnife,
  'submersible': drawSubmersible,
  'compass': drawCompass,
  'shipping-box': drawShippingBox,
  'ships-wheel': drawShipsWheel,
  'treasure-chest': drawTreasureChest,
  'penn': drawPennLogo,
  'amazon': drawAmazonLogo,
  'lio': drawLioLogo,
};

export function drawTreasure(ctx, x, y, iconType, discovered, glowPhase, pixelSize, timestamp) {
  const p = pixelSize ?? theme.pixelSize ?? 2;
  const sc = p * 4;
  ctx.save();
  ctx.translate(x, y);
  const fn = DRAW_MAP[iconType] ?? drawTreasureChest;
  fn(ctx, sc, discovered, glowPhase, timestamp);
  ctx.restore();
}
