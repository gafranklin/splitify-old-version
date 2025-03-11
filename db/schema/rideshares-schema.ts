/*
Defines the database schema for rideshares.
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  jsonb
} from "drizzle-orm/pg-core"
import { expensesTable } from "./expenses-schema"

// Note: Lyft integration is not implemented yet (API is not publicly available),
// but keeping it in the enum for future support
export const rideshareProviderEnum = pgEnum("rideshare_provider", [
  "uber",
  "lyft",
  "other"
])

export const ridesharesTable = pgTable("rideshares", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .references(() => expensesTable.id, { onDelete: "cascade" })
    .notNull(),
  provider: rideshareProviderEnum("provider").notNull(),
  rideId: text("ride_id"), // External ID from the provider
  pickupAddress: text("pickup_address"),
  dropoffAddress: text("dropoff_address"),
  pickupTime: timestamp("pickup_time"),
  dropoffTime: timestamp("dropoff_time"),
  distance: numeric("distance", { precision: 8, scale: 2 }), // Distance in miles or km
  duration: numeric("duration", { precision: 8, scale: 2 }), // Duration in minutes
  rawData: jsonb("raw_data"), // Raw JSON data from the provider's API
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertRideshare = typeof ridesharesTable.$inferInsert
export type SelectRideshare = typeof ridesharesTable.$inferSelect
