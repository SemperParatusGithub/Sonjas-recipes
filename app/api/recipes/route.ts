// app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db, { parseRecipe } from '@/lib/db';

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

  // Get total count
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const total = db.prepare(countQuery).get(...params) as { count: number };

  query += ' ORDER BY id LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);
  const recipes = rows.map(parseRecipe);

  return NextResponse.json({
    data: recipes,
    total: total.count,
  });
}

// POST - DISABLED FOR NOW
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Creating recipes disabled' }, { status: 403 });
}
