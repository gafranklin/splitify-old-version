/*
Initializes the database connection and schema for the app.
*/

// Import server-only to prevent client components from importing this file
import "server-only"

import {
  profilesTable,
  eventsTable,
  participantsTable,
  participantUniqueConstraint,
  expensesTable,
  expenseItemsTable,
  expenseAllocationsTable,
  receiptsTable,
  ridesharesTable,
  settlementsTable,
  connectionsTable,
  activityTable,
  notificationTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Add more detailed debugging log to trace initialization
console.log(
  "DEBUG: Initializing database connection. Environment:",
  typeof window === "undefined" ? "Server" : "Client",
  "Is this a module evaluation or initialization:",
  new Error().stack?.split("\n").slice(0, 3)
)

// Load environment variables
console.log("Loading environment variables...")
config({ path: ".env.local" })

// Log database connection details (without exposing credentials)
const dbUrl = process.env.DATABASE_URL
console.log("Database URL present:", !!dbUrl)
if (dbUrl) {
  try {
    const sanitizedUrl = new URL(dbUrl)
    sanitizedUrl.password = "REDACTED"
    console.log("Database connection:", sanitizedUrl.toString())
    console.log("Database host:", sanitizedUrl.host)
    console.log("Database pathname:", sanitizedUrl.pathname)
  } catch (error) {
    console.error("Error parsing database URL:", error)
  }
}

// Define the schema object with all tables
const schema = {
  profiles: profilesTable,
  events: eventsTable,
  participants: participantsTable,
  participantUniqueConstraint: participantUniqueConstraint,
  expenses: expensesTable,
  expenseItems: expenseItemsTable,
  expenseAllocations: expenseAllocationsTable,
  receipts: receiptsTable,
  rideshares: ridesharesTable,
  settlements: settlementsTable,
  connections: connectionsTable,
  activities: activityTable,
  notifications: notificationTable
}

console.log("Schema tables configured:", Object.keys(schema).join(", "))

// Define the database type explicitly
type Database = PostgresJsDatabase<typeof schema>

// Initialize database connection
let client: postgres.Sql | undefined
let db: Database

// Only initialize database connection on the server
try {
  console.log("Creating Postgres client...")
  client = postgres(process.env.DATABASE_URL!)
  console.log("Postgres client created successfully")

  console.log("Initializing Drizzle ORM with schema...")
  db = drizzle(client, { schema }) as Database
  console.log("Drizzle ORM initialized successfully")
} catch (error) {
  console.error("CRITICAL: Failed to initialize database connection:", error)
  // Re-throw to prevent app from starting with broken DB connection
  throw error
}

// Export the database connection
export { db }
