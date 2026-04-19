'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface NavProps {
  onSignInClick: () => void;
}

export function Nav({ onSignInClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: scrolled ? '14px 48px' : '24px 48px',
      background: scrolled ? 'rgba(250,246,240,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <Link href="/" style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 300,
        fontSize: '1.6rem',
        color: 'var(--espresso)',
        letterSpacing: '-0.01em',
      }}>
        Sonja&#39;s Kitchen
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/" style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: pathname === '/' ? 'var(--terra)' : 'var(--text-muted)',
          borderBottom: pathname === '/' ? '1px solid var(--terra)' : 'none',
          paddingBottom: '2px',
        }}>
          Home
        </Link>
        <Link href="/recipes" style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: pathname === '/recipes' ? 'var(--terra)' : 'var(--text-muted)',
          borderBottom: pathname === '/recipes' ? '1px solid var(--terra)' : 'none',
          paddingBottom: '2px',
        }}>
          Recipes
        </Link>

        {isAuthenticated ? (
          <button
            onClick={() => signOut()}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '99px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--terra)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--terra)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={onSignInClick}
            style={{
              background: 'var(--espresso)',
              color: 'var(--cream)',
              borderRadius: '99px',
              padding: '10px 24px',
              fontSize: '0.85rem',
              fontWeight: 500,
              border: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--terra)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--espresso)'; }}
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
