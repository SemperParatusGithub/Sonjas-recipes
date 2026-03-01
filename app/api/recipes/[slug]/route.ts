// app/api/recipes/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db, { parseRecipe } from '@/lib/db';

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

// PATCH - DISABLED FOR NOW
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return NextResponse.json({ error: 'Editing disabled' }, { status: 403 });
}

// DELETE - DISABLED FOR NOW
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return NextResponse.json({ error: 'Deleting disabled' }, { status: 403 });
}
