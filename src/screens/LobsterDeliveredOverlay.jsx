import React, { useEffect, useRef } from 'react';
import theme from '../config/theme.json';

const ui = theme.colors.ui;

// Deterministic pseudo-random from seed so confetti is stable
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const CONFETTI_COUNT = 28;
const CONFETTI_COLORS = ['#FFD700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1', '#f9ca24', '#ff9ff3'];

function Confetti() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const rand = seededRand(42);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    particles.current = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      x: rand() * W,
      y: -20 - rand() * 80,
      vx: (rand() - 0.5) * 2.5,
      vy: 1.5 + rand() * 2.5,
      rot: rand() * Math.PI * 2,
      rotV: (rand() - 0.5) * 0.15,
      w: 8 + rand() * 10,
      h: 5 + rand() * 7,
      color: CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)],
      wobble: rand() * Math.PI * 2,
      wobbleV: 0.06 + rand() * 0.06,
    }));

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      particles.current.forEach(p => {
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.y += p.vy;
        p.rot += p.rotV;
        p.wobble += p.wobbleV;
        p.vy = Math.min(p.vy + 0.04, 4); // gravity
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.88;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', borderRadius: 16,
      }}
    />
  );
}


const styles = `
@keyframes lobsterBounce {
  0%, 100% { transform: translateY(0) rotate(-8deg) scale(1.05); }
  25%       { transform: translateY(-18px) rotate(8deg) scale(1.1); }
  50%       { transform: translateY(-8px) rotate(-4deg) scale(1.08); }
  75%       { transform: translateY(-22px) rotate(10deg) scale(1.12); }
}
@keyframes deliveredSlideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes deliveredPulse {
  0%, 100% { box-shadow: 0 0 30px rgba(255,100,50,0.35), 0 8px 40px rgba(0,0,0,0.5); }
  50%       { box-shadow: 0 0 55px rgba(255,160,50,0.55), 0 8px 40px rgba(0,0,0,0.5); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

export default function LobsterDeliveredOverlay({ allItemsFound, onClose }) {

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <style>{styles}</style>
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(ellipse at center, rgba(60,20,0,0.82) 0%, rgba(0,5,20,0.88) 100%)',
        }}
      >
        <div style={{
          position: 'relative',
          maxWidth: 480, width: '90%',
          padding: '40px 36px 32px',
          background: 'linear-gradient(160deg, rgba(30,12,0,0.97) 0%, rgba(10,25,55,0.97) 100%)',
          border: '2px solid rgba(255,140,50,0.5)',
          borderRadius: 16,
          fontFamily: 'monospace',
          textAlign: 'center',
          animation: 'deliveredSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) both, deliveredPulse 2.5s ease-in-out 0.5s infinite',
          overflow: 'hidden',
        }}>
          <Confetti />

          {/* Dancing lobster */}
          <div style={{
            fontSize: 72,
            marginBottom: 8,
            display: 'inline-block',
            animation: 'lobsterBounce 0.9s ease-in-out infinite',
            filter: 'drop-shadow(0 0 12px rgba(255,120,50,0.7))',
            userSelect: 'none',
          }}>
            🦞
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 26,
            fontWeight: 'bold',
            letterSpacing: 2,
            marginBottom: 8,
            background: 'linear-gradient(90deg, #FFD700, #ff8c42, #FFD700)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 2s linear infinite',
          }}>
              LOBSTER CAUGHT! 🍽️
          </h2>

          {/* Message */}
          <p style={{
            color: allItemsFound ? '#FFD700' : 'rgba(160,200,255,0.85)',
            fontSize: 14,
            lineHeight: 1.65,
            marginBottom: allItemsFound ? 28 : 12,
            fontStyle: 'italic',
            minHeight: 42,
          }}>
            {allItemsFound
              ? '🏆 You got them all! A true lobsterman. Dinner for the whole boat.'
              : "There's more down there. Keep diving."}
          </p>

          {/* Tank swap note — only when items remain */}
          {!allItemsFound && (
            <p style={{
              color: '#7dd3fc',
              fontSize: 12,
              lineHeight: 1.5,
              marginBottom: 28,
              fontStyle: 'normal',
            }}>
              The boat crew swapped your tank — you're good to keep diving.
            </p>
          )}

          {/* Button */}
          <button
            onClick={onClose}
            style={{
              padding: '13px 40px',
              fontSize: 15,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#FFD700',
              background: 'rgba(255,120,40,0.18)',
              border: '2px solid rgba(255,140,50,0.6)',
              borderRadius: 9,
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,140,50,0.3)';
              e.currentTarget.style.borderColor = 'rgba(255,200,80,0.9)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,120,40,0.18)';
              e.currentTarget.style.borderColor = 'rgba(255,140,50,0.6)';
            }}
          >
            Keep Diving
          </button>

          <p style={{ color: 'rgba(120,150,200,0.5)', fontSize: 11, marginTop: 14 }}>
            ESC or SPACE to continue
          </p>
        </div>
      </div>
    </>
  );
}
