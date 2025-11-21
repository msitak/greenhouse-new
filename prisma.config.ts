// Load dotenv only in non-production environments (Vercel injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Direct TCP connection to PostgreSQL
    url: env('DATABASE_URL'),
  },
});
