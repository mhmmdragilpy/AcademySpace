import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000/api'),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
});

// Validate process.env
const _env = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
});

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    // In client, we might not want to throw to avoid breaking build if envs are injected at runtime
    // But for "Type Safety and Validation", we should at least warn or provide defaults safely.
}

export const env = _env.data || {
    NEXT_PUBLIC_API_URL: 'http://localhost:5000/api'
};
