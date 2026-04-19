'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--espresso)',
      color: 'var(--cream)',
      borderRadius: '99px',
      padding: '12px 24px',
      fontSize: '0.85rem',
      fontWeight: 400,
      zIndex: 500,
      whiteSpace: 'nowrap',
      animation: 'fadeIn 0.2s ease',
    }}>
      {message}
    </div>
  );
}
