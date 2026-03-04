import theme from '../config/theme.json';

const WORLD_WIDTH = theme.world?.width ?? 800;
const WORLD_HEIGHT = theme.world?.height ?? 2400;
const SEED = 12345;

function seededRandom(seed, x, y) {
  const n = Math.sin(seed + x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// y is a 0–1 fraction of skyBottom (0=top of sky, 1=waterline) — fixed in screen space
const CLOUD_POSITIONS = [
  { x: 80,  y: 0.18, w: 60, h: 18 },
  { x: 300, y: 0.12, w: 80, h: 22 },
  { x: 550, y: 0.25, w: 50, h: 14 },
  { x: 700, y: 0.15, w: 70, h: 20 },
  { x: 180, y: 0.35, w: 45, h: 12 },
  { x: 480, y: 0.08, w: 55, h: 16 },
];

function getSceneryPositions() {
  const positions = { seaweed: [], coral: [], rocks: [] };
  const floorY = WORLD_HEIGHT - 80;
  for (let y = 400; y < WORLD_HEIGHT - 100; y += 120) {
    for (let x = 0; x < WORLD_WIDTH; x += 160) {
      const r = seededRandom(SEED, x, y);
      if (r < 0.08) {
        positions.seaweed.push({ x, y, height: 20 + r * 35 });
      } else if (r < 0.14) {
        positions.coral.push({ x, y, colorIndex: Math.floor(r * 10) % 4 });
      }
    }
  }
  for (let x = 40; x < WORLD_WIDTH; x += 100) {
    const r = seededRandom(SEED + 200, x, floorY);
    if (r < 0.5) {
      positions.rocks.push({ x, y: floorY, size: 1 + Math.floor(r * 10) % 3 });
    }
  }
  return positions;
}

let cachedPositions = null;
function getCachedPositions() {
  if (!cachedPositions) cachedPositions = getSceneryPositions();
  return cachedPositions;
}

function drawCloud(ctx, x, y, w, h, p) {
  // w and h drive the cloud's scale. Drawn with ellipses like all other elements.
  const s = w * p * 0.5; // scale unit: half-width in pixels

  ctx.save();
  ctx.translate(x, y);

  // Underside shadow tint
  ctx.fillStyle = 'rgba(160,185,220,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.15, s * 0.9, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main body — three overlapping ellipses form the lumpy cloud silhouette
  ctx.fillStyle = '#eef3ff';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.9, s * 0.42, 0, 0, Math.PI * 2);        // centre
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 0.55, -s * 0.08, s * 0.52, s * 0.36, 0, 0, Math.PI * 2); // left bump
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 0.5, -s * 0.05, s * 0.48, s * 0.32, 0, 0, Math.PI * 2);  // right bump
  ctx.fill();
  // Top centre bump — tallest
  ctx.beginPath();
  ctx.ellipse(-s * 0.1, -s * 0.22, s * 0.38, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bright highlight on top-left of main body
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-s * 0.25, -s * 0.18, s * 0.22, s * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSeaweed(ctx, x, y, height, time, p) {
  const colors = theme.colors.seaweed;
  const sway = Math.sin(time * 0.002 + x * 0.01) * 3 * p;
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < height; i += 3) {
    const colorIdx = Math.min(Math.floor(i / (height / 3)), 2);
    ctx.fillStyle = colors[colorIdx];
    const segSway = sway * (i / height);
    ctx.fillRect(segSway + Math.sin(i * 0.15) * p, -i * p, 2 * p, 3 * p);
  }
  ctx.restore();
}

export function drawCoral(ctx, x, y, colorIndex, p) {
  const colors = theme.colors.coral;
  const c = colors[colorIndex % colors.length];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = c;
  ctx.fillRect(0, -8 * p, 3 * p, 8 * p);
  ctx.fillRect(-2 * p, -6 * p, 2 * p, 4 * p);
  ctx.fillRect(3 * p, -7 * p, 2 * p, 5 * p);
  ctx.fillRect(-1 * p, -10 * p, 2 * p, 3 * p);
  ctx.fillRect(2 * p, -11 * p, 2 * p, 4 * p);
  ctx.fillRect(4 * p, -5 * p, 3 * p, 3 * p);
  ctx.restore();
}

