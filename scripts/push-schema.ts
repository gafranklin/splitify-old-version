/*
This script pushes the schema changes to the database.
Run with: npx ts-node scripts/push-schema.ts
*/

import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

async function pushSchema() {
  console.log("Pushing schema changes to the database...")

  try {
    // First, show the current tables in the database
    console.log("Current tables in database:")
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)
    
    console.log(tablesResult)
    
    // Run drizzle-kit push to create tables
    console.log("Running drizzle-kit push:pg command...")
    
    try {
      const { stdout, stderr } = await execPromise("npx drizzle-kit push:pg")
      
      console.log("Command output:", stdout)
      
      if (stderr) {
        console.error("Command error:", stderr)
      }
      
      console.log("Schema push complete.")
      
      // Check tables again to confirm they were created
      console.log("Updated tables in database:")
      const updatedTablesResult = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `)
      
      console.log(updatedTablesResult)
      
      return true
    } catch (execError: any) {
      console.error("Error running drizzle-kit push:pg:", execError.message)
      
      if (execError.stderr) {
        console.error("Command stderr:", execError.stderr)
      }
      
      console.log("To manually push schema changes, run: npx drizzle-kit push:pg")
      return false
    }
  } catch (error) {
    console.error("Error pushing schema:", error)
    return false
  }
}

// Run the function immediately
pushSchema()
  .then((success) => {
    console.log("Script execution complete. Success:", success)
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error("Script failed:", error)
    process.exit(1)
  }) 