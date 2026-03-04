import React, { useEffect, useRef } from 'react';
import content from '../config/content.json';
import { drawDiver } from '../rendering/diver.js';
import { drawShark } from '../rendering/creatures.js';
import { drawLobster } from '../rendering/lobster.js';

function drawTitleFish(ctx, x, y, dir, color, size) {
  ctx.save();
  ctx.translate(x, y);
  if (dir === -1) ctx.scale(-1, 1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.4, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, 0);
  ctx.lineTo(-size * 2.2, -size * 0.9);
  ctx.lineTo(-size * 2.2, size * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(size * 0.7, -size * 0.1, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(size * 0.75, -size * 0.1, size * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTitleBubble(ctx, x, y, r) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = 'rgba(140,210,255,0.9)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(180,230,255,0.1)';
  ctx.fill();
  ctx.restore();
}

export default function TitleOverlay({ onStart, onCtaClick }) {
  const bgCanvasRef = useRef(null);
  const diverCanvasRef = useRef(null);
  const rafRef = useRef(null);
  const fishRef = useRef([]);

  // Inject Google Fonts once, never remove (other screens use these fonts too)
  useEffect(() => {
    if (!document.querySelector('link[data-dive-fonts]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@300;400;500&display=swap';
      link.setAttribute('data-dive-fonts', '1');
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    const diverCanvas = diverCanvasRef.current;
    if (!canvas || !diverCanvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      diverCanvas.width = window.innerWidth;
      diverCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const FISH_COLORS = ['#f97316', '#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#7dd3fc', '#a78bfa'];
    fishRef.current = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.15 + Math.random() * canvas.height * 0.8,
      speed: 0.35 + Math.random() * 0.7,
      dir: Math.random() < 0.5 ? 1 : -1,
      color: FISH_COLORS[i % FISH_COLORS.length],
      size: 5 + Math.random() * 12,
      wavePhase: Math.random() * Math.PI * 2,
      opacity: 0.55 + Math.random() * 0.45,
    }));

    const bubbles = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.5 + Math.random() * 5,
      speed: 0.15 + Math.random() * 0.45,
    }));

    // Diver Y planes: spread across mid-screen, never overlapping shark (0.88) or lobster (0.94)
    // Each pass picks a new random plane from this list
    const DIVER_Y_PLANES = [0.38, 0.48, 0.58, 0.67, 0.76];
    let diverDir = Math.random() < 0.5 ? 1 : -1;
    let diverYFrac = DIVER_Y_PLANES[Math.floor(Math.random() * DIVER_Y_PLANES.length)];
    let diverX = diverDir === 1 ? -160 : canvas.width + 160;
    let diverFrame = 0;
    let animTimer = 0;
    let lastTime = 0;

    // Shark — fixed at bottom, well below all diver planes
    const shark = { x: canvas.width * 0.75, y: canvas.height * 0.88, speed: 0.55, dir: -1 };
    // Lobster — bottom strip
    const lobster = { x: canvas.width * 0.2, y: canvas.height * 0.94, speed: 0.3, dir: 1 };

    const kelp = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 6) * canvas.width * 1.4 - canvas.width * 0.1,
      segments: 7 + Math.floor(Math.random() * 5),
      phase: Math.random() * Math.PI * 2,
    }));

    const loop = (ts) => {
      const dt = lastTime ? Math.min((ts - lastTime) / 16, 3) : 1;
      lastTime = ts;
      animTimer += dt * 16;
      if (animTimer > 300) { animTimer = 0; diverFrame = diverFrame === 0 ? 1 : 0; }

      const w = canvas.width;
      const h = canvas.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0,    '#061628');
      grad.addColorStop(0.25, '#0a2544');
      grad.addColorStop(0.55, '#0d3560');
      grad.addColorStop(0.8,  '#082540');
      grad.addColorStop(1,    '#020d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.055;
      for (let i = 0; i < 5; i++) {
        const lx = w * (0.08 + i * 0.22) + Math.sin(ts * 0.00035 + i * 1.3) * 22;
        const lg = ctx.createLinearGradient(lx, 0, lx + 40, h * 0.75);
        lg.addColorStop(0,   'rgba(120,210,255,1)');
        lg.addColorStop(0.5, 'rgba(80,160,230,0.4)');
        lg.addColorStop(1,   'rgba(40,100,180,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(lx - 12, 0);
        ctx.lineTo(lx + 55, 0);
        ctx.lineTo(lx + 30 + Math.sin(ts * 0.0004 + i) * 15, h * 0.75);
        ctx.lineTo(lx - 30, h * 0.75);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.18;
      for (const k of kelp) {
        let kx = k.x, ky = h;
        ctx.strokeStyle = '#1a5a3a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        for (let s = 0; s < k.segments; s++) {
          const sway = Math.sin(ts * 0.0008 + k.phase + s * 0.6) * (12 + s * 2);
          kx += sway;
          ky -= h * 0.06;
          ctx.lineTo(kx, ky);
        }
        ctx.stroke();
      }
      ctx.restore();

      for (const b of bubbles) {
        b.y -= b.speed * dt;
        b.x += Math.sin(ts * 0.0009 + b.r) * 0.25;
        if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w; }
        drawTitleBubble(ctx, b.x, b.y, b.r);
      }

      for (const f of fishRef.current) {
        f.x += f.dir * f.speed * dt;
        f.y += Math.sin(ts * 0.001 + f.wavePhase) * 0.28;
        if (f.x > w + 100) { f.x = -100; f.dir = 1; }
        if (f.x < -100)    { f.x = w + 100; f.dir = -1; }
        ctx.save();
        ctx.globalAlpha = f.opacity;
        drawTitleFish(ctx, f.x, f.y, f.dir, f.color, f.size);
        ctx.restore();
      }

      // Shark
      shark.x += shark.dir * shark.speed * dt;
      if (shark.x < -300) { shark.x = w + 300; shark.dir = -1; }
      if (shark.x > w + 300) { shark.x = -300; shark.dir = 1; }
      const sharkY = shark.y + Math.sin(ts * 0.0005) * 10;
      ctx.save();
      ctx.globalAlpha = 0.82;
      drawShark(ctx, shark.x, sharkY, shark.dir, 3.5);
      ctx.restore();

      // Lobster
      lobster.x += lobster.dir * lobster.speed * dt;
      if (lobster.x > w + 120) { lobster.x = -120; lobster.dir = 1; }
      if (lobster.x < -120) { lobster.x = w + 120; lobster.dir = -1; }
      const lobsterY = lobster.y + Math.sin(ts * 0.0009 + 1.2) * 8;
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawLobster(ctx, lobster.x, lobsterY, false, diverFrame, 0, 1.4, lobster.dir, true);
      ctx.restore();

      diverX += diverDir * 0.9 * dt;
      // Wrap: pick a new random plane + direction each pass
      if (diverDir === 1 && diverX > w + 220) {
        diverDir = Math.random() < 0.5 ? 1 : -1;
        diverX = diverDir === 1 ? -220 : w + 220;
        diverYFrac = DIVER_Y_PLANES[Math.floor(Math.random() * DIVER_Y_PLANES.length)];
      } else if (diverDir === -1 && diverX < -220) {
        diverDir = Math.random() < 0.5 ? 1 : -1;
        diverX = diverDir === 1 ? -220 : w + 220;
        diverYFrac = DIVER_Y_PLANES[Math.floor(Math.random() * DIVER_Y_PLANES.length)];
      }
      const diverY = h * diverYFrac + Math.sin(ts * 0.0007) * 8;

      // Draw diver on the TOP canvas (above the card) — always fully visible
      const dctx = diverCanvas.getContext('2d');
      dctx.clearRect(0, 0, w, h);

      // Diver sprite
      dctx.save();
      dctx.imageSmoothingEnabled = false;
      drawDiver(dctx, diverX - 56, diverY - 28, diverDir, diverFrame, 2);
      dctx.restore();

      // Rotating speech bubble above diver
      const DIVER_QUIPS = [
        '🤿 Hi! I\'m looking for David\'s career.',
        '🤿 Apparently he shipped AI to tens of millions of people.',
        '🤿 Find the lobster. Bring it back.',
        '🤿 Deeper = more interesting.',
        '🤿 Something about squirrels and crows? Let\'s find out.',
      ];
      const QUIP_CYCLE = 3500;
      const quipIdx = Math.floor(ts / QUIP_CYCLE) % DIVER_QUIPS.length;
      const quipPhase = (ts % QUIP_CYCLE) / QUIP_CYCLE;
      const quipAlpha = quipPhase < 0.08 ? quipPhase / 0.08
                      : quipPhase > 0.85 ? (1 - quipPhase) / 0.15
                      : 1;
      const quip = DIVER_QUIPS[quipIdx];
      const qFontSize = 12;
      dctx.font = `bold ${qFontSize}px monospace`;
      const qTw = dctx.measureText(quip).width;
      const qPadX = 10, qPadY = 7;
      const qW = qTw + qPadX * 2;
      const qH = qFontSize + qPadY * 2;
      const qX = diverX - qW / 2;
      const qY = diverY - 48 - qH;
      dctx.save();
      dctx.globalAlpha = quipAlpha * 0.92;
      dctx.fillStyle = 'rgba(255,255,255,0.95)';
      dctx.beginPath();
      if (typeof dctx.roundRect === 'function') {
        dctx.roundRect(qX, qY, qW, qH, 7);
      } else {
        dctx.rect(qX, qY, qW, qH);
      }
      dctx.fill();
      dctx.strokeStyle = '#1a4080';
      dctx.lineWidth = 1.5;
      dctx.beginPath();
      if (typeof dctx.roundRect === 'function') {
        dctx.roundRect(qX, qY, qW, qH, 7);
      } else {
        dctx.rect(qX, qY, qW, qH);
      }
      dctx.stroke();
      dctx.fillStyle = 'rgba(255,255,255,0.95)';
      dctx.beginPath();
      dctx.moveTo(diverX - 6, qY + qH);
      dctx.lineTo(diverX + 6, qY + qH);
      dctx.lineTo(diverX + 2, qY + qH + 10);
      dctx.closePath();
      dctx.fill();
      dctx.strokeStyle = '#1a4080';
      dctx.lineWidth = 1.5;
      dctx.beginPath();
      dctx.moveTo(diverX - 6, qY + qH);
      dctx.lineTo(diverX + 2, qY + qH + 10);
      dctx.lineTo(diverX + 6, qY + qH);
      dctx.stroke();
      dctx.fillStyle = '#1a3060';
      dctx.font = `bold ${qFontSize}px monospace`;
      dctx.textAlign = 'center';
      dctx.textBaseline = 'middle';
      dctx.fillText(quip, diverX, qY + qH / 2);
      dctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, pointerEvents: 'auto',
    }}>
      <style>{`
        @keyframes title-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(56,189,248,0.5), 0 0 60px rgba(56,189,248,0.2); }
          50%       { text-shadow: 0 0 35px rgba(56,189,248,0.8), 0 0 80px rgba(56,189,248,0.35); }
        }
        @keyframes card-rise {
          0%   { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes btn-glow {
          0%, 100% { box-shadow: 0 4px 24px rgba(56,189,248,0.4), 0 1px 0 rgba(255,255,255,0.25) inset; }
          50%       { box-shadow: 0 4px 36px rgba(56,189,248,0.65), 0 1px 0 rgba(255,255,255,0.3) inset; }
        }
      `}</style>
      <canvas ref={bgCanvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
      }} />
      <canvas ref={diverCanvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }} />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2,8,20,0.55) 100%)',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 480, width: '92%',
        padding: '40px 44px 36px',
        textAlign: 'center',
        background: 'linear-gradient(160deg, rgba(6,24,50,0.93) 0%, rgba(4,16,36,0.97) 100%)',
        borderRadius: 20,
        border: '1px solid rgba(56,189,248,0.22)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 0 1px rgba(56,189,248,0.06), 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        animation: 'card-rise 0.7s cubic-bezier(0.22,1,0.36,1) both',
      }}>

        {/* Eyebrow */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: '0.35em',
          color: 'rgba(125,211,252,0.6)',
          textTransform: 'uppercase',
          marginBottom: 12,
          animation: 'fade-up 0.5s 0.1s both',
        }}>
          Interactive Resume
        </p>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: 'clamp(30px, 5.5vw, 50px)',
          color: '#e0f2fe',
          letterSpacing: '0.06em',
          lineHeight: 1.1,
          margin: '0 0 8px',
          animation: 'title-pulse 4s ease-in-out infinite, fade-up 0.5s 0.15s both',
        }}>
          DEEP DIVE
        </h1>

        {/* Author */}
        <h2 style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 600,
          fontSize: 'clamp(17px, 3vw, 26px)',
          color: 'rgba(125,211,252,0.85)',
          letterSpacing: '0.12em',
          margin: '0 0 28px',
          animation: 'fade-up 0.5s 0.22s both',
        }}>
          David Gordon
        </h2>

        {/* Two-column hook */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 28,
          animation: 'fade-up 0.5s 0.3s both',
        }}>
          {/* Resume side */}
          <div style={{
            padding: '14px 14px',
            background: 'rgba(56,189,248,0.07)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 11,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: 'rgba(186,230,253,0.9)',
              margin: '0 0 4px',
            }}>
              Interactive Resume
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: 'rgba(186,230,253,0.45)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Swim over glowing items to discover his work
            </p>
          </div>

          {/* Lobster side */}
          <div style={{
            padding: '14px 14px',
            background: 'rgba(255,100,30,0.08)',
            border: '1px solid rgba(255,120,50,0.25)',
            borderRadius: 11,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🦞</div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: 'rgba(255,200,150,0.95)',
              margin: '0 0 4px',
            }}>
              Find the Lobster
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: 'rgba(186,230,253,0.45)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              It's deep in the trench. Bring it back to the boat.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ animation: 'fade-up 0.5s 0.38s both' }}>

          {/* PRIMARY: Dive In */}
          <button
            onClick={onStart}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: 700,
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.18em',
              color: '#0a1628',
              background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)',
              border: 'none',
              borderRadius: 11,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              animation: 'btn-glow 3s ease-in-out infinite',
              marginBottom: 12,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 50%, #38bdf8 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🤿 DIVE IN
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.15)' }} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: 'rgba(125,211,252,0.35)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.15)' }} />
          </div>

          {/* SECONDARY: View Resume */}
          <a
            href={content.meta.resumePageUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            onClick={() => onCtaClick?.('resume_view')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 24px',
              fontSize: 'clamp(12px, 1.6vw, 13px)',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.03em',
              color: 'rgba(186,230,253,0.85)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(56,189,248,0.25)',
              borderRadius: 10,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(56,189,248,0.10)';
              e.currentTarget.style.borderColor = 'rgba(125,211,252,0.5)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 15 }}>📄</span>
            View Resume
          </a>
        </div>
      </div>
    </div>
  );
}
