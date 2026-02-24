export const SIGN_IN_PATH = '/admin/login' as const;
export const ADMIN_PREFIX = '/admin' as const;

export type Role = 'user' | 'admin' | string;

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: Role | null;
  avatar?: string | null;
}

export interface Session {
  user: SessionUser;
}
