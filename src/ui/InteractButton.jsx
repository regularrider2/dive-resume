import React from 'react';
import theme from '../config/theme.json';

const { colors } = theme;

const styles = {
  button: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    padding: '12px 20px',
    background: colors.ui.background,
    border: `1px solid ${colors.ui.border}`,
    borderRadius: 8,
    color: colors.ui.text,
    fontFamily: 'monospace',
    fontSize: 14,
    cursor: 'pointer',
    zIndex: 100,
  },
};

export default function InteractButton({ visible, onInteract }) {
  if (!visible) return null;

  return (
    <div
      style={styles.button}
      onTouchStart={(e) => {
        e.preventDefault();
        onInteract?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onInteract?.()}
    >
      TAP TO INTERACT
    </div>
  );
}
