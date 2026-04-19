'use client';

import { useEffect } from 'react';
import type { Recipe } from '@/lib/db';
import { RecipeImage } from './RecipeImage';
import { CategoryPill } from './CategoryPill';
import { MetaRow } from './MetaRow';
import { useAuth } from '@/lib/auth-context';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeModal({ recipe, onClose, onEdit, onDelete }: RecipeModalProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,10,5,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
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
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(20,10,5,0.35)',
          animation: 'fadeUp 0.4s ease',
        }}
      >
        {/* Image banner */}
        <div style={{ position: 'relative', height: '240px', flexShrink: 0 }}>
          <RecipeImage imageUrl={recipe.imageUrl} category={recipe.category} alt={recipe.title} height={240} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(20,10,5,0.65) 0%, transparent 55%)',
          }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(6px)',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
          <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
            <CategoryPill category={recipe.category} />
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '28px 36px 40px', overflowY: 'auto', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '2.4rem',
              color: 'var(--espresso)',
              lineHeight: 1.1,
              flex: 1,
              marginRight: '16px',
            }}>
              {recipe.title}
            </h2>
            {isAuthenticated && (
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '8px' }}>
                <button
                  onClick={() => onEdit(recipe)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream-mid)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--espresso)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(recipe)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-light)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Meta */}
          <div style={{ marginBottom: '16px' }}>
            <MetaRow recipe={recipe} />
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {recipe.tags.map(tag => (
                <span key={tag} style={{
                  background: 'var(--terra-light)',
                  color: 'var(--terra)',
                  borderRadius: '99px',
                  padding: '3px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {recipe.description && (
            <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: '28px' }}>
              {recipe.description}
            </p>
          )}

          {/* Ingredients + Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px', marginBottom: '28px' }}>
            {/* Ingredients */}
            <div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Ingredients
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--terra)', marginTop: '7px', flexShrink: 0 }} />
                    <span>
                      {(ing.amount || ing.unit) && (
                        <strong style={{ color: 'var(--text)' }}>
                          {[ing.amount, ing.unit].filter(Boolean).join(' ')}{' '}
                        </strong>
                      )}
                      <span style={{ color: 'var(--text-muted)' }}>{ing.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Method
              </h4>
              <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recipe.steps.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--espresso)',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text)' }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Tip */}
          {recipe.tip && (
            <div style={{
              background: 'var(--terra-light)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.1rem' }}>💡</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '6px' }}>
                  Sonja&#39;s Tip
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--brown-mid)' }}>{recipe.tip}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