// Pre-compute reef wall edge profiles (once, not per frame)
let _reefWallCache = null;
function getReefWallEdges(topY, bottomY, side, seedOffset, baseWidth, p) {
  const step = 8 * p;
  const edges = [];
  for (let y = topY; y <= bottomY; y += step) {
    const r1 = seededRandom(SEED + seedOffset, Math.floor(y), side === 'left' ? 0 : 1);
    const r2 = seededRandom(SEED + seedOffset + 100, Math.floor(y), side === 'left' ? 2 : 3);
    const jag = (r1 - 0.5) * baseWidth * 0.5;
    const bulge = Math.sin(y * 0.005) * baseWidth * 0.15;
    edges.push({ y, w: baseWidth + jag + bulge, ledgeSeed: r2 });
  }
  return edges;
}

function buildReefWallCache(p) {
  const zones = theme.zones ?? [];
  const reefZone = zones.find(z => z.id === 'reef');
  const trenchZone = zones.find(z => z.id === 'trench');
  if (!reefZone) return null;
  const topY = reefZone.startY;
  const bottomY = (trenchZone?.endY ?? WORLD_HEIGHT) - 80;
  const baseWidth = 50 * p;
  return {
    topY, bottomY, baseWidth,
    leftEdges: getReefWallEdges(topY, bottomY, 'left', 400, baseWidth, p),
    rightEdges: getReefWallEdges(topY, bottomY, 'right', 600, baseWidth, p),
  };
}

