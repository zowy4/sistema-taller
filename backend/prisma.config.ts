// Cargamos las variables de entorno desde el .env antes de usar env("DATABASE_URL")
import 'dotenv/config';

// Export a minimal config object compatible with Prisma's TS expectations.
// Use process.env.DATABASE_URL (set via .env) for local development.
export default {
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  engine: 'classic',
  datasource: { url: process.env.DATABASE_URL },
};
