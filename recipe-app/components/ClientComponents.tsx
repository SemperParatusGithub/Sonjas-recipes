'use client';

import { useState } from 'react';

export function SearchFilters() {
  const [search, setSearch] = useState('');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    
    const q = formData.get('q') as string;
    const category = formData.get('category') as string;
    const difficulty = formData.get('difficulty') as string;
    
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    
    const query = params.toString();
    window.location.href = query ? `/?${query}` : '/';
  };
  
  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        name="q"
        className="search-input"
        placeholder="Suchen..."
        defaultValue=""
      />
      <select 
        name="category"
        className="filter-select"
        defaultValue=""
      >
        <option value="">Alle</option>
        <option value="breakfast">Frühstück</option>
        <option value="main">Hauptgericht</option>
        <option value="side">Beilage</option>
        <option value="dessert">Dessert</option>
        <option value="other">Sonstiges</option>
      </select>
      <select
        name="difficulty"
        className="filter-select"
        defaultValue=""
      >
        <option value="">Schwierigkeit</option>
        <option value="easy">Einfach</option>
        <option value="medium">Mittel</option>
        <option value="hard">Schwer</option>
      </select>
      <button type="submit" className="btn btn-secondary">
        Filter
      </button>
      {(typeof window !== 'undefined' && new URLSearchParams(window.location.search).toString()) && (
        <a href="/" className="btn btn-secondary">Reset</a>
      )}
    </form>
  );
}

export function ThemeToggle() {
  return (
    <button 
      className="theme-toggle"
      onClick={() => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      }}
    >
      🌙
    </button>
  );
}
