import React, { useEffect } from 'react';
import theme from '../config/theme.json';

const ui = theme.colors.ui;

export default function LobsterRewardOverlay({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,10,30,0.75)',
    }}>
      <div style={{
        maxWidth: 500, width: '90%', padding: '36px 40px',
        background: 'rgba(0,20,50,0.95)',
        border: `2px solid ${ui.border}`,
        borderRadius: 12, fontFamily: 'monospace', textAlign: 'center',
        boxShadow: '0 0 40px rgba(68,136,170,0.4)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🦞</div>
        <h2 style={{ color: ui.title, fontSize: 22, marginBottom: 12, letterSpacing: 1 }}>
          LOBSTER DELIVERED!
        </h2>
        <p style={{ color: ui.text, fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
          [PLACEHOLDER — You brought Larry back to the surface! He's thrilled. Add a personal message here about your lobstering adventures.]
        </p>
        <p style={{ color: ui.prompt, fontSize: 13, marginBottom: 28, fontStyle: 'italic' }}>
          [PLACEHOLDER — Maybe a fun fact about the dive, or a thank-you note from Larry.]
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '12px 36px', fontSize: 15, fontWeight: 'bold',
            fontFamily: 'monospace', color: ui.title,
            background: 'rgba(0,40,80,0.8)',
            border: `2px solid ${ui.border}`, borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Keep Diving
        </button>
      </div>
    </div>
  );
}
