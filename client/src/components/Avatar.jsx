import React, { useState, useEffect } from 'react';

/**
 * Extracts the first initial of a user/doctor name, skipping any "Dr." or "Dr " prefix.
 */
export function getInitial(name) {
  if (!name || typeof name !== 'string') return 'D';
  const clean = name.replace(/^dr\.?\s*/i, '').trim();
  return (clean.charAt(0) || name.charAt(0) || 'D').toUpperCase();
}

const GRADIENTS = [
  'linear-gradient(135deg, #00b48a 0%, #007052 100%)', // Emerald
  'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', // Sky
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Teal
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', // Cyan
  'linear-gradient(135deg, #059669 0%, #047857 100%)'  // Forest
];

export function getAvatarGradient(name) {
  const initial = getInitial(name);
  const code = initial.charCodeAt(0) || 0;
  return GRADIENTS[code % GRADIENTS.length];
}

/**
 * Checks if the source is a real, user-uploaded photo rather than an unuploaded/stock placeholder.
 */
export function hasUserUploadedPhoto(src) {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.includes('unsplash.com')) return false;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image') && !trimmed.startsWith('/') && !trimmed.startsWith('blob:')) {
    return false;
  }
  return true;
}

/**
 * Universal Avatar component:
 * - If user has an uploaded photo and it loads successfully, renders <img>.
 * - If no photo, or if photo fails to load, gracefully displays the first letter of their name
 *   on a clean, modern gradient background.
 */
export function Avatar({
  src,
  name,
  size = 36,
  style = {},
  className = '',
  borderRadius = '50%',
  fontSize
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state whenever src changes (e.g. after uploading a new profile picture)
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = getInitial(name);
  const calculatedFontSize = fontSize || Math.max(11, Math.round(size * 0.44));
  const gradient = getAvatarGradient(name);

  // If user has not uploaded a picture (or image errored), immediately show first letter of name
  const showInitial = !hasUserUploadedPhoto(src) || hasError;

  if (showInitial) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius,
          background: gradient,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: `${calculatedFontSize}px`,
          textTransform: 'uppercase',
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          flexShrink: 0,
          ...style
        }}
        title={name || 'Doctor'}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setHasError(true)}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius,
        objectFit: 'cover',
        display: 'block',
        flexShrink: 0,
        ...style
      }}
    />
  );
}
