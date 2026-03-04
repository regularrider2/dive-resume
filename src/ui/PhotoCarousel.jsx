import React, { useState, useEffect, useCallback } from 'react';
import theme from '../config/theme.json';

const { colors } = theme;
const { maxWidth, maxHeight } = theme.carousel || { maxWidth: 900, maxHeight: 600 };

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    color: colors.ui.text,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    background: 'none',
    border: 'none',
    color: colors.ui.text,
    fontSize: 24,
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
    zIndex: 10,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    padding: 60,
  },
  imageWrapper: {
    maxWidth,
    maxHeight,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: (opacity) => ({
    maxWidth: '100%',
    maxHeight: maxHeight - 40,
    objectFit: 'contain',
    opacity,
    transition: 'opacity 0.2s ease',
  }),
  caption: {
    marginTop: 12,
    color: colors.ui.text,
    fontFamily: 'monospace',
    fontSize: 14,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.ui.text,
    fontSize: 28,
    cursor: 'pointer',
    userSelect: 'none',
  },
  arrowLeft: { left: 20 },
  arrowRight: { right: 20 },
};

export default function PhotoCarousel({ photos, onClose }) {
  const [index, setIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const validPhotos = photos || [];
  const current = validPhotos[index];
  const total = validPhotos.length;

  useEffect(() => {
    setImageLoaded(false);
  }, [index]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setImageError(false);
    setImageLoaded(false);
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setImageError(false);
    setImageLoaded(false);
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  useEffect(() => {
    if (imageError && total > 1) {
      setIndex((i) => (i + 1) % total);
      setImageError(false);
    }
  }, [imageError, total]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (validPhotos.length === 0) return null;

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
        ✕
      </button>
      <div style={styles.header}>
        {index + 1} / {total}
      </div>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <div
          style={{ ...styles.arrow, ...styles.arrowLeft }}
          onClick={goPrev}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && goPrev()}
        >
          ‹
        </div>
        <div style={styles.imageWrapper}>
          <img
            key={index}
            src={current?.src}
            alt=""
            style={styles.image(imageLoaded ? 1 : 0)}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          {current?.caption && (
            <p style={styles.caption}>{current.caption}</p>
          )}
        </div>
        <div
          style={{ ...styles.arrow, ...styles.arrowRight }}
          onClick={goNext}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && goNext()}
        >
          ›
        </div>
      </div>
    </div>
  );
}
