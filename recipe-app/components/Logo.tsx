'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';

export function Logo() {
  const { lang } = useApp();
  
  return (
    <Link href="/" className="logo">
      🍳 {lang === 'de' ? "Sonja's Rezepte" : "Sonja's Recipes"}
    </Link>
  );
}
