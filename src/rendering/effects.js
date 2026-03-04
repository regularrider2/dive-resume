import theme from '../config/theme.json';

export function createBubbleParticle(x, y) {
  const speed = theme.particles?.bubbleSpeed ?? 0.8;
  const life = theme.particles?.bubbleLifetime ?? 2000;
  const angle = Math.random() * Math.PI * 2;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: -speed - Math.random() * 0.5,
    life: life,
    maxLife: life,
    size: 1 + Math.random() * 2,
  };
}

export function createDiscoveryBurst(x, y, count) {
  const c = count ?? (theme.particles?.discoveryBurstCount ?? 12);
  const particles = [];
  for (let i = 0; i < c; i++) {
    const angle = (i / c) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 800,
      maxLife: 800,
      size: 1 + Math.random(),
    });
  }
  return particles;
}

export function updateParticles(particles, dt) {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    }))
    .filter(p => p.life > 0);
}

export function drawParticles(ctx, particles, pixelSize) {
  const p = pixelSize ?? theme.pixelSize;
  const glowColor = theme.colors.treasureGlow;

  for (const part of particles) {
    const alpha = part.life / part.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size * p, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawScreenFlash(ctx, width, height, opacity) {
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.fillRect(0, 0, width, height);
}
