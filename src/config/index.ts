import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1).default('file:./prisma/dev.db'),
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PORT: z.coerce.number().default(6379),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    JWT_SECRET: z.string().min(1, "A secret do JWT é obrigatória"),

    MAILTRAP_API_KEY: z.string().min(1, "A chave da API do Mailtrap é obrigatória."),
    EMAIL_FROM: z.email("EMAIL_FROM deve ser um e-mail válido."),
    EMAIL_NAME_FROM: z.string().min(1, "O nome do remetente (EMAIL_NAME_FROM) é obrigatório."),
    NEXT_PUBLIC_DOMAIN_LINK_URL: z.url().catch('saga.cnt.br'),
    MAILTRAP_PASSWORD_RESET_TEMPLATE_UUID: z.uuid("O UUID do template do Mailtrap é obrigatório."),
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
    },
    jwt: {
        secret: parsedEnv.data.JWT_SECRET,
    },
    mail: {
        token: parsedEnv.data.MAILTRAP_API_KEY,
        fromEmail: parsedEnv.data.EMAIL_FROM,
        fromName: parsedEnv.data.EMAIL_NAME_FROM,
        domainLink: parsedEnv.data.NEXT_PUBLIC_DOMAIN_LINK_URL,
        templates: {
        passwordReset: parsedEnv.data.MAILTRAP_PASSWORD_RESET_TEMPLATE_UUID,
        },
    }
}