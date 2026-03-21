import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AddRecipeForm } from '@/components/AddRecipeForm';
import { getSession } from '@/lib/db';

export default async function AddRecipePage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  const session = getSession(sessionId || '');

  if (!session) {
    redirect('/login');
  }

  return <AddRecipeForm />;
}
