import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/krishipath_company'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me-123456'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me-12345'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:8443'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`);

export const env = { ...parsed.data, corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((v) => v.trim()) };
