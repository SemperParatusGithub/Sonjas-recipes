import { NextRequest, NextResponse } from 'next/server';
import db, { parseRecipe } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const recipe = db.prepare('SELECT * FROM Recipe WHERE slug = ?').get(slug);
  
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }
  
  return NextResponse.json(parseRecipe(recipe));
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
    const { title, description, category, difficulty, prepTimeMin, cookTimeMin, servings, ingredients, steps, tags, imageUrl, tips } = body;

    const existing = db.prepare('SELECT * FROM Recipe WHERE slug = ?').get(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE Recipe SET
        title = ?, description = ?, category = ?, difficulty = ?,
        prepTimeMin = ?, cookTimeMin = ?, servings = ?,
        ingredients = ?, steps = ?, tags = ?, imageUrl = ?, tip = ?, updatedAt = ?
      WHERE slug = ?
    `).run(
      title ?? existing.title,
      description ?? existing.description,
      category ?? existing.category,
      difficulty ?? existing.difficulty,
      prepTimeMin ?? existing.prepTimeMin,
      cookTimeMin ?? existing.cookTimeMin,
      servings ?? existing.servings,
      JSON.stringify(ingredients ?? JSON.parse((existing as any).ingredients || '[]')),
      JSON.stringify(steps ?? JSON.parse((existing as any).steps || '[]')),
      JSON.stringify(tags ?? JSON.parse((existing as any).tags || '[]')),
      imageUrl ?? existing.imageUrl,
      tips ?? existing.tip,
      now,
      slug
    );

    const updated = db.prepare('SELECT * FROM Recipe WHERE slug = ?').get(slug);
    return NextResponse.json(parseRecipe(updated));
  } catch (err) {
    console.error('[PUT /api/recipes/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = auth(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const existing = db.prepare('SELECT * FROM Recipe WHERE slug = ?').get(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM Recipe WHERE slug = ?').run(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/recipes/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
