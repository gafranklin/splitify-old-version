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
  connectionsTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Add debugging log to trace initialization
console.log(
  "DEBUG: Initializing database connection. Environment:",
  typeof window === "undefined" ? "Server" : "Client",
  "Is this a module evaluation or initialization:",
  new Error().stack?.split("\n").slice(0, 3)
)

config({ path: ".env.local" })

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
  connections: connectionsTable
}

// Only initialize database connection on the server
const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
