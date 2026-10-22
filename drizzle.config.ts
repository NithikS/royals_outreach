import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit (push/introspect/studio) needs a direct, non-pooled
// connection — Neon's pooled (pgbouncer) endpoint hangs on the
// schema-introspection queries these commands run. The app's runtime
// (src/db/index.ts) is unaffected and keeps using the pooled DATABASE_URL.
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
});
