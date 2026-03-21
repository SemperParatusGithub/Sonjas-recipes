import { NextRequest } from 'next/server';
import { getSession } from '@/lib/db';

export interface Session {
  userId: number;
  email: string;
}

/**
 * Extract session from request cookies and validate.
 * Returns the session object if valid, null if not authenticated.
 */
export function auth(request: NextRequest): Session | null {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}
