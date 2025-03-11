/*
Defines the database schema for expenses.
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric
} from "drizzle-orm/pg-core"
import { eventsTable } from "./events-schema"
import { participantsTable } from "./participants-schema"

export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "confirmed",
  "cancelled"
])

export const expensesTable = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .references(() => eventsTable.id, { onDelete: "cascade" })
    .notNull(),
  payerId: uuid("payer_id")
    .references(() => participantsTable.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: expenseStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertExpense = typeof expensesTable.$inferInsert
export type SelectExpense = typeof expensesTable.$inferSelect
