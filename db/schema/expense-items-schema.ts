/*
Defines the database schema for expense items.
*/

import { pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core"
import { expensesTable } from "./expenses-schema"

export const expenseItemsTable = pgTable("expense_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .references(() => expensesTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 8, scale: 2 })
    .default("1")
    .notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertExpenseItem = typeof expenseItemsTable.$inferInsert
export type SelectExpenseItem = typeof expenseItemsTable.$inferSelect