function drawReefWall(ctx, cameraY, worldViewWidth, worldViewHeight, side, p) {
  if (!_reefWallCache) _reefWallCache = buildReefWallCache(p);
  const cache = _reefWallCache;
  if (!cache) return;

  const edges = side === 'left' ? cache.leftEdges : cache.rightEdges;
  const visTop = cameraY - 20;
  const visBottom = cameraY + worldViewHeight + 20;
  const coralColors = theme.colors.coral ?? ['#ff6b6b', '#ff8e72', '#ffa07a', '#e55b5b'];
  const step = 8 * p;

  const rockBase = '#5a4a3a';
  const rockMid = '#6a5a48';
  const rockLight = '#7a6a55';
  const rockDark = '#3a2e22';

  ctx.save();

  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (e.y + step < visTop || e.y > visBottom) continue;
    const worldY = e.y;
    const depth = (e.y - cache.topY) / (cache.bottomY - cache.topY);

    const r = seededRandom(SEED + 800, Math.floor(e.y), side === 'left' ? 10 : 11);
    if (r < 0.33) ctx.fillStyle = rockBase;
    else if (r < 0.66) ctx.fillStyle = rockMid;
    else ctx.fillStyle = rockLight;

    if (side === 'left') {
      ctx.fillRect(0, worldY, e.w, step + 1);
    } else {
      ctx.fillRect(worldViewWidth - e.w, worldY, e.w, step + 1);
    }

    ctx.fillStyle = rockDark;
    if (side === 'left') {
      ctx.fillRect(e.w - 2 * p, worldY, 2 * p, step + 1);
    } else {
      ctx.fillRect(worldViewWidth - e.w, worldY, 2 * p, step + 1);
    }

    if (r > 0.5) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      const crackW = e.w * (0.3 + r * 0.4);
      if (side === 'left') {
        ctx.fillRect(e.w - crackW, worldY + step * 0.5, crackW, p);
      } else {
        ctx.fillRect(worldViewWidth - e.w, worldY + step * 0.5, crackW, p);
      }
    }

    if (depth < 0.5 && e.ledgeSeed > 0.5) {
      const ci = Math.floor(e.ledgeSeed * coralColors.length);
      const ci2 = (ci + 1) % coralColors.length;
      const dir = side === 'left' ? 1 : -1;
      const edgeX = side === 'left' ? e.w : worldViewWidth - e.w;
      const baseY = worldY + step * 0.5;
      const fanW = (8 + e.ledgeSeed * 10) * p;
      const fingers = 3 + Math.floor(e.ledgeSeed * 3);

      for (let f = 0; f < fingers; f++) {
        const fSeed = seededRandom(SEED + 1200, Math.floor(e.y), f);
        const angle = ((f / (fingers - 1)) - 0.5) * 1.2;
        const len = fanW * (0.6 + fSeed * 0.4);
        const tipX = edgeX + dir * len * Math.cos(angle);
        const tipY = baseY - len * Math.sin(angle) * 0.5;
        ctx.strokeStyle = coralColors[f % 2 === 0 ? ci : ci2];
        ctx.lineWidth = (1.5 + fSeed) * p;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(edgeX, baseY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.fillStyle = coralColors[f % 2 === 0 ? ci : ci2];
        ctx.beginPath();
        ctx.arc(tipX, tipY, (1 + fSeed * 1.5) * p, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (e.ledgeSeed > 0.75 && i % 3 === 0) {
      ctx.fillStyle = rockMid;
      const ledgeW = (15 + e.ledgeSeed * 20) * p;
      const ledgeH = 4 * p;
      if (side === 'left') {
        ctx.fillRect(e.w - 2 * p, worldY, ledgeW, ledgeH);
        ctx.fillStyle = rockDark;
        ctx.fillRect(e.w - 2 * p, worldY + ledgeH, ledgeW, p);
      } else {
        ctx.fillRect(worldViewWidth - e.w - ledgeW + 2 * p, worldY, ledgeW, ledgeH);
        ctx.fillStyle = rockDark;
        ctx.fillRect(worldViewWidth - e.w - ledgeW + 2 * p, worldY + ledgeH, ledgeW, p);
      }
    }
  }

  ctx.restore();
}

export function drawRock(ctx, x, y, size, p) {
  const s = size ?? 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(-s * 2 * p, -s * 3 * p, s * 5 * p, s * 3 * p);
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(-s * 2 * p, -s * p, s * 3 * p, s * p);
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(-s * p, -s * 3 * p, s * 2 * p, s * p);
  ctx.restore();
}

function drawBoat(ctx, worldX, worldY, p, time) {
  if (worldY > 600 || worldY < -400) return;
  const t = time ?? 0;
  const s = p * 22; // scale unit matching the creature/item style

  ctx.save();
  ctx.translate(worldX, worldY);

  // ── Hull ──────────────────────────────────────────────────────────────────
  // Hull shape: wide rounded stern, curved keel, pointed bow using bezier
  ctx.fillStyle = '#3d4a58';
  ctx.beginPath();
  ctx.moveTo(-s * 2.4, 0);                                          // stern top-left
  ctx.lineTo(-s * 2.4, s * 0.9);                                    // stern wall down
  ctx.quadraticCurveTo(-s * 2.4, s * 1.3, -s * 2.0, s * 1.3);     // stern keel corner
  ctx.bezierCurveTo(-s * 0.5, s * 1.4, s * 1.4, s * 1.2, s * 2.2, s * 0.6); // keel curve to bow
  ctx.bezierCurveTo(s * 2.6, s * 0.3, s * 2.7, 0, s * 2.5, -s * 0.05); // bow tip
  ctx.lineTo(-s * 2.4, 0);
  ctx.closePath();
  ctx.fill();

  // Hull highlight — upper third lighter
  ctx.fillStyle = '#506070';
  ctx.beginPath();
  ctx.moveTo(-s * 2.4, 0);
  ctx.lineTo(s * 2.5, -s * 0.05);
  ctx.lineTo(s * 2.5, s * 0.35);
  ctx.bezierCurveTo(s * 2.0, s * 0.25, -s * 0.5, s * 0.3, -s * 2.4, s * 0.35);
  ctx.closePath();
  ctx.fill();

  // Red boot-topping waterline stripe
  ctx.fillStyle = '#c02828';
  ctx.beginPath();
  ctx.moveTo(-s * 2.4, s * 0.72);
  ctx.lineTo(s * 2.2, s * 0.42);
  ctx.bezierCurveTo(s * 2.4, s * 0.38, s * 2.55, s * 0.28, s * 2.55, s * 0.18);
  ctx.lineTo(s * 2.55, s * 0.3);
  ctx.bezierCurveTo(s * 2.4, s * 0.5, s * 2.2, s * 0.56, s * 2.0, s * 0.6);
  ctx.lineTo(-s * 2.4, s * 0.9);
  ctx.closePath();
  ctx.fill();

  // Hull dark outline
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = s * 0.07;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 2.4, 0);
  ctx.lineTo(-s * 2.4, s * 0.9);
  ctx.quadraticCurveTo(-s * 2.4, s * 1.3, -s * 2.0, s * 1.3);
  ctx.bezierCurveTo(-s * 0.5, s * 1.4, s * 1.4, s * 1.2, s * 2.2, s * 0.6);
  ctx.bezierCurveTo(s * 2.6, s * 0.3, s * 2.7, 0, s * 2.5, -s * 0.05);
  ctx.lineTo(-s * 2.4, 0);
  ctx.stroke();

  // Waterline foam glint
  ctx.strokeStyle = 'rgba(200,230,255,0.5)';
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(-s * 2.4, s * 0.04);
  ctx.bezierCurveTo(-s * 0.5, s * 0.08, s * 1.5, s * 0.06, s * 2.4, -s * 0.02);
  ctx.stroke();

  // ── Deck ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#2e333e';
  ctx.beginPath();
  ctx.roundRect(-s * 2.3, -s * 0.5, s * 4.8, s * 0.52, s * 0.08);
  ctx.fill();

  // Deck rail highlight
  ctx.strokeStyle = '#3a4050';
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(-s * 2.3, -s * 0.5);
  ctx.lineTo(s * 2.5, -s * 0.5);
  ctx.stroke();

  // ── Wheelhouse ────────────────────────────────────────────────────────────
  // Body
  ctx.fillStyle = '#5a6270';
  ctx.beginPath();
  ctx.roundRect(-s * 1.0, -s * 1.55, s * 2.0, s * 1.08, s * 0.12);
  ctx.fill();

  // Front face highlight
  ctx.fillStyle = '#6a7280';
  ctx.beginPath();
  ctx.roundRect(-s * 0.95, -s * 1.55, s * 1.9, s * 0.4, [s * 0.12, s * 0.12, 0, 0]);
  ctx.fill();

  // Roof overhang
  ctx.fillStyle = '#484e58';
  ctx.beginPath();
  ctx.roundRect(-s * 1.08, -s * 1.62, s * 2.16, s * 0.14, s * 0.06);
  ctx.fill();

  // Window strip backing
  ctx.fillStyle = '#0e1820';
  ctx.beginPath();
  ctx.roundRect(-s * 0.82, -s * 1.42, s * 1.64, s * 0.42, s * 0.06);
  ctx.fill();

  // Three window panes
  const winPositions = [-s * 0.6, -s * 0.15, s * 0.3];
  winPositions.forEach(wx => {
    ctx.fillStyle = '#3a99cc';
    ctx.beginPath();
    ctx.roundRect(wx, -s * 1.38, s * 0.38, s * 0.32, s * 0.04);
    ctx.fill();
    // Glint
    ctx.fillStyle = 'rgba(200,240,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(wx + s * 0.06, -s * 1.3, s * 0.05, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Wheelhouse outline
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.roundRect(-s * 1.0, -s * 1.55, s * 2.0, s * 1.08, s * 0.12);
  ctx.stroke();

  // ── Mast ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#909098';
  ctx.beginPath();
  ctx.roundRect(-s * 0.06, -s * 2.8, s * 0.12, s * 1.28, s * 0.04);
  ctx.fill();

  // Cross-spar
  ctx.beginPath();
  ctx.roundRect(-s * 0.4, -s * 2.35, s * 0.8, s * 0.07, s * 0.03);
  ctx.fill();

  // ── Dive flag ─────────────────────────────────────────────────────────────
  const flagSlices = 8;
  const flagW = s * 0.72;
  const flagH = s * 0.48;
  const sliceW = flagW / flagSlices;
  for (let i = 0; i < flagSlices; i++) {
    const wave = Math.sin(t * 0.004 + i * 0.65) * s * 0.05 * (i / flagSlices);
    const fx = s * 0.06 + i * sliceW;
    const fy = -s * 2.78 + wave;
    ctx.fillStyle = '#dd3333';
    ctx.fillRect(fx, fy, sliceW + 0.5, flagH);
    const stripeY = (i / flagSlices) * (flagH - s * 0.12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx, fy + stripeY, sliceW + 0.5, s * 0.12);
  }

  // ── Captain ────────────────────────────────────────────────────────────────
  // Centered at x = s*1.5, standing on deck (feet at y = -s*0.5)
  const cx = s * 1.5;
  const cy = -s * 0.5; // deck surface y

  // Legs
  ctx.fillStyle = '#1a2844';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.18, cy - s * 0.45, s * 0.14, s * 0.46, s * 0.05);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + s * 0.04, cy - s * 0.45, s * 0.14, s * 0.46, s * 0.05);
  ctx.fill();

  // Shoes
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.ellipse(cx - s * 0.11, cy, s * 0.11, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + s * 0.11, cy, s * 0.11, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jacket body
  ctx.fillStyle = '#1e3060';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.22, cy - s * 0.98, s * 0.44, s * 0.55, s * 0.08);
  ctx.fill();

  // Jacket highlight
  ctx.fillStyle = '#263870';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.22, cy - s * 0.98, s * 0.1, s * 0.55, [s * 0.08, 0, 0, s * 0.08]);
  ctx.fill();

  // Gold buttons
  ctx.fillStyle = '#d4a820';
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.55 - b * s * 0.14, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left arm (out to side)
  ctx.fillStyle = '#1e3060';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.38, cy - s * 0.85, s * 0.18, s * 0.32, s * 0.06);
  ctx.fill();

  // Right arm raised + forearm out holding megaphone
  ctx.beginPath();
  ctx.roundRect(cx + s * 0.22, cy - s * 1.05, s * 0.16, s * 0.38, s * 0.06);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + s * 0.3, cy - s * 1.05, s * 0.38, s * 0.14, s * 0.05);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#e8a870';
  ctx.beginPath();
  ctx.ellipse(cx, cy - s * 1.02, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#f5bc80';
  ctx.beginPath();
  ctx.ellipse(cx, cy - s * 1.2, s * 0.2, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx + s * 0.07, cy - s * 1.22, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Hat brim
  ctx.fillStyle = '#111828';
  ctx.beginPath();
  ctx.ellipse(cx, cy - s * 1.4, s * 0.28, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hat body
  ctx.fillStyle = '#f2f2f2';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.18, cy - s * 1.76, s * 0.36, s * 0.36, s * 0.06);
  ctx.fill();

  // Hat highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - s * 0.06, cy - s * 1.68, s * 0.07, s * 0.04, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Hat band
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.18, cy - s * 1.41, s * 0.36, s * 0.07, s * 0.02);
  ctx.fill();

  // Hat outline
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = s * 0.04;
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.18, cy - s * 1.76, s * 0.36, s * 0.36, s * 0.06);
  ctx.stroke();

  // Megaphone
  ctx.fillStyle = '#c07818';
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.46, cy - s * 1.0);
  ctx.lineTo(cx + s * 0.46, cy - s * 0.93);
  ctx.lineTo(cx + s * 0.76, cy - s * 0.88);
  ctx.lineTo(cx + s * 0.76, cy - s * 1.06);
  ctx.closePath();
  ctx.fill();

  // Megaphone bell flare
  ctx.beginPath();
  ctx.ellipse(cx + s * 0.76, cy - s * 0.97, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Megaphone highlight
  ctx.fillStyle = '#e09a30';
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.46, cy - s * 1.0);
  ctx.lineTo(cx + s * 0.76, cy - s * 1.06);
  ctx.lineTo(cx + s * 0.76, cy - s * 1.02);
  ctx.lineTo(cx + s * 0.46, cy - s * 0.96);
  ctx.closePath();
  ctx.fill();

  // Captain outline
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = s * 0.04;
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.22, cy - s * 0.98, s * 0.44, s * 0.55, s * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - s * 1.2, s * 0.2, s * 0.22, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawOceanFloor(ctx, worldViewWidth, p) {
  const floorY = WORLD_HEIGHT - 80;

  ctx.save();

  const sandLight = '#a09070';
  const sandMain = '#8a7a5a';
  const sandDark = '#6a5a3a';
  const rockMain = '#5a5a5a';
  const rockDark = '#3a3a3a';

  ctx.fillStyle = sandMain;
  ctx.fillRect(0, floorY, worldViewWidth, WORLD_HEIGHT - floorY + 100);

  ctx.fillStyle = sandLight;
  for (let x = 0; x < WORLD_WIDTH; x += 40) {
    const r = seededRandom(SEED + 99, x, 0);
    ctx.fillRect(x, floorY, (10 + r * 20) * p, 2 * p);
  }

  ctx.fillStyle = sandDark;
  for (let x = 15; x < WORLD_WIDTH; x += 60) {
    const r = seededRandom(SEED + 77, x, 1);
    ctx.fillRect(x, floorY + 3 * p, (5 + r * 10) * p, p);
  }

  for (let x = 30; x < WORLD_WIDTH; x += 100) {
    const r = seededRandom(SEED + 55, x, 2);
    const rw = 5 + r * 8;
    const rh = 4 + r * 5;
    ctx.fillStyle = rockMain;
    ctx.fillRect(x, floorY - rh * p, rw * p, rh * p);
    ctx.fillStyle = rockDark;
    ctx.fillRect(x, floorY - p, rw * p, p);
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(x + p, floorY - rh * p, (rw - 2) * p, p);
  }

  ctx.restore();
}

