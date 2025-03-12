/*
Configures Drizzle for the app.
*/

import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./db/schema/*schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { 
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
