'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; email: string } | null>(undefined);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  if (user === undefined) return null; // loading

  if (!user) {
    return (
      <Link href="/login" className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
        Einloggen
      </Link>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</span>
      <button onClick={handleLogout} className="btn btn-secondary">
        Ausloggen
      </button>
    </div>
  );
}
