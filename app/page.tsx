'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Recipe } from '@/lib/db';
import { Nav } from '@/components/Nav';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeModal } from '@/components/RecipeModal';
import { RecipeFormModal } from '@/components/RecipeFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { SignInModal } from '@/components/SignInModal';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeCount, setRecipeCount] = useState(0);
  const { loading: authLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | 'new' | null>(null);
  const [deleteRecipe, setDeleteRecipe] = useState<Recipe | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRecipes = useCallback(async () => {
    const res = await fetch('/api/recipes');
    if (res.ok) {
      const data: Recipe[] = await res.json();
      setRecipeCount(data.length);
      setRecipes(data.slice(0, 3));
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

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

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  if (authLoading) return null;

  return (
    <>
      <Nav onSignInClick={() => setShowSignIn(true)} />

      {/* Hero */}
      <section className="hero-grid">
        <div className="hero-text">
          <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '24px' }}>
            Welcome to my kitchen
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)', color: 'var(--espresso)', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: '32px' }}>
            Cooking is my<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>love language.</em>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text-muted)', maxWidth: '440px', fontWeight: 300, marginBottom: '44px' }}>
            Every recipe here has a story — a Sunday afternoon, a family gathering, or a quiet evening experiment. Pull up a chair and make yourself at home.
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/recipes" style={{ background: 'var(--terra)', color: 'white', borderRadius: '99px', padding: '14px 32px', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.2s', display: 'inline-block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--espresso)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--terra)'; }}>
              Browse Recipes
            </Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{recipeCount} recipe{recipeCount !== 1 ? 's' : ''} &amp; counting</span>
          </div>
        </div>
        <div className="hero-image" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--terra-light) 0%, var(--cream-mid) 100%)', animation: 'fadeIn 0.4s ease 0.2s both' }}>
          <div style={{ position: 'absolute', top: '40px', right: '40px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(165,100,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid rgba(165,100,60,0.15)' }} />
          </div>
          <img src="/sonja.png" alt="Chef Sonja" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', height: '92%', width: 'auto', objectFit: 'cover' }} />
        </div>
      </section>

      {/* Today's picks */}
      <section className="section-dark">
        <div className="section-dark-header">
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{today}</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', color: 'var(--cream)', lineHeight: 1.05 }}>Today&#39;s Recommendations</h2>
          </div>
          <Link href="/recipes" style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '99px', padding: '10px 24px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = 'var(--terra)'; a.style.color = 'var(--terra)'; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = 'rgba(255,255,255,0.2)'; a.style.color = 'rgba(255,255,255,0.6)'; }}>
            All Recipes →
          </Link>
        </div>
        {recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((recipe, i) => (
              <div key={recipe.id} style={{ animation: 'fadeUp 0.6s ease ' + (0.2 + i * 0.1) + 's both' }}>
                <RecipeCard recipe={recipe} featured onView={r => setViewRecipe(r)} onEdit={r => setEditRecipe(r)} onDelete={r => setDeleteRecipe(r)} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No recipes yet. Sign in to add the first one!</p>
        )}
      </section>

      {/* Quote */}
      <section className="section-quote">
        <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(1.3rem, 3vw, 2.5rem)', color: 'var(--espresso)', lineHeight: 1.4, maxWidth: '700px' }}>
          &#34;The secret ingredient is always a little more butter and a lot of love.&#34;
        </blockquote>
        <div style={{ color: 'var(--terra)', fontSize: '0.85rem', letterSpacing: '0.1em', marginTop: '20px' }}>— Sonja</div>
      </section>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onSuccess={() => setToast('Welcome back, Sonja!')} />}
      {viewRecipe && <RecipeModal recipe={viewRecipe} onClose={() => setViewRecipe(null)} onEdit={r => { setViewRecipe(null); setEditRecipe(r); }} onDelete={r => setDeleteRecipe(r)} />}
      {editRecipe && <RecipeFormModal recipe={editRecipe === 'new' ? undefined : editRecipe as Recipe} onClose={() => setEditRecipe(null)} onSave={handleSave} loading={formLoading} />}
      {deleteRecipe && <ConfirmModal recipeName={deleteRecipe.title} onConfirm={handleDelete} onCancel={() => setDeleteRecipe(null)} loading={deleteLoading} />}
      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </>
  );
}
