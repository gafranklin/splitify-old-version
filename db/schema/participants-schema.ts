/*
Defines the database schema for event participants.
*/

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { eventsTable } from "./events-schema"
import { profilesTable } from "./profiles-schema"

export const participantRoleEnum = pgEnum("participant_role", [
  "organizer",
  "member"
])

export const participantsTable = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .references(() => eventsTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => profilesTable.userId)
    .notNull(),
  role: participantRoleEnum("role").default("member").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  isActive: text("is_active").default("true").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Unique constraint to ensure a user can only be added to an event once
export const participantUniqueConstraint = pgTable(
  "participant_unique_constraint",
  {
    eventId: uuid("event_id")
      .references(() => eventsTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => profilesTable.userId)
      .notNull()
  },
  table => {
    return {
      pk: {
        name: "participant_unique_pk",
        columns: [table.eventId, table.userId]
      }
    }
  }
)

export type InsertParticipant = typeof participantsTable.$inferInsert
export type SelectParticipant = typeof participantsTable.$inferSelect
