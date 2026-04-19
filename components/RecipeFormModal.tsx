'use client';

import { useEffect, useState } from 'react';
import type { Recipe, Ingredient } from '@/lib/db';
import { sanitize } from '@/lib/sanitize';

interface RecipeFormModalProps {
  recipe?: Recipe;
  onClose: () => void;
  onSave: (data: Partial<Recipe>) => Promise<void>;
  loading?: boolean;
}

const CATEGORIES = [
  { value: 'main', label: 'Mains' },
  { value: 'soup', label: 'Soups' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'salad', label: 'Salads' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

interface FormIngredient {
  amount: string;
  unit: string;
  name: string;
}

export function RecipeFormModal({ recipe, onClose, onSave, loading }: RecipeFormModalProps) {
  const isEdit = !!recipe;

  const [title, setTitle] = useState(recipe?.title || '');
  const [category, setCategory] = useState<Recipe['category']>(recipe?.category || 'main');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>(recipe?.difficulty || 'easy');
  const [prepTime, setPrepTime] = useState(String(recipe?.prepTimeMin || ''));
  const [cookTime, setCookTime] = useState(String(recipe?.cookTimeMin || ''));
  const [servings, setServings] = useState(String(recipe?.portions || ''));
  const [description, setDescription] = useState(recipe?.description || '');
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || '');
  const [ingredients, setIngredients] = useState<FormIngredient[]>(
    recipe?.ingredients?.length
      ? recipe.ingredients.map(i => ({ amount: i.amount, unit: i.unit, name: i.name }))
      : [{ amount: '', unit: '', name: '' }]
  );
  const [steps, setSteps] = useState<string[]>(
    recipe?.steps?.length ? recipe.steps : ['']
  );
  const [tip, setTip] = useState(recipe?.tip || '');
  const [tags, setTags] = useState(recipe?.tags?.join(', ') || '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const addIngredient = () => setIngredients(prev => [...prev, { amount: '', unit: '', name: '' }]);
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof FormIngredient, val: string) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  };

  const addStep = () => setSteps(prev => [...prev, '']);
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) => setSteps(prev => prev.map((s, idx) => idx === i ? val : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = recipe?.slug || (
      sanitize(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
    );
    const data: Partial<Recipe> = {
      title: sanitize(title),
      category: category as Recipe['category'],
      difficulty: difficulty as Recipe['difficulty'],
      prepTimeMin: prepTime ? parseInt(prepTime) : undefined,
      cookTimeMin: cookTime ? parseInt(cookTime) : undefined,
      portions: servings ? parseInt(servings) : undefined,
      description: sanitize(description),
      imageUrl: imageUrl.trim(),
      ingredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({ amount: sanitize(i.amount), unit: sanitize(i.unit), name: sanitize(i.name) })),
      steps: steps.filter(s => s.trim()).map(sanitize),
      tip: sanitize(tip),
      tags: tags.split(',').map(t => sanitize(t.trim())).filter(Boolean),
    };
    if (!isEdit) {
      (data as any).slug = slug;
      (data as any).createdAt = new Date().toISOString();
    }
    (data as any).updatedAt = new Date().toISOString();
    await onSave(data);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--cream-mid)',
    fontSize: '0.95rem',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,10,5,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 300,
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
          maxWidth: '720px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeUp 0.4s ease',
          boxShadow: '0 40px 80px rgba(20,10,5,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.8rem', color: 'var(--espresso)' }}>
            {isEdit ? 'Edit Recipe' : 'Add Recipe'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '24px 32px' }}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Title *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Category + Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value as Recipe['category'])} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}

              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as Recipe['difficulty'])} style={{ ...inputStyle, cursor: 'pointer' }}>
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {/* Times + Servings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Prep time (min)</label>
              <input type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Cook time (min)</label>
              <input type="number" min="0" value={cookTime} onChange={e => setCookTime(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Servings</label>
              <input type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Image URL */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://…"
              onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Ingredients *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 90px 1fr 32px', gap: '6px', marginBottom: '6px' }}>
              {['Amount', 'Unit', 'Name', ''].map((h, i) => (
                <span key={i} style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 4px' }}>
                  {h}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 90px 1fr 32px', gap: '6px' }}>
                  <input value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} placeholder="200" style={{ ...inputStyle, padding: '10px 12px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
                  <input value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} placeholder="g" style={{ ...inputStyle, padding: '10px 12px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
                  <input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} placeholder="dark chocolate" style={{ ...inputStyle, padding: '10px 12px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length === 1}
                    style={{
                      width: '32px',
                      height: '100%',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: ingredients.length === 1 ? 'not-allowed' : 'pointer',
                      opacity: ingredients.length === 1 ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >×</button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + Add ingredient
            </button>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Method *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--espresso)',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '10px',
                  }}>
                    {i + 1}
                  </span>
                  <textarea
                    rows={2}
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical', flex: 1 }}
                    onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    disabled={steps.length === 1}
                    style={{
                      width: '32px',
                      height: '44px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: steps.length === 1 ? 'not-allowed' : 'pointer',
                      opacity: steps.length === 1 ? 0.4 : 1,
                      marginTop: '0',
                      flexShrink: 0,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + Add step
            </button>
          </div>

          {/* Tip */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Sonja&#39;s Tip</label>
            <textarea
              rows={2}
              value={tip}
              onChange={e => setTip(e.target.value)}
              placeholder="Optional tip or note…"
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="quick, vegetarian, summer"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--terra)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
        </form>

        {/* Footer */}
        <div style={{
          padding: '20px 32px 28px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '99px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit as any}
            style={{
              padding: '12px 28px',
              borderRadius: '99px',
              border: 'none',
              background: loading ? 'var(--border)' : 'var(--terra)',
              color: 'white',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--espresso)'; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--terra)'; }}
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
