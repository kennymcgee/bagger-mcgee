import { defineConfig } from "drizzle-kit";

// Generate SQL without credentials. Apply only through the guarded migration script.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
});
