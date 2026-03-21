import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecipe } from '@/lib/db';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = auth(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = auth(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const body = await request.json();
    const { title, description, category, difficulty, prepTimeMin, cookTimeMin, bakeTimeMin, servings, ingredients, steps, tags, imageUrl, tips } = body;

    const existing = getRecipe(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE Recipe SET
        title = ?, description = ?, category = ?, difficulty = ?,
        prepTimeMin = ?, cookTimeMin = ?, bakeTimeMin = ?, servings = ?,
        ingredients = ?, steps = ?, tags = ?, imageUrl = ?, tip = ?, updatedAt = ?
      WHERE slug = ?
    `).run(
      title ?? existing.title,
      description ?? existing.description,
      category ?? existing.category,
      difficulty ?? existing.difficulty,
      prepTimeMin ?? existing.prepTimeMin,
      cookTimeMin ?? existing.cookTimeMin,
      bakeTimeMin ?? existing.bakeTimeMin,
      servings ?? existing.servings,
      JSON.stringify(ingredients ?? JSON.parse(existing.ingredients || '[]')),
      JSON.stringify(steps ?? JSON.parse(existing.steps || '[]')),
      JSON.stringify(tags ?? JSON.parse(existing.tags || '[]')),
      imageUrl ?? existing.imageUrl,
      tips ?? existing.tip,
      now,
      slug
    );

    const updated = getRecipe(slug);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PUT /api/recipes/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
