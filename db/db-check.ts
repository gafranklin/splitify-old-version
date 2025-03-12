/*
This is a simplified script to check if the database tables exist.
Run with: npx -y tsx db/db-check.ts
*/

import { config } from "dotenv"
import postgres from "postgres"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"

// Load environment variables
console.log("Loading environment variables...")
config({ path: ".env.local" })

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error("DATABASE_URL is not defined in .env.local")
  process.exit(1)
}

// Since we checked for dbUrl above, we know it's not undefined here
const connectionString: string = dbUrl

async function checkDb() {
  // Create a direct connection to the database
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    console.log("Checking database connection...")
    await db.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // Check for the events table
    const eventsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'events'
      )
    `)

    const eventsTableExists = eventsResult[0]?.exists === true
    console.log(
      `${eventsTableExists ? "✅" : "❌"} events table ${eventsTableExists ? "exists" : "does not exist"}`
    )

    // Check other important tables
    const tables = ["profiles", "participants", "expenses", "expense_items"]
    for (const table of tables) {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = ${table}
        )
      `)

      const exists = result[0]?.exists === true
      console.log(
        `${exists ? "✅" : "❌"} ${table} table ${exists ? "exists" : "does not exist"}`
      )
    }

    // Check if the schema looks correct by checking a few column names
    if (eventsTableExists) {
      console.log("\nChecking events table structure:")
      const columnsResult = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events'
      `)

      const columns = columnsResult.map((row: any) => row.column_name)
      console.log("Columns:", columns.join(", "))

      const expectedColumns = [
        "id",
        "name",
        "description",
        "location",
        "start_date",
        "end_date",
        "creator_id"
      ]
      const missingColumns = expectedColumns.filter(
        col => !columns.includes(col)
      )

      if (missingColumns.length > 0) {
        console.log(`❌ Missing expected columns: ${missingColumns.join(", ")}`)
      } else {
        console.log("✅ All expected columns exist")
      }
    }
  } catch (error) {
    console.error("Error checking database:", error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

checkDb().catch(console.error)
