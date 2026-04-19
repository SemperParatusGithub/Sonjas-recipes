'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/db';
import { RecipeImage } from './RecipeImage';
import { CategoryPill } from './CategoryPill';
import { MetaRow } from './MetaRow';
import { useAuth } from '@/lib/auth-context';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  featured?: boolean;
}

export function RecipeCard({ recipe, onView, onEdit, onDelete, featured = false }: RecipeCardProps) {
  const { isAuthenticated } = useAuth();
  const [hovered, setHovered] = useState(false);

  const desc = recipe.description || '';
  const truncated = desc.length > (featured ? 90 : 80)
    ? desc.slice(0, featured ? 90 : 80) + '…'
    : desc;

  if (featured) {
    return (
      <div
        onClick={() => onView(recipe)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered ? '0 24px 48px rgba(0,0,0,0.35)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ position: 'relative', height: '220px' }}>
          <RecipeImage imageUrl={recipe.imageUrl} category={recipe.category} alt={recipe.title} height={220} />
          <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
            <CategoryPill category={recipe.category} />
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: '1.35rem',
            color: 'var(--cream)',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}>
            {recipe.title}
          </h3>
          {truncated && (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '14px', lineHeight: 1.6 }}>
              {truncated}
            </p>
          )}
          <MetaRow recipe={recipe} light />
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'white',
        border: '1px solid var(--border)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(60,30,10,0.10)' : 'none',
        transition: 'all 0.25s ease',
      }}
    >
      <div
        onClick={() => onView(recipe)}
        style={{ cursor: 'pointer', position: 'relative', height: '180px' }}
      >
        <RecipeImage imageUrl={recipe.imageUrl} category={recipe.category} alt={recipe.title} height={180} />
        <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
          <CategoryPill category={recipe.category} />
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h3
          onClick={() => onView(recipe)}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: '1.35rem',
            color: 'var(--espresso)',
            marginBottom: '8px',
            cursor: 'pointer',
            lineHeight: 1.2,
          }}
        >
          {recipe.title}
        </h3>
        {truncated && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
            {truncated}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MetaRow recipe={recipe} />
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => onEdit(recipe)}
                title="Edit"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream-mid)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--espresso)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                onClick={() => onDelete(recipe)}
                title="Delete"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-light)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
