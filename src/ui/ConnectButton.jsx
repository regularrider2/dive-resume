import React, { useState } from 'react';
import content from '../config/content.json';
import theme from '../config/theme.json';

const ui = theme.colors.ui;
const connectData = content.connectButton ?? { label: "Let's Connect", links: [] };

export default function ConnectButton({ onCtaClick, onConnectOpened }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', top: 10, right: 12, zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button
        onClick={() => {
          setOpen(prev => {
            if (!prev) onConnectOpened?.();
            return !prev;
          });
        }}
        style={{
          padding: '8px 16px',
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 'bold',
          color: ui.title,
          background: 'rgba(0,20,50,0.8)',
          border: `1px solid ${ui.border}`,
          borderRadius: 6,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          letterSpacing: 0.5,
        }}
      >
        {connectData.label}
      </button>
      <a
        href={content.meta?.resumePageUrl ?? '#'}
        target="_blank"
        rel="noreferrer"
        onClick={() => onCtaClick?.('resume_view')}
        style={{
          padding: '8px 16px',
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 'bold',
          color: ui.title,
          background: 'rgba(0,20,50,0.8)',
          border: `1px solid ${ui.border}`,
          borderRadius: 6,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          letterSpacing: 0.5,
          textDecoration: 'none',
          display: 'block',
        }}
      >
        View Resume
      </a>

      {open && (
        <div style={{
          position: 'relative',
          right: 0,
          minWidth: 180,
          background: 'rgba(0,20,50,0.95)',
          border: `1px solid ${ui.border}`,
          borderRadius: 8,
          padding: 8,
          fontFamily: 'monospace',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {connectData.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target={link.url.startsWith('mailto:') || link.url.startsWith('tel:') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={() => onCtaClick?.(link.type ?? link.label)}
              style={{
                display: 'block',
                padding: '10px 14px',
                color: ui.text,
                textDecoration: 'none',
                fontSize: 14,
                borderRadius: 4,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
