import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SIGN_IN_PATH, ADMIN_PREFIX } from './auth.config';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const AUTH_COOKIE = 'speaki_session';

async function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('Missing AUTH_SECRET');
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (!cookie) return false;
  try {
    await jwtVerify(cookie, await getSecret(), { audience: 'speaki', issuer: 'speaki' });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const onAdmin = pathname.startsWith(ADMIN_PREFIX);
  const onLogin = pathname.startsWith(SIGN_IN_PATH);

  if (!onAdmin) return NextResponse.next();

  const ok = await isAuthenticated(req);
  if (onLogin) {
    return ok ? NextResponse.redirect(new URL('/admin', req.url)) : NextResponse.next();
  }
  if (!ok) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
