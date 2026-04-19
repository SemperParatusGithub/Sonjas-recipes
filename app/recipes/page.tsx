'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe } from '@/lib/db';
import { Nav } from '@/components/Nav';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeModal } from '@/components/RecipeModal';
import { RecipeFormModal } from '@/components/RecipeFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { SignInModal } from '@/components/SignInModal';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/lib/auth-context';

const CATEGORY_LABELS: Record<string, string> = {
  main: 'Mains',
  soup: 'Soups',
  dessert: 'Desserts',
  salad: 'Salads',
};

const FILTERS = ['All', 'Mains', 'Soups', 'Desserts', 'Salads'];
const FILTER_TO_VALUE: Record<string, string> = {
  Mains: 'main',
  Soups: 'soup',
  Desserts: 'dessert',
  Salads: 'salad',
};

export default function RecipesPage() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | 'new' | null>(null);
  const [deleteRecipe, setDeleteRecipe] = useState<Recipe | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRecipes = useCallback(async () => {
    const res = await fetch('/api/recipes');
    if (res.ok) setAllRecipes(await res.json());
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const filtered = useMemo(() => {
    let result = allRecipes;
    if (activeFilter !== 'All') {
      const val = FILTER_TO_VALUE[activeFilter];
      result = result.filter(r => r.category === val);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[r.category] || '').toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allRecipes, activeFilter, search]);

  const handleSave = async (data: Partial<Recipe>) => {
    setFormLoading(true);
    try {
      if (editRecipe === 'new') {
        await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, servings: data.portions }),
        });
        setToast('Recipe added!');
      } else {
        const r = editRecipe as Recipe;
        await fetch('/api/recipes/' + r.slug, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, servings: data.portions }),
        });
        setToast('Recipe updated!');
      }
      await fetchRecipes();
      setEditRecipe(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRecipe) return;
    setDeleteLoading(true);
    try {
      await fetch('/api/recipes/' + deleteRecipe.slug, { method: 'DELETE' });
      setToast('Recipe deleted');
      setDeleteRecipe(null);
      setViewRecipe(null);
      await fetchRecipes();
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <Nav onSignInClick={() => setShowSignIn(true)} />

      <div style={{ paddingTop: '80px' }}>
        {/* Header */}
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '10px' }}>All Recipes</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 4rem)', color: 'var(--espresso)', lineHeight: 1.05 }}>The Full Collection</h1>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setEditRecipe('new')}
                style={{ background: 'var(--terra)', color: 'white', borderRadius: '99px', padding: '12px 28px', fontSize: '0.85rem', fontWeight: 500, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--espresso)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--terra)'; }}
              >
                + Add Recipe
              </button>
            )}
          </div>

          {/* Search + filters */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '380px' }}>
              <svg
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                placeholder="Search recipes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '99px',
                  padding: '12px 16px 12px 44px',
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                  background: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    borderRadius: '99px',
                    padding: '10px 18px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    border: activeFilter === f ? 'none' : '1px solid var(--border)',
                    background: activeFilter === f ? 'var(--espresso)' : 'white',
                    color: activeFilter === f ? 'var(--cream)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    minHeight: '44px',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipe grid */}
        <div className="recipe-grid-pad">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.length > 0 ? (
            <div className="recipe-grid">
              {filtered.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={r => setViewRecipe(r)}
                  onEdit={r => setEditRecipe(r)}
                  onDelete={r => setDeleteRecipe(r)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem' }}>No recipes found.</p>
              {search && <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Try a different search term.</p>}
            </div>
          )}
        </div>
      </div>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onSuccess={() => setToast('Welcome back, Sonja!')} />}
      {viewRecipe && <RecipeModal recipe={viewRecipe} onClose={() => setViewRecipe(null)} onEdit={r => { setViewRecipe(null); setEditRecipe(r); }} onDelete={r => setDeleteRecipe(r)} />}
      {editRecipe && <RecipeFormModal recipe={editRecipe === 'new' ? undefined : editRecipe as Recipe} onClose={() => setEditRecipe(null)} onSave={handleSave} loading={formLoading} />}
      {deleteRecipe && <ConfirmModal recipeName={deleteRecipe.title} onConfirm={handleDelete} onCancel={() => setDeleteRecipe(null)} loading={deleteLoading} />}
      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </>
  );
}
