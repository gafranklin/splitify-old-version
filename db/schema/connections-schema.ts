/*
Defines the database schema for third-party API connections.
*/

import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const connectionProviderEnum = pgEnum("connection_provider", ["uber"])

export const connectionsTable = pgTable("connections", {
  id: text("id").primaryKey(), // Format: {userId}:{provider}
  userId: text("user_id").notNull(),
  provider: connectionProviderEnum("provider").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertConnection = typeof connectionsTable.$inferInsert
export type SelectConnection = typeof connectionsTable.$inferSelect
