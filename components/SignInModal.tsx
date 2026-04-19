'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

interface BFState {
  count: number;
  lockedUntil: number;
}

function getBFState(): BFState {
  try {
    const raw = localStorage.getItem('sk_login_attempts');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, lockedUntil: 0 };
}

function setBFState(state: BFState) {
  localStorage.setItem('sk_login_attempts', JSON.stringify(state));
}

interface SignInModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SignInModal({ onClose, onSuccess }: SignInModalProps) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bfState, setBFStateLocal] = useState<BFState>(() => getBFState());
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (bfState.lockedUntil <= 0) return;
    const tick = () => {
      const r = Math.max(0, bfState.lockedUntil - Date.now());
      setRemaining(r);
      if (r === 0) {
        const reset = { count: 0, lockedUntil: 0 };
        setBFState(reset);
        setBFStateLocal(reset);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [bfState.lockedUntil]);

  const isLocked = bfState.lockedUntil > Date.now();
  const attemptsLeft = 5 - bfState.count;
  const showWarning = !isLocked && attemptsLeft <= 2 && bfState.count > 0;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || loading) return;

    setLoading(true);
    setError('');

    const jitter = 200 + Math.random() * 200;
    await new Promise(r => setTimeout(r, jitter));

    const result = await signIn(username, password);
    setLoading(false);

    if (!result.error) {
      setBFState({ count: 0, lockedUntil: 0 });
      setBFStateLocal({ count: 0, lockedUntil: 0 });
      onSuccess();
      onClose();
    } else {
      const current = getBFState();
      const newCount = current.count + 1;
      const newState: BFState = {
        count: newCount,
        lockedUntil: newCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0,
      };
      setBFState(newState);
      setBFStateLocal(newState);
      setError(result.error);
    }
  }, [isLocked, loading, signIn, username, password, onSuccess, onClose]);

  const formatTime = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,10,5,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--cream)',
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '400px',
          width: '100%',
          animation: 'fadeUp 0.4s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--terra-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 400, color: 'var(--espresso)', marginBottom: '8px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sign in to manage your recipes</p>
        </div>

        {isLocked ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔒</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              Too many failed attempts. Please wait before trying again.
            </p>
            <div style={{
              fontSize: '1.5rem',
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--espresso)',
              fontWeight: 400,
            }}>
              {formatTime(remaining)}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'white',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'white',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: '99px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}
            {showWarning && (
              <div style={{
                color: '#b45309',
                fontSize: '0.8rem',
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '99px',
                background: loading ? 'var(--border)' : 'var(--espresso)',
                color: 'var(--cream)',
                fontWeight: 500,
                fontSize: '0.85rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                letterSpacing: '0.04em',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
