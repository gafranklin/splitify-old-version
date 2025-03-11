/*
Defines the database schema for settlements.
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

export const settlementStatusEnum = pgEnum("settlement_status", [
  "pending", // Settlement created but not paid
  "requested", // Payment requested through a payment service
  "completed", // Settlement confirmed as paid
  "cancelled" // Settlement cancelled
])

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash", // Paid with cash
  "venmo", // Paid with Venmo
  "paypal", // Paid with PayPal
  "zelle", // Paid with Zelle
  "other" // Other payment method
])

export const settlementsTable = pgTable("settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .references(() => eventsTable.id, { onDelete: "cascade" })
    .notNull(),
  fromParticipantId: uuid("from_participant_id")
    .references(() => participantsTable.id, { onDelete: "cascade" })
    .notNull(),
  toParticipantId: uuid("to_participant_id")
    .references(() => participantsTable.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: settlementStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentReference: text("payment_reference"), // Reference number, transaction ID, etc.
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  requestedAt: timestamp("requested_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertSettlement = typeof settlementsTable.$inferInsert
export type SelectSettlement = typeof settlementsTable.$inferSelect
