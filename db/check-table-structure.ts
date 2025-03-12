/*
This script checks the actual structure of the database tables to see what columns they have
Run with: npx -y tsx db/check-table-structure.ts
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

async function checkTableStructure() {
  // Create a direct connection to the database
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    console.log("Checking database connection...")
    await db.execute(sql`SELECT 1`)
    console.log("✅ Database connection successful")

    // Check which tables exist in the public schema
    console.log("\nTables in public schema:")
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const tables = tablesResult.map((row: any) => row.table_name)
    console.log(tables.join(", "))

    // For each table, check its columns
    for (const table of ["profiles", "events", "participants"]) {
      console.log(`\nColumns in ${table} table:`)

      try {
        const columnsResult = await db.execute(sql`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${table}
          ORDER BY ordinal_position
        `)

        if (columnsResult.length === 0) {
          console.log(
            `No columns found for ${table} table (table might not exist)`
          )
          continue
        }

        console.log("Column Name\tData Type\tNullable")
        console.log("------------------------------------------------")
        columnsResult.forEach((col: any) => {
          console.log(
            `${col.column_name}\t${col.data_type}\t${col.is_nullable}`
          )
        })
      } catch (error) {
        console.error(`Error checking columns for ${table}:`, error)
      }

      // Check for foreign keys
      try {
        const fksResult = await db.execute(sql`
          SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = ${table}
        `)

        if (fksResult.length > 0) {
          console.log("\nForeign Keys:")
          fksResult.forEach((fk: any) => {
            console.log(
              `${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} (${fk.constraint_name})`
            )
          })
        }
      } catch (error) {
        console.error(`Error checking foreign keys for ${table}:`, error)
      }
    }
  } catch (error) {
    console.error("Error checking table structure:", error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

checkTableStructure().catch(console.error)
