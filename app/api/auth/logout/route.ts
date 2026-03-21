import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';

export async function POST(request: Request) {
  const sessionId = request.cookies.get('session')?.value;
  if (sessionId) {
    deleteSession(sessionId);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
