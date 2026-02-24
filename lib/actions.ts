'use server';

import { signIn, AuthError } from '@/auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.code === 'CredentialsSignin') {
                return 'Invalid credentials.';
            }
            return 'Something went wrong.';
        }
        throw error;
    }
}
