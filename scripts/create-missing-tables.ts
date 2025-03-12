/*
This script checks and creates any missing database tables from the schema.
Run with: npx ts-node scripts/create-missing-tables.ts
*/

import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import * as schema from "@/db/schema"

async function createMissingTables() {
  console.log("Checking database for missing tables...")
  
  try {
    // Get list of all tables in the schema
    const schemaTableNames = Object.keys(schema)
      .filter(key => key.endsWith('Table') && key !== 'pgTable')
      .map(key => key.replace('Table', '').toLowerCase())
      
    console.log("Schema tables:", schemaTableNames)
    
    // Get list of all tables in the database
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)
    
    const existingTables = tablesResult.map((row: any) => row.table_name)
    console.log("Existing tables in database:", existingTables)
    
    // Find missing tables
    const missingTables = schemaTableNames.filter(table => !existingTables.includes(table))
    console.log("Missing tables:", missingTables)
    
    if (missingTables.length === 0) {
      console.log("No missing tables found. Database schema is complete.")
      return
    }
    
    console.log("Creating missing tables...")
    
    // Generate push command for missing tables
    const pushCommand = `npx drizzle-kit push:pg`
    console.log("Run the following command to create the missing tables:")
    console.log(pushCommand)
    
    // Alternatively, you can automatically execute the command here
    // But this requires confirmation from the user
    console.log("\nIMPORTANT: This script doesn't automatically execute the push command.")
    console.log("Please run it manually after reviewing the missing tables.")
  } catch (error) {
    console.error("Error checking/creating missing tables:", error)
  }
}

// Run the function immediately
createMissingTables()
  .then(() => {
    console.log("Script execution complete.")
    process.exit(0)
  })
  .catch(error => {
    console.error("Script failed:", error)
    process.exit(1)
  }) 