import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.url(),
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PORT: z.coerce.number().default(6379),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Variáveis de ambiente inválidas:', parsedEnv.error);
    process.exit(1);
}

export const config = {
    env: parsedEnv.data.NODE_ENV,
    database:{
        url: parsedEnv.data.DATABASE_URL,
    },
    redis: {
        host: parsedEnv.data.REDIS_HOST,
        port: parsedEnv.data.REDIS_PORT,
    }
}