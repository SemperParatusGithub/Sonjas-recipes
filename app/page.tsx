import Link from 'next/link';
import db, { parseRecipe } from '@/lib/db';
import { SearchFilters, ThemeToggle } from '@/components/ClientComponents';
import { Logo } from '@/components/Logo';
import { AuthNav } from '@/components/AuthNav';
import { AddRecipeButton } from '@/components/AddRecipeButton';

export const dynamic = 'force-dynamic';

export default async function HomePage(props: { searchParams: Promise<{ q?: string; category?: string; difficulty?: string }> }) {
  const searchParams = await props.searchParams;
  // Build query based on search params
  let query = 'SELECT * FROM Recipe WHERE 1=1';
  const params: any[] = [];

  if (searchParams.q) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${searchParams.q}%`, `%${searchParams.q}%`);
  }
  if (searchParams.category) {
    query += ' AND category = ?';
    params.push(searchParams.category);
  }
  if (searchParams.difficulty) {
    query += ' AND difficulty = ?';
    params.push(searchParams.difficulty);
  }

  // Get filtered recipes
  const recipes = db.prepare(query + ' ORDER BY id LIMIT 100').all(...params);
  const parsedRecipes = recipes.map(parseRecipe);
  
  // Get total count for display
  const total = db.prepare('SELECT COUNT(*) as count FROM Recipe').get() as { count: number };
  const filteredCount = parsedRecipes.length;
  
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <Logo />
          <nav className="nav">
            <Link href="/">Startseite</Link>
            <AddRecipeButton />
            <ThemeToggle />
            <AuthNav />
          </nav>
        </div>
      </header>

      <main className="container">
        <SearchFilters />

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {filteredCount === total.count 
            ? `${total.count} Rezepte` 
            : `${filteredCount} von ${total.count} Rezepten`}
        </p>
        
        {parsedRecipes.length === 0 ? (
          <p>Keine Rezepte gefunden.</p>
        ) : (
          <div className="recipe-grid">
            {parsedRecipes.map((recipe) => (
              <Link 
                key={recipe.id} 
                href={`/recipes/${recipe.slug}`}
                className="recipe-card"
              >
                {recipe.imageUrl ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="recipe-card-image"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div className="recipe-card-content">
                  <span className="recipe-card-category">
                    {recipe.category}
                  </span>
                  <h3 className="recipe-card-title">{recipe.title}</h3>
                  {recipe.description && (
                    <p className="recipe-card-desc">{recipe.description}</p>
                  )}
                  <div className="recipe-card-meta">
                    {recipe.difficulty && (
                      <span className={`difficulty-${recipe.difficulty}`}>
                        {recipe.difficulty}
                      </span>
                    )}
                    {recipe.prepTimeMin && (
                      <span>{recipe.prepTimeMin} Min.</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
