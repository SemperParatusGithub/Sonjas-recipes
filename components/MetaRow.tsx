'use client';

import type { Recipe } from '@/lib/db';

interface MetaRowProps {
  recipe: Recipe;
  light?: boolean;
}

function formatTime(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes} min`;
}

export function MetaRow({ recipe, light = false }: MetaRowProps) {
  const total = (recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0);
  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: '99px',
    background: light ? 'rgba(255,255,255,0.12)' : 'var(--terra-light)',
    color: light ? 'rgba(255,255,255,0.65)' : 'var(--terra)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {total > 0 && <span style={pillStyle}>⏱ {formatTime(total)}</span>}
      {recipe.portions && recipe.portions > 0 && <span style={pillStyle}>🍽 {recipe.portions}</span>}
      {recipe.difficulty && <span style={pillStyle}>{recipe.difficulty}</span>}
    </div>
  );
}
