/*
This script checks the schema configuration in more detail
Run with: npx -y tsx db/schema-check.ts
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

const connectionString: string = dbUrl

async function checkSchema() {
  // Create a direct connection to the database
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    console.log("Checking database connection...")
    await db.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // Check what schemas exist in the database
    console.log("\nChecking schemas:")
    const schemasResult = await db.execute(sql`
      SELECT schema_name
      FROM information_schema.schemata
      ORDER BY schema_name
    `)

    const schemas = schemasResult.map((row: any) => row.schema_name)
    console.log("Schemas:", schemas.join(", "))

    // Check what tables exist in the public schema
    console.log("\nChecking tables in public schema:")
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const tables = tablesResult.map((row: any) => row.table_name)
    console.log("Tables:", tables.join(", "))

    // Check the search_path setting
    console.log("\nChecking search_path:")
    const searchPathResult = await db.execute(sql`SHOW search_path`)
    console.log("Search path:", searchPathResult[0]?.search_path)

    // Check permissions on the events table
    if (tables.includes("events")) {
      console.log("\nChecking permissions on events table:")
      const permissionsResult = await db.execute(sql`
        SELECT grantee, privilege_type
        FROM information_schema.table_privileges
        WHERE table_schema = 'public'
        AND table_name = 'events'
      `)

      if (permissionsResult.length > 0) {
        const permissions = permissionsResult.map(
          (row: any) => `${row.grantee}: ${row.privilege_type}`
        )
        console.log("Permissions:", permissions.join(", "))
      } else {
        console.log("No specific permissions found")
      }

      // Check if Row Level Security is enabled
      const rlsResult = await db.execute(sql`
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relname = 'events'
        AND relkind = 'r'
      `)

      const hasRLS = rlsResult[0]?.relrowsecurity === true
      console.log(`RLS is ${hasRLS ? "enabled" : "disabled"} on events table`)

      if (hasRLS) {
        // Check RLS policies
        const rlsPoliciesResult = await db.execute(sql`
          SELECT polname, polcmd
          FROM pg_policy
          WHERE polrelid = 'public.events'::regclass
        `)

        if (rlsPoliciesResult.length > 0) {
          console.log("RLS Policies:")
          rlsPoliciesResult.forEach((row: any) => {
            console.log(`- ${row.polname} (${row.polcmd})`)
          })
        } else {
          console.log("No RLS policies found on the events table")
        }
      }
    }
  } catch (error) {
    console.error("Error checking schema:", error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

checkSchema().catch(console.error)
