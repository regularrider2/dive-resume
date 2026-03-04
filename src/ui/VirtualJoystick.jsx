import React from 'react';
import theme from '../config/theme.json';

const { colors } = theme;
const joystickConfig = theme.joystick || { size: 120, offset: 30 };
const defaultSize = joystickConfig.size ?? 120;
const offset = joystickConfig.offset ?? 30;

const styles = {
  container: {
    position: 'fixed',
    bottom: offset,
    left: offset,
    pointerEvents: 'none',
    zIndex: 100,
  },
  base: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    border: `2px solid ${colors.ui.border}`,
  },
  thumb: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.7)',
  },
};

export default function VirtualJoystick({ active, thumbX = 0, thumbY = 0, size: propSize }) {
  const s = propSize ?? defaultSize;
  const half = s / 2;
  const thumbRadius = half * 0.35;
  const tx = Math.max(-half, Math.min(half, thumbX));
  const ty = Math.max(-half, Math.min(half, thumbY));

  return (
    <div style={{ ...styles.container, width: s, height: s }}>
      <div style={{ ...styles.base, width: s, height: s }} />
      <div
        style={{
          ...styles.thumb,
          width: thumbRadius * 2,
          height: thumbRadius * 2,
          left: half - thumbRadius,
          top: half - thumbRadius,
          transform: `translate(${tx}px, ${ty}px)`,
        }}
      />
    </div>
  );
}
