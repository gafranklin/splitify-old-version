import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { eventsTable } from "./events-schema"
import { expensesTable } from "./expenses-schema"
import { settlementsTable } from "./settlements-schema"

export const activityTypeEnum = pgEnum("activity_type", [
  "event_created",
  "event_updated",
  "event_deleted",
  "participant_added",
  "participant_removed",
  "expense_created",
  "expense_updated",
  "expense_deleted",
  "expense_split",
  "payment_requested",
  "payment_completed",
  "payment_confirmed",
  "payment_disputed",
  "payment_proof_uploaded",
  "settlement_created",
  "settlement_updated"
])

export const activityTable = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: activityTypeEnum("type").notNull(),
  eventId: uuid("event_id").references(() => eventsTable.id, {
    onDelete: "cascade"
  }),
  expenseId: uuid("expense_id").references(() => expensesTable.id, {
    onDelete: "cascade"
  }),
  settlementId: uuid("settlement_id").references(() => settlementsTable.id, {
    onDelete: "cascade"
  }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertActivity = typeof activityTable.$inferInsert
export type SelectActivity = typeof activityTable.$inferSelect
