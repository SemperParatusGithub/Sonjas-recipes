'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useSession } from '@/lib/session';

interface Recipe {
  id: number;
  slug: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  prepTimeMin?: number;
  cookTimeMin?: number;
  bakeTimeMin?: number;
  portions?: number;
  difficulty?: string;
  imageUrl?: string;
  ingredients: [string, string][];
  steps: string[];
  tip?: string;
}

export default function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const { user } = useSession();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug);
      try {
        const res = await fetch(`/api/recipes/${p.slug}`);
        if (!res.ok) {
          setError(t('recipeNotFound'));
        } else {
          const data = await res.json();
          setRecipe(data);
        }
      } catch (err) {
        setError(t('recipeNotFound'));
      }
      setLoading(false);
    });
  }, [params, t]);

  async function handleDelete() {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
      const res = await fetch(`/api/recipes/${slug}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      router.push('/');
    } catch (err) {
      alert('Failed to delete recipe');
    }
  }

  function getTotalTime() {
    if (!recipe) return 0;
    return (recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0) + (recipe.bakeTimeMin || 0);
  }

  function getDifficultyClass(difficulty?: string) {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !recipe) return (
    <div className="not-found">
      <h1>404</h1>
      <p>{error || t('recipeNotFound')}</p>
      <Link href="/" className="btn btn-primary">{t('viewAll')}</Link>
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <Logo />
          <nav className="nav">
            <Link href="/">{t('home')}</Link>
            <button 
              className="language-toggle" 
              onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
            >
              {lang === 'de' ? 'EN' : 'DE'}
            </button>
            <button 
              className="theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>

      <main className="recipe-detail">
        <Link href="/" className="back-link">← {t('viewAll')}</Link>

        {recipe.imageUrl && (
          <img src={recipe.imageUrl} alt={recipe.title} className="recipe-detail-image" />
        )}

        <div className="recipe-detail-header">
          <span className="recipe-card-category">{t(recipe.category as any)}</span>
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          {recipe.description && (
            <p className="recipe-detail-desc">{recipe.description}</p>
          )}
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="recipe-tags">
              {recipe.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Time & Portions */}
        <div className="recipe-meta-grid">
          {recipe.prepTimeMin && (
            <div className="recipe-meta-item">
              <div className="recipe-meta-label">{t('prepTime')}</div>
              <div className="recipe-meta-value">{recipe.prepTimeMin} {t('minutes')}</div>
            </div>
          )}
          {recipe.cookTimeMin && (
            <div className="recipe-meta-item">
              <div className="recipe-meta-label">{t('cookTime')}</div>
              <div className="recipe-meta-value">{recipe.cookTimeMin} {t('minutes')}</div>
            </div>
          )}
          {recipe.bakeTimeMin && (
            <div className="recipe-meta-item">
              <div className="recipe-meta-label">{t('bakeTime')}</div>
              <div className="recipe-meta-value">{recipe.bakeTimeMin} {t('minutes')}</div>
            </div>
          )}
          {getTotalTime() > 0 && (
            <div className="recipe-meta-item">
              <div className="recipe-meta-label">{t('totalTime')}</div>
              <div className="recipe-meta-value">{getTotalTime()} {t('minutes')}</div>
            </div>
          )}
          {recipe.portions && (
            <div className="recipe-meta-item">
              <div className="recipe-meta-label">{t('portions')}</div>
              <div className="recipe-meta-value">{recipe.portions}</div>
            </div>
          )}
          {recipe.difficulty && (
            <div className="recipe-meta-item">
              <div className="recipe-meta-label">{t('difficulty')}</div>
              <div className={`recipe-meta-value ${getDifficultyClass(recipe.difficulty)}`}>
                {t(recipe.difficulty as any)}
              </div>
            </div>
          )}
        </div>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="recipe-section">
            <h3>{t('ingredients')}</h3>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  <span className="ingredient-amount">{ing[0]}</span>
                  <span>{ing[1]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {recipe.steps && recipe.steps.length > 0 && (
          <div className="recipe-section">
            <h3>{t('steps')}</h3>
            <ol className="step-list">
              {recipe.steps.map((step, i) => (
                <li key={i} className="step-item">
                  <span className="step-number">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tip */}
        {recipe.tip && (
          <div className="recipe-tip">
            <strong>💡 {t('tip')}:</strong> {recipe.tip}
          </div>
        )}

        {/* Actions */}
        {user && (
          <div className="recipe-actions">
            <Link href={`/recipes/${recipe.slug}/edit`} className="btn btn-secondary">
              ✏️ Bearbeiten
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              🗑️ Löschen
            </button>
          </div>
        )}
      </main>
    </>
  );
}
