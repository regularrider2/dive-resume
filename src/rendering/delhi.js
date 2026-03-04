import theme from '../config/theme.json';

// Delhi - black & tan German Shepherd, 3 legs, dome helmet
// Drawn with canvas primitives for clear recognizability
export function drawDelhi(ctx, x, y, discovered, frame, glowPhase, pixelSize) {
  const p = pixelSize ?? theme.pixelSize ?? 2;
  const sc = p * 5;
  const c = theme.delhi;

  ctx.save();
  ctx.translate(x, y);

  if (discovered) {
    ctx.globalAlpha = 0.4;
  } else {
    const glowAlpha = 0.2 + 0.15 * Math.sin(glowPhase * Math.PI * 2);
    ctx.fillStyle = c.glowColor;
    ctx.globalAlpha = glowAlpha;
    ctx.beginPath();
    ctx.arc(0, 0, sc * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const tailWag = frame === 1 ? -0.5 : 0.2;
  const tongueOut = frame === 1;

  // === TAIL ===
  ctx.strokeStyle = c.black;
  ctx.lineWidth = sc * 0.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-sc * 2.5, -sc * 0.5);
  ctx.quadraticCurveTo(-sc * 3.5, -sc * 1.5 + tailWag * sc, -sc * 3.0, -sc * 2.5 + tailWag * sc * 1.5);
  ctx.stroke();

  // === BODY ===
  ctx.fillStyle = c.black;
  ctx.beginPath();
  ctx.ellipse(0, 0, sc * 2.2, sc * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tan saddle underside
  ctx.fillStyle = c.tan;
  ctx.beginPath();
  ctx.ellipse(sc * 0.2, sc * 0.5, sc * 1.6, sc * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // === 3 LEGS (missing hind-left) ===
  ctx.lineWidth = sc * 0.55;
  ctx.lineCap = 'round';

  // Front right leg
  ctx.strokeStyle = c.black;
  ctx.beginPath();
  ctx.moveTo(sc * 1.2, sc * 0.9);
  ctx.lineTo(sc * 1.3, sc * 2.2);
  ctx.stroke();
  ctx.strokeStyle = c.tan;
  ctx.beginPath();
  ctx.moveTo(sc * 1.3, sc * 1.8);
  ctx.lineTo(sc * 1.35, sc * 2.2);
  ctx.stroke();

  // Front left leg
  ctx.strokeStyle = c.black;
  ctx.beginPath();
  ctx.moveTo(sc * 0.5, sc * 1.0);
  ctx.lineTo(sc * 0.4, sc * 2.2);
  ctx.stroke();
  ctx.strokeStyle = c.tan;
  ctx.beginPath();
  ctx.moveTo(sc * 0.4, sc * 1.8);
  ctx.lineTo(sc * 0.35, sc * 2.2);
  ctx.stroke();

  // Hind right leg (only one hind leg - left is missing)
  ctx.strokeStyle = c.black;
  ctx.beginPath();
  ctx.moveTo(-sc * 1.2, sc * 0.9);
  ctx.lineTo(-sc * 1.4, sc * 2.2);
  ctx.stroke();
  ctx.strokeStyle = c.tan;
  ctx.beginPath();
  ctx.moveTo(-sc * 1.4, sc * 1.8);
  ctx.lineTo(-sc * 1.5, sc * 2.2);
  ctx.stroke();

  // === NECK ===
  ctx.fillStyle = c.black;
  ctx.beginPath();
  ctx.ellipse(sc * 1.8, -sc * 0.6, sc * 0.7, sc * 1.0, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === HEAD ===
  ctx.fillStyle = c.black;
  ctx.beginPath();
  ctx.ellipse(sc * 2.6, -sc * 1.4, sc * 1.1, sc * 0.9, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Tan muzzle/snout
  ctx.fillStyle = c.tan;
  ctx.beginPath();
  ctx.ellipse(sc * 3.4, -sc * 1.1, sc * 0.7, sc * 0.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Tan eyebrow marks
  ctx.fillStyle = c.tanLight;
  ctx.beginPath();
  ctx.ellipse(sc * 2.3, -sc * 1.9, sc * 0.3, sc * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sc * 2.8, -sc * 1.95, sc * 0.28, sc * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pointed ears (GSD characteristic)
  ctx.fillStyle = c.black;
  ctx.beginPath();
  ctx.moveTo(sc * 1.9, -sc * 1.9);
  ctx.lineTo(sc * 1.6, -sc * 3.0);
  ctx.lineTo(sc * 2.4, -sc * 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sc * 2.5, -sc * 2.0);
  ctx.lineTo(sc * 2.4, -sc * 3.1);
  ctx.lineTo(sc * 3.0, -sc * 2.3);
  ctx.closePath();
  ctx.fill();
  // Tan inner ear
  ctx.fillStyle = c.tan;
  ctx.beginPath();
  ctx.moveTo(sc * 2.0, -sc * 2.0);
  ctx.lineTo(sc * 1.8, -sc * 2.8);
  ctx.lineTo(sc * 2.3, -sc * 2.25);
  ctx.closePath();
  ctx.fill();

  // Nose
  ctx.fillStyle = c.nosePad;
  ctx.beginPath();
  ctx.ellipse(sc * 3.85, -sc * 1.0, sc * 0.22, sc * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sc * 2.4, -sc * 1.55, sc * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.eyeColor;
  ctx.beginPath();
  ctx.arc(sc * 2.44, -sc * 1.55, sc * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(sc * 2.38, -sc * 1.6, sc * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Tongue
  if (tongueOut) {
    ctx.fillStyle = c.tongue;
    ctx.beginPath();
    ctx.ellipse(sc * 3.5, -sc * 0.75, sc * 0.22, sc * 0.35, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // === DOME HELMET ===
  const domeX = sc * 2.6;
  const domeY = -sc * 1.4;
  const domeR = sc * 1.6;
  ctx.strokeStyle = 'rgba(100,190,230,0.8)';
  ctx.lineWidth = sc * 0.25;
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(150,220,255,0.18)';
  ctx.fill();
  // dome glare
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(domeX - domeR * 0.3, domeY - domeR * 0.35, domeR * 0.35, domeR * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
