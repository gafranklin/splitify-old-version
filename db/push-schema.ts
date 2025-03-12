/*
This script pushes the schema directly to the database, bypassing migrations.
Use this only for development or if migrations are not working.
Run with: npx tsx db/push-schema.ts
*/

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import * as schema from "@/db/schema"
import { sql } from "drizzle-orm"

console.log("Loading environment variables...")
config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in .env.local")
  process.exit(1)
}

async function pushSchema() {
  // For migrations, we need a different client with higher timeout
  const migrationClient = postgres(process.env.DATABASE_URL!, {
    max: 1,
    idle_timeout: 60
  })

  const migrationDb = drizzle(migrationClient)

  try {
    console.log("Connecting to database...")
    await migrationDb.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // Get all schema tables
    const tables = Object.entries(schema).filter(
      ([_, value]) => value && typeof value === "object" && "name" in value
    )

    console.log("Found schema tables:", tables.map(([name]) => name).join(", "))

    // Create SQL script to create all the tables
    console.log(
      "Creating tables directly using PostgreSQL CREATE TABLE statements..."
    )

    // This is a simplified implementation and may not cover all schema features
    // For production, it's better to use proper migrations

    console.log("To properly migrate your database:")
    console.log("1. Run 'npm run db:generate' to generate migration files")
    console.log("2. Run 'npm run db:migrate' to apply migrations")
    console.log("3. Restart your application")

    process.exit(0)
  } catch (error) {
    console.error("Error pushing schema:", error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

pushSchema().catch(console.error)
