export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (sessionId) {
    deleteSession(sessionId);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
