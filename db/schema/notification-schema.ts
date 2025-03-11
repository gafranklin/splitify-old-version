import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { eventsTable } from "./events-schema"
import { settlementsTable } from "./settlements-schema"

export const notificationTypeEnum = pgEnum("notification_type", [
  "payment_request",
  "payment_reminder",
  "payment_received",
  "payment_confirmed",
  "payment_disputed",
  "event_invitation",
  "expense_added",
  "settlement_updated"
])

export const notificationTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  eventId: uuid("event_id").references(() => eventsTable.id, {
    onDelete: "cascade"
  }),
  settlementId: uuid("settlement_id").references(() => settlementsTable.id, {
    onDelete: "cascade"
  }),
  targetUserId: text("target_user_id"),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertNotification = typeof notificationTable.$inferInsert
export type SelectNotification = typeof notificationTable.$inferSelect
