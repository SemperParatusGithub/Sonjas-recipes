import { NextRequest, NextResponse } from 'next/server';
import db, { parseRecipe, getSession } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = 'SELECT * FROM Recipe WHERE 1=1';
  const params: any[] = [];

  if (q) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const total = db.prepare(countQuery).get(...params) as { count: number };

  query += ' ORDER BY id LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);
  const recipes = rows.map(parseRecipe);

  return NextResponse.json({ data: recipes, total: total.count });
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  const session = getSession(sessionId || '');

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, difficulty, prepTimeMin, cookTimeMin, servings, ingredients, steps, tags, imageUrl, tips } = body;

    if (!title || !category || !ingredients || !steps) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO Recipe (slug, title, description, category, difficulty, prepTimeMin, cookTimeMin, servings, ingredients, steps, tags, imageUrl, tip, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug, title, description || null, category, difficulty || null,
      prepTimeMin || null, cookTimeMin || null, servings || null,
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
