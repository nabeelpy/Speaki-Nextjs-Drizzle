import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ADMIN_PREFIX, SIGN_IN_PATH, type Session, type SessionUser } from './auth.config';

const AUTH_COOKIE = 'speaki_session' as const;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Missing AUTH_SECRET');
  return new TextEncoder().encode(secret);
}

async function createJwt(payload: Record<string, unknown>) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TOKEN_TTL_SECONDS;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setAudience('speaki')
    .setIssuer('speaki')
    .sign(getSecret());
}

async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), {
    audience: 'speaki',
    issuer: 'speaki',
  });
  return payload as any;
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifyJwt(token);
    const user: SessionUser = {
      id: String(payload.sub),
      email: String(payload.email),
      name: (payload.name as string) ?? null,
      role: (payload.role as string) ?? null,
      avatar: (payload.avatar as string) ?? null,
    };
    return { user };
  } catch {
    return null;
  }
}

export async function signIn(provider: 'credentials', formData: FormData): Promise<void> {
  if (provider !== 'credentials') {
    throw new AuthError('ProviderNotSupported', 'Only credentials sign-in is supported');
  }

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    throw new AuthError('CredentialsSignin', 'Invalid credentials payload');
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      role: users.role,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0] as any | undefined;

  if (!user || !user.password) {
    throw new AuthError('CredentialsSignin', 'Invalid email or password');
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AuthError('CredentialsSignin', 'Invalid email or password');
  }

  const token = await createJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar ?? null,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export const handlers = {
  GET: () => new Response('Not Found', { status: 404 }),
  POST: () => new Response('Not Found', { status: 404 }),
};
