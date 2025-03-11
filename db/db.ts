/*
Initializes the database connection and schema for the app.
*/

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

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