// Draws in world coordinates; ctx must already have scale(scale, scale) and translate(-camera.x, -camera.y) applied.
// worldViewWidth/worldViewHeight = visible world size (e.g. WORLD_WIDTH, viewHeightWorld).
export function drawBackground(ctx, cameraX, cameraY, worldViewWidth, worldViewHeight, time, pixelSize) {
  const p = pixelSize ?? theme.pixelSize;
  const zones = theme.zones ?? [];
  const water = theme.colors.water ?? {};
  const surfaceStart = zones.find(z => z.id === 'surface')?.startY ?? 0;

  // Sky: cover full visible range when camera is above world (cameraY < 0) to avoid jagged/unpainted band
  const skyTop = Math.min(0, cameraY);
  const skyHeight = surfaceStart - skyTop;
  const grad = ctx.createLinearGradient(0, skyTop, 0, surfaceStart);
  grad.addColorStop(0, '#5eaed6');
  grad.addColorStop(0.6, '#87CEEB');
  grad.addColorStop(1, '#b8dff0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, skyTop, worldViewWidth, skyHeight);

  // Clouds in world space (fixed world y as fraction of surface)
  for (const cloud of CLOUD_POSITIONS) {
    const cloudWorldY = cloud.y * surfaceStart;
    const drift = Math.sin(time * 0.0002 + cloud.x * 0.01) * 15;
    drawCloud(ctx, cloud.x + drift, cloudWorldY, cloud.w, cloud.h, p);
  }

  // Water line at surface
  ctx.fillStyle = '#1a6a8a';
  ctx.fillRect(0, surfaceStart, worldViewWidth, 2 * p);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(0, surfaceStart - p, worldViewWidth, p);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let wx = 0; wx < worldViewWidth; wx += 30) {
    const waveY = Math.sin(time * 0.003 + wx * 0.05) * 2;
    ctx.fillRect(wx, surfaceStart - 2 * p + waveY, 15, p);
  }

  // Water zones (world space)
  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    const color = water[z.id];
    if (!color) continue;
    ctx.fillStyle = color;
    ctx.fillRect(0, z.startY, worldViewWidth, z.endY - z.startY);
    if (i < zones.length - 1) {
      const nextColor = water[zones[i + 1].id];
      ctx.fillStyle = brightenColor(nextColor || color, 0.18);
      ctx.fillRect(0, z.endY - p, worldViewWidth, 2 * p);
    }
  }

  // Sun rays (when view is near surface)
  const surfaceEnd = zones.find(z => z.id === 'surface')?.endY ?? 300;
  if (cameraY < surfaceEnd) {
    const rayAlpha = Math.max(0, 0.25 - (cameraY / 400));
    if (rayAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = rayAlpha;
      for (let i = 0; i < 5; i++) {
        const rx = (i / 5) * worldViewWidth + Math.sin(time * 0.0006 + i * 1.8) * 20;
        const grad = ctx.createLinearGradient(rx, Math.max(0, surfaceStart), rx + 25, surfaceStart + worldViewHeight * 0.45);
        grad.addColorStop(0, 'rgba(255,255,220,0.12)');
        grad.addColorStop(1, 'rgba(255,255,220,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(rx - 12, Math.max(0, surfaceStart), 25, worldViewHeight * 0.45);
      }
      ctx.restore();
    }
  }

  // Boat at world (WORLD_WIDTH/2, surfaceStart)
  drawBoat(ctx, WORLD_WIDTH / 2, surfaceStart, p, time);

  const positions = getCachedPositions();
  const visTop = cameraY - 50;
  const visBottom = cameraY + worldViewHeight + 50;

  for (const sw of positions.seaweed) {
    if (sw.y >= visTop && sw.y <= visBottom)
      drawSeaweed(ctx, sw.x, sw.y, sw.height, time, p);
  }
  for (const co of positions.coral) {
    if (co.y >= visTop && co.y <= visBottom)
      drawCoral(ctx, co.x, co.y, co.colorIndex, p);
  }
  for (const ro of positions.rocks) {
    if (ro.y >= visTop && ro.y <= visBottom)
      drawRock(ctx, ro.x, ro.y, ro.size, p);
  }

  const trenchZone = zones.find(z => z.id === 'trench');
  if (trenchZone) {
    const wreckY = WORLD_HEIGHT - 100;
    if (wreckY > visTop && wreckY < visBottom) {
      drawShipwreck(ctx, WORLD_WIDTH * 0.55, wreckY, p);
    }
  }

  drawOceanFloor(ctx, worldViewWidth, p);

  drawReefWall(ctx, cameraY, worldViewWidth, worldViewHeight, 'left', p);
  drawReefWall(ctx, cameraY, worldViewWidth, worldViewHeight, 'right', p);

  const trenchStart = zones.find(z => z.id === 'trench')?.startY ?? 2000;
  const deepStart = zones.find(z => z.id === 'deep')?.startY ?? 1500;
  const depthCenter = cameraY + worldViewHeight / 2;
  if (depthCenter > deepStart) {
    const factor = Math.min(1, (depthCenter - deepStart) / 600);
    const trenchFactor = depthCenter > trenchStart ? Math.min(1, (depthCenter - trenchStart) / 400) : 0;
    const alpha = factor * 0.1 + trenchFactor * 0.18;
    if (alpha > 0) {
      ctx.fillStyle = `rgba(0,0,10,${alpha})`;
      ctx.fillRect(0, 0, worldViewWidth, worldViewHeight);
    }
  }
}

