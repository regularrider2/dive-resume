import React from 'react';
import theme from '../config/theme.json';

const { colors } = theme;
const joystickConfig = theme.joystick || { size: 120, offset: 30 };
const defaultSize = joystickConfig.size ?? 120;
const offset = joystickConfig.offset ?? 30;

const HIGHLIGHT_GLOW = 'rgba(56,189,248,0.7)';

export default function VirtualJoystick({ active, thumbX = 0, thumbY = 0, size: propSize, highlight = false }) {
  const s = propSize ?? defaultSize;
  const half = s / 2;
  const thumbRadius = half * 0.35;
  const tx = Math.max(-half, Math.min(half, thumbX));
  const ty = Math.max(-half, Math.min(half, thumbY));

  // Before first touch: high-contrast bright cyan/white; after: subtle (fades via transition)
  const ringBg = highlight ? 'rgba(56,189,248,0.55)' : 'rgba(255,255,255,0.12)';
  const ringBorder = highlight ? '#bae6fd' : colors.ui.border;
  const arrowColor = highlight ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.35)';
  const thumbIdleBg = highlight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)';
  const ringClass = highlight ? 'joystick-ring joystick-ring--highlight' : 'joystick-ring';

  return (
    <div style={{ position: 'fixed', bottom: offset, right: offset, width: s, height: s, pointerEvents: 'none', zIndex: 100 }}>
      <style>{`
        .joystick-ring {
          transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .joystick-ring--highlight {
          animation: joystick-pulse 1.8s ease-in-out infinite;
        }
        @keyframes joystick-pulse {
          0%, 100% { box-shadow: inset 0 0 12px rgba(255,255,255,0.06), 0 0 16px ${HIGHLIGHT_GLOW}, 0 0 32px rgba(56,189,248,0.25); }
          50%      { box-shadow: inset 0 0 14px rgba(255,255,255,0.08), 0 0 28px ${HIGHLIGHT_GLOW}, 0 0 48px rgba(56,189,248,0.4); }
        }
        .joystick-label {
          animation: joystick-bounce 2s ease-in-out infinite;
        }
        @keyframes joystick-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(-4px); opacity: 0.9; }
        }
      `}</style>

      {highlight && (
        <div style={{ position: 'absolute', left: '50%', bottom: '100%', marginBottom: 10, transform: 'translateX(-50%)' }}>
          <div
            className="joystick-label"
            style={{
              padding: '6px 12px',
              background: 'rgba(6,24,50,0.9)',
              border: '1px solid rgba(56,189,248,0.5)',
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#7dd3fc',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            Drag to swim
          </div>
        </div>
      )}

      <div
        className={ringClass}
        style={{
          position: 'absolute', left: 0, top: 0, width: s, height: s,
          borderRadius: '50%',
          background: ringBg,
          border: `2px solid ${ringBorder}`,
          boxShadow: highlight ? undefined : 'inset 0 0 12px rgba(255,255,255,0.06)',
        }}
      />

      {/* Directional arrows — transition fades to subtle when highlight turns off */}
      <span style={{ position: 'absolute', color: arrowColor, fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', top: 6, left: half - 5, transition: 'color 0.5s ease' }}>▲</span>
      <span style={{ position: 'absolute', color: arrowColor, fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', bottom: 6, left: half - 5, transition: 'color 0.5s ease' }}>▼</span>
      <span style={{ position: 'absolute', color: arrowColor, fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', left: 6, top: half - 8, transition: 'color 0.5s ease' }}>◀</span>
      <span style={{ position: 'absolute', color: arrowColor, fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', right: 6, top: half - 8, transition: 'color 0.5s ease' }}>▶</span>

      <div
        style={{
          position: 'absolute',
          borderRadius: '50%',
          background: active ? 'rgba(255,255,255,0.85)' : thumbIdleBg,
          boxShadow: active ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
          width: thumbRadius * 2,
          height: thumbRadius * 2,
          left: half - thumbRadius,
          top: half - thumbRadius,
          transform: `translate(${tx}px, ${ty}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out, background 0.5s ease',
        }}
      />
    </div>
  );
}
