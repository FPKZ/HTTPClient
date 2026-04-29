import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./electron/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "sqlite.db",
  },
});