function drawShipwreck(ctx, x, y, p) {
  const sw = theme.shipwreck ?? {};
  const sc = p * 3;

  ctx.save();
  ctx.translate(x, y);

  // Tilted slightly — listing to one side
  ctx.rotate(-0.08);

  // === HULL ===
  ctx.fillStyle = sw.hullColor ?? '#5C4033';
  ctx.beginPath();
  ctx.moveTo(-50 * sc, 0);
  ctx.lineTo(-55 * sc, -5 * sc);
  ctx.lineTo(-48 * sc, -12 * sc);
  ctx.lineTo(48 * sc, -12 * sc);
  ctx.lineTo(55 * sc, -5 * sc);
  ctx.lineTo(50 * sc, 0);
  ctx.closePath();
  ctx.fill();

  // Hull dark bottom
  ctx.fillStyle = sw.hullDark ?? '#3a2820';
  ctx.beginPath();
  ctx.moveTo(-50 * sc, 0);
  ctx.lineTo(-55 * sc, -5 * sc);
  ctx.lineTo(55 * sc, -5 * sc);
  ctx.lineTo(50 * sc, 0);
  ctx.closePath();
  ctx.fill();

  // Hull planks
  ctx.strokeStyle = sw.outline ?? '#2a1a10';
  ctx.lineWidth = sc * 0.4;
  for (let i = -4; i <= 4; i++) {
    const plankY = -6 * sc + i * 1.2 * sc;
    ctx.beginPath();
    ctx.moveTo(-48 * sc, plankY);
    ctx.lineTo(48 * sc, plankY);
    ctx.stroke();
  }

  // Hull highlight
  ctx.fillStyle = sw.hullLight ?? '#7a5a48';
  ctx.fillRect(-40 * sc, -11 * sc, 30 * sc, 1.5 * sc);
  ctx.fillRect(10 * sc, -11 * sc, 25 * sc, 1.5 * sc);

  // === DECK ===
  ctx.fillStyle = sw.deckColor ?? '#6a4a38';
  ctx.fillRect(-45 * sc, -14 * sc, 90 * sc, 2.5 * sc);

  // Deck railing posts
  ctx.fillStyle = sw.mastColor ?? '#7A5C3E';
  for (let i = -4; i <= 4; i++) {
    ctx.fillRect(i * 10 * sc, -18 * sc, 1.2 * sc, 4 * sc);
  }
  // Railing rope
  ctx.strokeStyle = sw.mastDark ?? '#5a3c2e';
  ctx.lineWidth = sc * 0.5;
  ctx.beginPath();
  ctx.moveTo(-40 * sc, -17 * sc);
  for (let i = -3; i <= 4; i++) {
    const ropeY = -17 * sc + Math.sin(i * 0.8) * 0.8 * sc;
    ctx.lineTo(i * 10 * sc, ropeY);
  }
  ctx.stroke();

  // === BOW (right side — pointed) ===
  ctx.fillStyle = sw.hullColor ?? '#5C4033';
  ctx.beginPath();
  ctx.moveTo(48 * sc, -14 * sc);
  ctx.lineTo(65 * sc, -16 * sc);
  ctx.lineTo(55 * sc, -5 * sc);
  ctx.lineTo(48 * sc, -12 * sc);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = sw.hullDark ?? '#3a2820';
  ctx.beginPath();
  ctx.moveTo(48 * sc, -12 * sc);
  ctx.lineTo(65 * sc, -16 * sc);
  ctx.lineTo(55 * sc, -5 * sc);
  ctx.closePath();
  ctx.fill();

  // Bowsprit
  ctx.strokeStyle = sw.mastColor ?? '#7A5C3E';
  ctx.lineWidth = sc * 1.2;
  ctx.beginPath();
  ctx.moveTo(55 * sc, -14 * sc);
  ctx.lineTo(75 * sc, -20 * sc);
  ctx.stroke();

  // === MAST (broken, tilted) ===
  ctx.fillStyle = sw.mastColor ?? '#7A5C3E';
  ctx.save();
  ctx.translate(-10 * sc, -14 * sc);
  ctx.rotate(0.12);
  ctx.fillRect(-1.5 * sc, -45 * sc, 3 * sc, 45 * sc);

  // Broken top
  ctx.fillStyle = sw.mastDark ?? '#5a3c2e';
  ctx.beginPath();
  ctx.moveTo(-2 * sc, -45 * sc);
  ctx.lineTo(0, -48 * sc);
  ctx.lineTo(2 * sc, -45 * sc);
  ctx.closePath();
  ctx.fill();

  // Crow's nest remains
  ctx.fillRect(-5 * sc, -40 * sc, 10 * sc, 1.5 * sc);
  ctx.fillRect(-5 * sc, -40 * sc, 1 * sc, 4 * sc);
  ctx.fillRect(4 * sc, -40 * sc, 1 * sc, 4 * sc);

  // Cross beam
  ctx.fillRect(-12 * sc, -30 * sc, 24 * sc, 1.5 * sc);

  // Torn sail remnants
  ctx.fillStyle = sw.accentColor ?? '#3A6B35';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-10 * sc, -30 * sc);
  ctx.lineTo(8 * sc, -30 * sc);
  ctx.lineTo(6 * sc, -18 * sc);
  ctx.lineTo(-4 * sc, -22 * sc);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();

  // === SECOND MAST STUMP (shorter, snapped off) ===
  ctx.fillStyle = sw.mastColor ?? '#7A5C3E';
  ctx.save();
  ctx.translate(20 * sc, -14 * sc);
  ctx.rotate(-0.05);
  ctx.fillRect(-1.5 * sc, -20 * sc, 3 * sc, 20 * sc);
  ctx.fillStyle = sw.mastDark ?? '#5a3c2e';
  ctx.beginPath();
  ctx.moveTo(-2.5 * sc, -20 * sc);
  ctx.lineTo(0, -23 * sc);
  ctx.lineTo(2.5 * sc, -20 * sc);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === HOLES IN HULL ===
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(-20 * sc, -7 * sc, 4 * sc, 3 * sc, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(15 * sc, -8 * sc, 3 * sc, 2.5 * sc, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // === BARNACLES / GROWTH ===
  ctx.fillStyle = sw.accentColor ?? '#3A6B35';
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 8; i++) {
    const bx = (-40 + i * 11) * sc;
    const by = (-3 + Math.sin(i * 2.3) * 2) * sc;
    ctx.beginPath();
    ctx.ellipse(bx, by, (2 + Math.sin(i) * 1.5) * sc, (1.5 + Math.cos(i) * 0.8) * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === ANCHOR (hanging off the bow) ===
  ctx.strokeStyle = sw.outline ?? '#2a1a10';
  ctx.lineWidth = sc * 0.8;
  ctx.beginPath();
  ctx.moveTo(58 * sc, -8 * sc);
  ctx.lineTo(58 * sc, 5 * sc);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(55 * sc, 5 * sc);
  ctx.lineTo(58 * sc, 2 * sc);
  ctx.lineTo(61 * sc, 5 * sc);
  ctx.stroke();

  // Outline
  ctx.strokeStyle = sw.outline ?? '#2a1a10';
  ctx.lineWidth = sc * 0.6;
  ctx.beginPath();
  ctx.moveTo(-50 * sc, 0);
  ctx.lineTo(-55 * sc, -5 * sc);
  ctx.lineTo(-48 * sc, -12 * sc);
  ctx.lineTo(-45 * sc, -14 * sc);
  ctx.lineTo(48 * sc, -14 * sc);
  ctx.lineTo(65 * sc, -16 * sc);
  ctx.lineTo(55 * sc, -5 * sc);
  ctx.lineTo(50 * sc, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function brightenColor(hex, amount) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return hex;
  const r = Math.min(255, parseInt(m[1], 16) + 255 * amount);
  const g = Math.min(255, parseInt(m[2], 16) + 255 * amount);
  const b = Math.min(255, parseInt(m[3], 16) + 255 * amount);
  return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
}
