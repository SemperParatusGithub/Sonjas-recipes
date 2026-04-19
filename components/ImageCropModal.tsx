'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface ImageCropModalProps {
  src: string;
  onCancel: () => void;
  onApply: (blob: Blob) => void;
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    img,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas empty')), 'image/jpeg', 0.92)
  );
}

export function ImageCropModal({ src, onCancel, onApply }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const ASPECT = 16 / 9;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
      onApply(blob);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,10,5,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'var(--espresso)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          animation: 'fadeUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.4rem', color: 'var(--cream)' }}>
            Crop Image
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            16:9 ratio · drag to reposition · pinch or scroll to zoom
          </p>
        </div>

        {/* Crop area */}
        <div style={{ position: 'relative', width: '100%', height: '340px', background: '#111' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: '2px solid var(--terra)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', minWidth: '32px' }}>
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--terra)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', minWidth: '36px', textAlign: 'right' }}>
            {zoom.toFixed(1)}×
          </span>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 22px',
              borderRadius: '99px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            style={{
              padding: '10px 22px',
              borderRadius: '99px',
              border: 'none',
              background: applying ? 'rgba(255,255,255,0.2)' : 'var(--terra)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: applying ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {applying ? 'Applying…' : 'Use this crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
