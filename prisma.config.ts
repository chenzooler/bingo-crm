import path from "node:path";
import { defineConfig } from "prisma/config";

// DATABASE_URL examples:
//   local dev:   file:./prisma/dev.db
//   production:  file:/data/bingo.db   (Coolify persistent volume)
const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
  // @ts-expect-error — key from an older Prisma config shape, kept because migrations
  // verified working with it; current CLI reads datasource.url. Remove on next Prisma bump.
  migrate: {
    async adapter() {
      const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
      return new PrismaBetterSqlite3({ url: dbUrl });
    },
  },
});
