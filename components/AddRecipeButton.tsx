'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session';

export function AddRecipeButton() {
  const { user, loading } = useSession();

  if (loading || !user) return null;

  return (
    <Link href="/add" className="btn btn-primary">
      Rezept hinzufügen
    </Link>
  );
}
