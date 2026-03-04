import React from 'react';
import theme from '../config/theme.json';
import content from '../config/content.json';

const ui = theme.colors.ui;

export default function DecompressionOverlay({ timer, warning, warningTimer }) {
  const warningText = content.decompressionDiver?.warningText ?? 'You need to decompress! Get back down!';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1500,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 60,
    }}>
      {/* Decompression timer bar */}
      <div style={{
        background: warning ? 'rgba(180,20,20,0.95)' : 'rgba(0,20,50,0.85)',
        border: `2px solid ${warning ? '#ff4444' : ui.border}`,
        borderRadius: 12,
        padding: warning ? '16px 36px 20px' : '12px 28px',
        fontFamily: 'monospace',
        textAlign: 'center',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.3s, border-color 0.3s',
        boxShadow: warning ? '0 0 32px rgba(255,50,0,0.5)' : 'none',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: warning ? '#ffcccc' : ui.title,
          letterSpacing: 2,
          marginBottom: 4,
        }}>
          {warning ? '⚠️ WARNING' : 'SAFETY STOP'}
        </div>
        <div style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: warning ? '#ff8888' : ui.text,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {warning ? warningTimer : timer}
        </div>

        {warning && (<>
          {/* GO DOWN text */}
          <div style={{
            fontSize: 30,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 4,
            marginTop: 8,
            textShadow: '0 0 14px rgba(255,80,0,0.9)',
            animation: 'decomp-pulse 0.7s ease-in-out infinite alternate',
          }}>
            GO DOWN
          </div>

          {/* Big arrow */}
          <div style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'center',
            animation: 'decomp-bounce 0.6s ease-in-out infinite alternate',
          }}>
            <svg width="56" height="68" viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* stem */}
              <rect x="20" y="4" width="16" height="38" rx="4" fill="#ff3300" stroke="white" strokeWidth="2"/>
              {/* arrowhead */}
              <polygon points="4,42 28,66 52,42" fill="#ff3300" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ fontSize: 12, color: '#ffcccc', marginTop: 8 }}>
            {warningText}
          </div>
        </>)}
      </div>

      {/* Dive Master message (only when not warning) */}
      {!warning && (
        <div style={{
          marginTop: 10,
          maxWidth: 380,
          padding: '12px 16px',
          background: 'rgba(0,20,50,0.85)',
          border: `1px solid ${ui.border}`,
          borderRadius: 8,
          fontFamily: 'monospace',
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: ui.title, marginBottom: 6 }}>
            {content.decompressionDiver?.name ?? 'Dive Master'}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: ui.text, margin: 0 }}>
            {content.decompressionDiver?.message ?? ''}
          </p>
        </div>
      )}

      <style>{`
        @keyframes decomp-bounce {
          from { transform: translateY(0px); }
          to   { transform: translateY(10px); }
        }
        @keyframes decomp-pulse {
          from { opacity: 1; }
          to   { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
