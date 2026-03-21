import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRecipe } from '@/lib/db';
import { parseRecipe } from '@/lib/db';
import { EditRecipeForm } from '@/components/EditRecipeForm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const session = auth(request);
  if (!session) {
    redirect('/login');
  }

  const { slug } = await params;
  const recipe = getRecipe(slug);

  if (!recipe) {
    return (
      <div className="not-found" style={{ textAlign: 'center', padding: '4rem' }}>
        <h1>404</h1>
        <p>Rezept nicht gefunden.</p>
        <a href="/recipes" className="btn btn-primary">Alle Rezepte</a>
      </div>
    );
  }

  return <EditRecipeForm slug={slug} initialRecipe={recipe} />;
}
