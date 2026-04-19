'use client';

import { useState } from 'react';

const GRADIENTS: Record<string, string> = {
  main:    'linear-gradient(135deg, #e8d5b7 0%, #c4956a 100%)',
  soup:    'linear-gradient(135deg, #d4e8cc 0%, #7aaa6b 100%)',
  dessert: 'linear-gradient(135deg, #e8d0e0 0%, #b07a9e 100%)',
  salad:   'linear-gradient(135deg, #cce8d4 0%, #6aaa7a 100%)',
  default: 'linear-gradient(135deg, #e8e0d4 0%, #a09070 100%)',
};

interface RecipeImageProps {
  imageUrl?: string;
  category?: string;
  alt: string;
  height?: number | string;
  style?: React.CSSProperties;
}

export function RecipeImage({ imageUrl, category, alt, height = 180, style }: RecipeImageProps) {
  const [imgError, setImgError] = useState(false);
  const showGradient = !imageUrl || imgError;
  const gradient = GRADIENTS[category || ''] || GRADIENTS.default;

  if (showGradient) {
    return (
      <div style={{
        width: '100%',
        height,
        background: gradient,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.06) 8px, rgba(255,255,255,0.06) 16px)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ opacity: 0.22 }}>
            <circle cx="26" cy="26" r="24" stroke="white" strokeWidth="2"/>
            <path d="M26 14c-2 0-4 2-4 8s2 8 4 8 4-2 4-8-2-8-4-8z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M26 30v8M22 38h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, overflow: 'hidden', position: 'relative', ...style }}>
      <img
        src={imageUrl}
        alt={alt}
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
