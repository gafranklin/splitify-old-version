/*
Defines the database schema for receipts.
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean
} from "drizzle-orm/pg-core"
import { expensesTable } from "./expenses-schema"

export const receiptStatusEnum = pgEnum("receipt_status", [
  "pending", // Receipt uploaded but not processed
  "processing", // OCR in progress
  "processed", // OCR completed
  "failed" // OCR failed
])

export const receiptsTable = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .references(() => expensesTable.id, { onDelete: "cascade" })
    .notNull(),
  storagePath: text("storage_path").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  status: receiptStatusEnum("status").default("pending").notNull(),
  ocrData: text("ocr_data"), // JSON string of extracted OCR data
  hasBeenReviewed: boolean("has_been_reviewed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertReceipt = typeof receiptsTable.$inferInsert
export type SelectReceipt = typeof receiptsTable.$inferSelect
