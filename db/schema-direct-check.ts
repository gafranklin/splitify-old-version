/*
This script attempts to directly query and insert into the events table
to test if it's accessible and working properly.
Run with: npx -y tsx db/schema-direct-check.ts
*/

import { config } from "dotenv"
import postgres from "postgres"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import { v4 as uuidv4 } from "uuid"

// Load environment variables
console.log("Loading environment variables...")
config({ path: ".env.local" })

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error("DATABASE_URL is not defined in .env.local")
  process.exit(1)
}

const connectionString: string = dbUrl

async function checkDirectTableAccess() {
  // Create a direct connection to the database
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    console.log("Checking database connection...")
    await db.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // Directly test if the events table exists by trying to query it
    try {
      console.log("\nAttempting to query the events table directly...")
      const result = await db.execute(sql`SELECT * FROM events LIMIT 5`)

      if (result.length > 0) {
        console.log(
          `✅ Successfully queried events table, found ${result.length} records`
        )
        console.log("First record:", JSON.stringify(result[0], null, 2))
      } else {
        console.log("✅ Successfully queried events table, but it's empty")
      }
    } catch (error) {
      console.error("❌ Error querying events table:", error)
    }

    // Try to insert a test record
    try {
      const testId = uuidv4()
      console.log("\nAttempting to insert a test record in events table...")

      await db.execute(sql`
        INSERT INTO events (
          id, name, description, location, 
          is_active, currency, creator_id,
          created_at, updated_at
        ) VALUES (
          ${testId}, 'Test Event', 'Test Description', 'Test Location', 
          true, 'USD', 'test-user',
          NOW(), NOW()
        )
      `)

      console.log("✅ Successfully inserted test record")

      // Query the inserted record
      const insertedRecord = await db.execute(sql`
        SELECT * FROM events WHERE id = ${testId}
      `)

      console.log(
        "Inserted record:",
        JSON.stringify(insertedRecord[0], null, 2)
      )

      // Clean up by deleting the test record
      await db.execute(sql`DELETE FROM events WHERE id = ${testId}`)
      console.log("✅ Successfully deleted test record")
    } catch (error) {
      console.error("❌ Error inserting into events table:", error)
    }
  } catch (error) {
    console.error("Error checking database:", error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

checkDirectTableAccess().catch(console.error)
