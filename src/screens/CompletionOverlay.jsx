import React, { useEffect, useRef } from 'react';
import theme from '../config/theme.json';
import content from '../config/content.json';

const { colors } = theme;
const ui = colors.ui;

const CTA_ICONS = { email: '✉', linkedin: '🔗', phone: '📞' };

const CONFETTI_COLORS = ['#FFD700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1', '#f9ca24', '#ff9ff3'];

function Confetti() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let s = 42;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const particles = Array.from({ length: 28 }, () => ({
      x: rand() * W, y: -20 - rand() * 80,
      vx: (rand() - 0.5) * 2.5, vy: 1.5 + rand() * 2.5,
      rot: rand() * Math.PI * 2, rotV: (rand() - 0.5) * 0.15,
      w: 8 + rand() * 10, h: 5 + rand() * 7,
      color: CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)],
      wobble: rand() * Math.PI * 2, wobbleV: 0.06 + rand() * 0.06,
    }));
    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx + Math.sin(p.wobble) * 0.8; p.y += p.vy;
        p.rot += p.rotV; p.wobble += p.wobbleV;
        p.vy = Math.min(p.vy + 0.04, 4);
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.globalAlpha = 0.88;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: 8 }} />;
}

const lobsterStyles = `
@keyframes lobsterBounceInline {
  0%, 100% { transform: translateY(0) rotate(-6deg) scale(1.05); }
  25%       { transform: translateY(-14px) rotate(6deg) scale(1.1); }
  50%       { transform: translateY(-6px) rotate(-3deg) scale(1.07); }
  75%       { transform: translateY(-18px) rotate(8deg) scale(1.12); }
}
@keyframes shimmerGold {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

export default function CompletionOverlay({ onDiveAgain, onKeepExploring, onCtaClick, withLobster }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onDiveAgain();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDiveAgain]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onDiveAgain();
  };

  const handleCta = (link) => {
    onCtaClick?.(link.type);
    if (link.url.startsWith('mailto:') || link.url.startsWith('tel:')) {
      window.location.href = link.url;
    } else {
      window.open(link.url, '_blank');
    }
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  };

  const cardStyle = {
    maxWidth: 500,
    width: '90%',
    padding: 28,
    background: ui.background,
    border: `1px solid ${ui.border}`,
    borderRadius: 8,
    fontFamily: 'monospace',
    color: ui.text,
    textAlign: 'center',
  };

  const headingStyle = {
    fontSize: 20,
    fontWeight: 'bold',
    color: ui.title,
    marginBottom: 24,
    lineHeight: 1.4,
    textAlign: 'left',
  };

  const ctaGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 16,
  };

  const ctaButtonStyle = {
    padding: '12px 16px',
    fontSize: 15,
    fontFamily: 'monospace',
    color: ui.title,
    background: ui.border,
    border: `1px solid ${ui.title}`,
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    textDecoration: 'none',
  };

  const actionButtonStyle = {
    padding: '10px 24px',
    fontSize: 14,
    fontFamily: 'monospace',
    color: ui.text,
    background: ui.background,
    border: `1px solid ${ui.border}`,
    borderRadius: 6,
    cursor: 'pointer',
  };

  return (
    <>
      {withLobster && <style>{lobsterStyles}</style>}
      <div style={overlayStyle} onClick={handleBackdropClick}>
        <div style={{ ...cardStyle, position: 'relative', overflow: withLobster ? 'hidden' : 'visible' }} onClick={(e) => e.stopPropagation()}>
          {withLobster && <Confetti />}

          {/* Lobster celebration header — only when completing lobster + items simultaneously */}
          {withLobster && (
            <div style={{
              textAlign: 'center',
              marginBottom: 20,
              paddingBottom: 18,
              borderBottom: '1px solid rgba(255,140,50,0.25)',
              position: 'relative',
            }}>
              <div style={{
                fontSize: 52, display: 'inline-block',
                animation: 'lobsterBounceInline 0.9s ease-in-out infinite',
                filter: 'drop-shadow(0 0 10px rgba(255,120,50,0.6))',
              }}>🦞</div>
              <div style={{
                fontSize: 15, fontWeight: 'bold', letterSpacing: 1,
                background: 'linear-gradient(90deg, #FFD700, #ff8c42, #FFD700)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmerGold 2s linear infinite',
                marginTop: 6,
              }}>
                LOBSTER CAUGHT! 🍽️
              </div>
              <div style={{ fontSize: 12, color: 'rgba(200,180,140,0.7)', marginTop: 4, fontStyle: 'italic' }}>
                Everything found. Lobster caught. Dinner and a resume.
              </div>
            </div>
          )}

          <h2 style={headingStyle}>{content.completion.message}</h2>
          <div style={ctaGridStyle}>
            {content.completion.ctaLinks.map((link) => (
              <button
                key={link.type}
                style={ctaButtonStyle}
                onClick={() => handleCta(link)}
              >
                <span>{CTA_ICONS[link.type] ?? '•'}</span>
                {link.label}
              </button>
            ))}
            <a
              href={content.meta?.resumePageUrl ?? '#'}
              target="_blank"
              rel="noreferrer"
              onClick={() => onCtaClick?.('resume_view')}
              style={ctaButtonStyle}
            >
              <span>📄</span>
              View Resume
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={actionButtonStyle} onClick={onDiveAgain}>
              {content.completion.diveAgainLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
