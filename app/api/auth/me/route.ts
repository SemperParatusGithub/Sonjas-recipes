import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  const session = getSession(sessionId || '');

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: { id: session.userId, email: session.email } });
}
