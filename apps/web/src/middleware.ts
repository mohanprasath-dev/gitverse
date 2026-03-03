import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * - Applies security headers
 * - Rate-limits API routes
 * - Protects /galaxy routes (requires session)
 */

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per window

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return true; // Rate limited
  }
  return false;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://avatars.githubusercontent.com",
      "font-src 'self'",
      "connect-src 'self' https://api.github.com https://openrouter.ai",
      "worker-src 'self' blob:",
    ].join('; ')
  );

  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown';
    if (rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
