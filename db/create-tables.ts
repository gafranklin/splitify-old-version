/*
This script directly creates the necessary tables in the database.
Use this only if migrations are not working properly.
Run with: npx tsx db/create-tables.ts
*/

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { sql } from "drizzle-orm"

console.log("Loading environment variables...")
config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in .env.local")
  process.exit(1)
}

async function createTables() {
  // Create a client with higher timeout for schema operations
  const pgClient = postgres(process.env.DATABASE_URL!, {
    max: 1,
    idle_timeout: 60
  })

  const db = drizzle(pgClient)

  try {
    console.log("Connecting to database...")
    await db.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // Check if events table exists
    const eventTableExists = await checkTableExists(db, "events")

    if (eventTableExists) {
      console.log("✅ Events table already exists")
    } else {
      console.log("Creating events table...")

      // First make sure profiles table exists, as events references it
      const profilesTableExists = await checkTableExists(db, "profiles")

      if (!profilesTableExists) {
        console.log("Creating profiles table first...")
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY,
            email TEXT,
            display_name TEXT,
            is_onboarded BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          )
        `)
        console.log("✅ Profiles table created")
      }

      // Create events table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          location TEXT,
          start_date TIMESTAMP WITH TIME ZONE,
          end_date TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true NOT NULL,
          currency TEXT DEFAULT 'USD' NOT NULL,
          creator_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        )
      `)
      console.log("✅ Events table created")
    }

    // Check if participants table exists
    const participantsTableExists = await checkTableExists(db, "participants")

    if (participantsTableExists) {
      console.log("✅ Participants table already exists")
    } else {
      console.log("Creating participants table...")
      await db.execute(sql`
        CREATE TYPE participant_role AS ENUM ('organizer', 'member', 'viewer');
        
        CREATE TABLE IF NOT EXISTS participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL REFERENCES profiles(user_id),
          role participant_role DEFAULT 'member' NOT NULL,
          display_name TEXT,
          email TEXT,
          is_active TEXT DEFAULT 'true' NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        )
      `)
      console.log("✅ Participants table created")
    }

    console.log("Database tables setup completed!")
  } catch (error) {
    console.error("Error creating tables:", error)
    process.exit(1)
  } finally {
    await pgClient.end()
  }
}

// Helper function to check if a table exists
async function checkTableExists(db: any, tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    )
  `)

  return result[0]?.exists === true
}

createTables().catch(console.error)
