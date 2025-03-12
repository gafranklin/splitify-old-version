/*
This script simulates the full workflow of creating a profile and then an event
to verify if the process works end-to-end.
Run with: npx -y tsx db/test-workflow.ts
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

async function testWorkflow() {
  // Create a direct connection to the database
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    console.log("Checking database connection...")
    await db.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // First, check if the profiles table exists
    try {
      const profilesResult = await db.execute(
        sql`SELECT * FROM profiles LIMIT 1`
      )
      console.log("✅ Profiles table exists and is accessible")
      if (profilesResult.length > 0) {
        console.log(`Found ${profilesResult.length} existing profiles`)
      }
    } catch (error) {
      console.error("❌ Error accessing profiles table:", error)
      return
    }

    // Create a test profile with the correct schema
    const testUserId = `test-user-${Date.now()}`
    try {
      console.log(`\nCreating test profile with user ID: ${testUserId}`)
      await db.execute(sql`
        INSERT INTO profiles (
          user_id, membership, created_at, updated_at
        ) VALUES (
          ${testUserId}, 'free', NOW(), NOW()
        )
      `)
      console.log("✅ Test profile created successfully")
    } catch (error) {
      console.error("❌ Error creating test profile:", error)
      return
    }

    // Now create a test event
    const testEventId = uuidv4()
    try {
      console.log(`\nCreating test event with ID: ${testEventId}`)
      await db.execute(sql`
        INSERT INTO events (
          id, name, description, location, 
          is_active, currency, creator_id,
          created_at, updated_at
        ) VALUES (
          ${testEventId}, 'Test Event', 'Test Description', 'Test Location', 
          true, 'USD', ${testUserId},
          NOW(), NOW()
        )
      `)
      console.log("✅ Test event created successfully")

      // Query to verify event was created
      const event = await db.execute(
        sql`SELECT * FROM events WHERE id = ${testEventId}`
      )
      console.log("Event details:", JSON.stringify(event[0], null, 2))
    } catch (error) {
      console.error("❌ Error creating test event:", error)
    }

    // Finally, add the creator as an organizer participant
    try {
      console.log("\nAdding creator as participant")
      await db.execute(sql`
        INSERT INTO participants (
          event_id, user_id, role, is_active,
          created_at, updated_at
        ) VALUES (
          ${testEventId}, ${testUserId}, 'organizer', 'true',
          NOW(), NOW()
        )
      `)
      console.log("✅ Participant added successfully")

      // Query to verify participant was added
      const participant = await db.execute(sql`
        SELECT * FROM participants 
        WHERE event_id = ${testEventId} AND user_id = ${testUserId}
      `)
      console.log(
        "Participant details:",
        JSON.stringify(participant[0], null, 2)
      )
    } catch (error) {
      console.error("❌ Error adding participant:", error)
    }

    // Clean up test data
    try {
      console.log("\nCleaning up test data...")
      await db.execute(
        sql`DELETE FROM participants WHERE user_id = ${testUserId}`
      )
      await db.execute(sql`DELETE FROM events WHERE creator_id = ${testUserId}`)
      await db.execute(sql`DELETE FROM profiles WHERE user_id = ${testUserId}`)
      console.log("✅ Test data cleaned up successfully")
    } catch (error) {
      console.error("❌ Error cleaning up test data:", error)
    }
  } catch (error) {
    console.error("Error during workflow test:", error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

testWorkflow().catch(console.error)
