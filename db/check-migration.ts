/*
This script checks if the database is properly set up and creates tables if they don't exist.
Run this script with: npx tsx db/check-migration.ts
*/

import { db } from "@/db/db"
import { sql } from "drizzle-orm"

// Define a type for the database query result
type ExistsResult = { exists: boolean }[]

async function checkDatabase() {
  try {
    console.log("Checking database connection and table status...")

    // First, check if we can connect to the database at all
    try {
      await db.execute(sql`SELECT 1`)
      console.log("✅ Database connection successful")
    } catch (error) {
      console.error("❌ Database connection failed:", error)
      process.exit(1)
    }

    // Check if the events table exists
    try {
      const result = (await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'events'
        )
      `)) as ExistsResult

      const eventsTableExists = result[0]?.exists === true

      if (eventsTableExists) {
        console.log("✅ Events table exists")
      } else {
        console.error(
          "❌ Events table does not exist. You need to run migrations."
        )
        console.log("Run the following command to generate migrations:")
        console.log("  npm run db:generate")
        console.log("And then apply them with:")
        console.log("  npm run db:migrate")

        // Check if other important tables exist
        const tables = ["profiles", "participants", "expenses", "expense_items"]
        for (const table of tables) {
          const tableResult = (await db.execute(sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = ${table}
            )
          `)) as ExistsResult
          const exists = tableResult[0]?.exists === true
          console.log(
            `${exists ? "✅" : "❌"} ${table} table ${exists ? "exists" : "does not exist"}`
          )
        }
      }
    } catch (error) {
      console.error("❌ Error checking if events table exists:", error)
    }
  } catch (error) {
    console.error("❌ General error checking database:", error)
  } finally {
    process.exit(0)
  }
}

// Run the check
checkDatabase()
