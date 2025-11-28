// Load dotenv if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
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
