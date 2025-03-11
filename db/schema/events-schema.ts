/*
Defines the database schema for events.
*/

import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  boolean
} from "drizzle-orm/pg-core"
import { profilesTable } from "./profiles-schema"

export const eventsTable = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  currency: text("currency").default("USD").notNull(),
  creatorId: text("creator_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertEvent = typeof eventsTable.$inferInsert
export type SelectEvent = typeof eventsTable.$inferSelect
