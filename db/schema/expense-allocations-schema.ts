/*
Defines the database schema for expense allocations.
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric
} from "drizzle-orm/pg-core"
import { expensesTable } from "./expenses-schema"
import { expenseItemsTable } from "./expense-items-schema"
import { participantsTable } from "./participants-schema"

export const allocationTypeEnum = pgEnum("allocation_type", [
  "equal", // Split equally among all participants
  "percent", // Split by percentage
  "amount", // Split by fixed amount
  "custom" // Custom allocation
])

export const expenseAllocationsTable = pgTable("expense_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .references(() => expensesTable.id, { onDelete: "cascade" })
    .notNull(),
  expenseItemId: uuid("expense_item_id").references(
    () => expenseItemsTable.id,
    { onDelete: "cascade" }
  ),
  participantId: uuid("participant_id")
    .references(() => participantsTable.id, { onDelete: "cascade" })
    .notNull(),
  allocationType: allocationTypeEnum("allocation_type")
    .default("equal")
    .notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertExpenseAllocation =
  typeof expenseAllocationsTable.$inferInsert
export type SelectExpenseAllocation =
  typeof expenseAllocationsTable.$inferSelect
