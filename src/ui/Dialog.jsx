import React, { useEffect } from 'react';
import theme from '../config/theme.json';

const { colors } = theme;

const baseStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  box: {
    maxWidth: 500,
    width: '90%',
    padding: 24,
    background: colors.ui.background,
    border: `1px solid ${colors.ui.border}`,
    borderRadius: 8,
    position: 'relative',
    fontFamily: 'monospace',
    color: colors.ui.text,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'none',
    border: 'none',
    color: colors.ui.text,
    fontSize: 20,
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  title: {
    color: colors.ui.title,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: colors.ui.prompt,
    marginBottom: 4,
  },
  quote: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  button: {
    marginTop: 16,
    padding: '10px 20px',
    background: colors.ui.background,
    border: `1px solid ${colors.ui.border}`,
    borderRadius: 6,
    color: colors.ui.text,
    fontFamily: 'monospace',
    cursor: 'pointer',
    fontSize: 14,
  },
  img: {
    maxWidth: '100%',
    height: 'auto',
    marginTop: 12,
    borderRadius: 4,
  },
  caption: {
    fontSize: 12,
    marginTop: 8,
    color: colors.ui.prompt,
  },
};

export default function Dialog({ type, data, onClose, onViewGallery }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!data) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleBoxClick = (e) => e.stopPropagation();

  const renderContent = () => {
    switch (type) {
      case 'treasure':
        return (
          <>
            <h2 style={baseStyles.title}>{data.title}</h2>
            <p style={baseStyles.text}>{data.content}</p>
          </>
        );
      case 'lobster':
        return (
          <>
            <h2 style={baseStyles.title}>🦞</h2>
            <p style={baseStyles.text}>{data.message}</p>
          </>
        );
      case 'camera':
        return (
          <>
            <h2 style={baseStyles.title}>📷</h2>
            <p style={baseStyles.text}>{data.message}</p>
            {data.photos?.length > 0 && (
              <InlineGallery photos={data.photos} />
            )}
          </>
        );
      case 'delhi':
        return (
          <>
            <h2 style={baseStyles.title}>Delhi</h2>
            <p style={baseStyles.text}>{data.message}</p>
            {data.photo?.src && (
              <DelhiImage src={data.photo.src} caption={data.photo.caption} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={baseStyles.overlay} onClick={handleBackdropClick}>
      <div style={baseStyles.box} onClick={handleBoxClick}>
        <button style={baseStyles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
        {renderContent()}
      </div>
    </div>
  );
}

function DelhiImage({ src, caption }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  // ~40% smaller so it doesn't dominate the window
  const smallerImg = { ...baseStyles.img, opacity: loaded ? 1 : 0, maxWidth: '60%', marginLeft: 'auto', marginRight: 'auto', display: 'block' };

  return (
    <>
      {!error && (
        <img
          src={src}
          alt=""
          style={smallerImg}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {caption && <p style={baseStyles.caption}>{caption}</p>}
    </>
  );
}

function InlineGallery({ photos }) {
  const [index, setIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const validPhotos = photos || [];
  const current = validPhotos[index];
  const total = validPhotos.length;

  React.useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [index]);

  const goPrev = (e) => {
    e.stopPropagation();
    if (total <= 1) return;
    setIndex((i) => (i - 1 + total) % total);
  };
  const goNext = (e) => {
    e.stopPropagation();
    if (total <= 1) return;
    setIndex((i) => (i + 1) % total);
  };

  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => (total <= 1 ? i : (i - 1 + total) % total));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex((i) => (total <= 1 ? i : (i + 1) % total));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total]);

  if (validPhotos.length === 0) return null;

  return (
    <div style={inlineGalleryStyles.wrapper}>
      <div style={inlineGalleryStyles.navRow}>
        <button type="button" style={inlineGalleryStyles.arrow} onClick={goPrev} aria-label="Previous">
          ‹
        </button>
        <span style={inlineGalleryStyles.counter}>
          {index + 1} / {total}
        </span>
        <button type="button" style={inlineGalleryStyles.arrow} onClick={goNext} aria-label="Next">
          ›
        </button>
      </div>
      <div style={inlineGalleryStyles.imageWrap}>
        {!error && current?.src && (
          <img
            key={index}
            src={current.src}
            alt=""
            style={{ ...inlineGalleryStyles.image, opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        {current?.caption && (
          <p style={inlineGalleryStyles.caption}>{current.caption}</p>
        )}
      </div>
    </div>
  );
}

const inlineGalleryStyles = {
  wrapper: {
    marginTop: 16,
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  arrow: {
    background: colors.ui.background,
    border: `1px solid ${colors.ui.border}`,
    borderRadius: 6,
    color: colors.ui.text,
    fontFamily: 'monospace',
    fontSize: 20,
    cursor: 'pointer',
    padding: '6px 12px',
    lineHeight: 1,
  },
  counter: {
    fontSize: 12,
    color: colors.ui.prompt,
    fontFamily: 'monospace',
  },
  imageWrap: {
    maxWidth: '100%',
    maxHeight: 380,
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: 340,
    objectFit: 'contain',
    transition: 'opacity 0.2s ease',
  },
  caption: {
    fontSize: 12,
    marginTop: 6,
    color: colors.ui.prompt,
    textAlign: 'center',
  },
};
