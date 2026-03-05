import React from 'react';
import theme from '../config/theme.json';

const { colors } = theme;
const joystickConfig = theme.joystick || { size: 120, offset: 30 };
const defaultSize = joystickConfig.size ?? 120;
const offset = joystickConfig.offset ?? 30;

const arrowStyle = {
  position: 'absolute',
  color: 'rgba(255,255,255,0.35)',
  fontSize: 16,
  fontFamily: 'monospace',
  fontWeight: 'bold',
  lineHeight: 1,
  pointerEvents: 'none',
  userSelect: 'none',
};

export default function VirtualJoystick({ active, thumbX = 0, thumbY = 0, size: propSize }) {
  const s = propSize ?? defaultSize;
  const half = s / 2;
  const thumbRadius = half * 0.35;
  const tx = Math.max(-half, Math.min(half, thumbX));
  const ty = Math.max(-half, Math.min(half, thumbY));

  return (
    <div style={{ position: 'fixed', bottom: offset, right: offset, width: s, height: s, pointerEvents: 'none', zIndex: 100 }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, width: s, height: s,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        border: `2px solid ${colors.ui.border}`,
        boxShadow: 'inset 0 0 12px rgba(255,255,255,0.06)',
      }} />

      {/* Directional arrows */}
      <span style={{ ...arrowStyle, top: 6, left: half - 5 }}>▲</span>
      <span style={{ ...arrowStyle, bottom: 6, left: half - 5 }}>▼</span>
      <span style={{ ...arrowStyle, left: 6, top: half - 8 }}>◀</span>
      <span style={{ ...arrowStyle, right: 6, top: half - 8 }}>▶</span>

      <div
        style={{
          position: 'absolute',
          borderRadius: '50%',
          background: active
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(255,255,255,0.5)',
          boxShadow: active ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
          width: thumbRadius * 2,
          height: thumbRadius * 2,
          left: half - thumbRadius,
          top: half - thumbRadius,
          transform: `translate(${tx}px, ${ty}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out',
        }}
      />
    </div>
  );
}
