import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db, { parseRecipe, getAllRecipes } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getAllRecipes());
}

export async function POST(request: NextRequest) {
  const session = auth(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, difficulty, prepTimeMin, cookTimeMin, bakeTimeMin, servings, ingredients, steps, tags, imageUrl, tips } = body;

    if (!title || !category || !ingredients || !steps) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO Recipe (slug, title, description, category, difficulty, prepTimeMin, cookTimeMin, bakeTimeMin, portions, ingredients, steps, tags, imageUrl, tip, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug, title, description || null, category, difficulty || null,
      prepTimeMin || null, cookTimeMin || null, bakeTimeMin || null, servings || null,
      JSON.stringify(ingredients), JSON.stringify(steps),
      JSON.stringify(tags || []), imageUrl || null, tips || null, now, now
    );

    const recipe = db.prepare('SELECT * FROM Recipe WHERE slug = ?').get(slug);
    return NextResponse.json(parseRecipe(recipe), { status: 201 });
  } catch (err) {
    console.error('[POST /api/recipes]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
