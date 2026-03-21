'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useSession } from '@/lib/session';

export function AddRecipeForm() {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const { user } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('main');
  const [difficulty, setDifficulty] = useState('');
  const [prepTimeMin, setPrepTimeMin] = useState('');
  const [cookTimeMin, setCookTimeMin] = useState('');
  const [bakeTimeMin, setBakeTimeMin] = useState('');
  const [portions, setPortions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [ingredients, setIngredients] = useState<[string, string][]>([['', '']]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [tip, setTip] = useState('');

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 20) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  function addIngredient() {
    setIngredients([...ingredients, ['', '']]);
  }

  function updateIngredient(index: number, field: 0 | 1, value: string) {
    const newIng = [...ingredients];
    newIng[index][field] = value;
    setIngredients(newIng);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function addStep() {
    setSteps([...steps, '']);
  }

  function updateStep(index: number, value: string) {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty: difficulty || undefined,
          prepTimeMin: prepTimeMin ? parseInt(prepTimeMin) : undefined,
          cookTimeMin: cookTimeMin ? parseInt(cookTimeMin) : undefined,
          bakeTimeMin: bakeTimeMin ? parseInt(bakeTimeMin) : undefined,
          servings: portions ? parseInt(portions) : undefined,
          imageUrl: imageUrl || undefined,
          tags,
          ingredients: ingredients.filter(i => i[0] && i[1]),
          steps: steps.filter(s => s),
          tip: tip || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to create recipe');
      }

      router.push(`/recipes/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <Logo />
          <nav className="nav">
            <Link href="/">Startseite</Link>
            <button className="language-toggle" onClick={() => setLang(lang === 'de' ? 'en' : 'de')}>
              {lang === 'de' ? 'EN' : 'DE'}
            </button>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>

      <main className="recipe-form">
        <Link href="/" className="back-link">← Zurück</Link>
        <h1>Rezept hinzufügen</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titel *</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} />
          </div>

          <div className="form-group">
            <label className="form-label">Beschreibung</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategorie *</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="breakfast">Frühstück</option>
                <option value="main">Hauptgericht</option>
                <option value="side">Beilage</option>
                <option value="dessert">Dessert</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Schwierigkeit</label>
              <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="">-</option>
                <option value="easy">Einfach</option>
                <option value="medium">Mittel</option>
                <option value="hard">Schwer</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vorbereitungszeit (Min.)</label>
              <input type="number" className="form-input" value={prepTimeMin} onChange={e => setPrepTimeMin(e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Kochzeit (Min.)</label>
              <input type="number" className="form-input" value={cookTimeMin} onChange={e => setCookTimeMin(e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Backzeit (Min.)</label>
              <input type="number" className="form-input" value={bakeTimeMin} onChange={e => setBakeTimeMin(e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Portionen</label>
              <input type="number" className="form-input" value={portions} onChange={e => setPortions(e.target.value)} min="1" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bild-URL</label>
            <input type="url" className="form-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="dynamic-list">
              {tags.map((tag, i) => (
                <div key={i} className="dynamic-item">
                  <span className="tag">{tag}</span>
                  <button type="button" onClick={() => removeTag(i)}>✕</button>
                </div>
              ))}
              <div className="dynamic-item">
                <input type="text" className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Tag hinzufügen" />
                <button type="button" onClick={addTag} className="btn btn-secondary">+</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Zutaten</label>
            <div className="dynamic-list">
              {ingredients.map((ing, i) => (
                <div key={i} className="dynamic-item">
                  <input type="text" className="form-input" value={ing[0]} onChange={e => updateIngredient(i, 0, e.target.value)} placeholder="Menge" />
                  <input type="text" className="form-input" value={ing[1]} onChange={e => updateIngredient(i, 1, e.target.value)} placeholder="Zutat" />
                  <button type="button" onClick={() => removeIngredient(i)} className="btn btn-secondary">✕</button>
                </div>
              ))}
              <button type="button" onClick={addIngredient} className="btn btn-secondary">+ Zutat</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Schritte</label>
            <div className="dynamic-list">
              {steps.map((step, i) => (
                <div key={i} className="dynamic-item">
                  <span style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>{i + 1}.</span>
                  <textarea className="form-textarea" value={step} onChange={e => updateStep(i, e.target.value)} style={{ minHeight: '60px' }} />
                  <button type="button" onClick={() => removeStep(i)} className="btn btn-secondary">✕</button>
                </div>
              ))}
              <button type="button" onClick={addStep} className="btn btn-secondary">+ Schritt</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tipp</label>
            <textarea className="form-textarea" value={tip} onChange={e => setTip(e.target.value)} maxLength={1000} />
          </div>

          <div className="form-actions">
            <Link href="/" className="btn btn-secondary">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : 'Speichern'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
