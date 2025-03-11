import { db } from "@/db/db"
import { eventsTable, expensesTable, participantsTable } from "@/db/schema"
import {
  ExpenseSuggestion,
  ParticipantSuggestion,
  SuggestionCategory
} from "@/types"
import { desc, eq, sql } from "drizzle-orm"

interface SuggestionOptions {
  eventId?: string
  userId: string
  query?: string
  limit?: number
  excludeIds?: string[]
}

/**
 * Get participant suggestions based on frequency of collaboration and recent activity
 */
export async function getParticipantSuggestions(
  options: SuggestionOptions
): Promise<ParticipantSuggestion[]> {
  const { eventId, userId, query, limit = 5, excludeIds = [] } = options

  // Get participants the user has collaborated with most frequently
  const frequentParticipantsQuery = db
    .select({
      participantId: participantsTable.id,
      participantUserId: participantsTable.userId,
      displayName: participantsTable.displayName,
      // Score based on frequency of collaboration
      collaborationCount: sql<number>`count(*)`.as("collaboration_count")
    })
    .from(participantsTable)
    .where(
      sql`${participantsTable.eventId} IN (
        SELECT ${eventsTable.id} FROM ${eventsTable}
        JOIN ${participantsTable} AS p ON ${eventsTable.id} = p.eventId
        WHERE p.userId = ${userId}
      )`
    )
    .groupBy(
      participantsTable.id,
      participantsTable.userId,
      participantsTable.displayName
    )
    .orderBy(desc(sql`collaboration_count`))
    .limit(20)

  const frequentParticipants = await frequentParticipantsQuery

  // Filter and map to suggestion format
  let suggestions = frequentParticipants
    .filter(
      p =>
        !excludeIds.includes(p.participantId) && p.participantUserId !== userId
    )
    .map(p => ({
      id: p.participantId,
      userId: p.participantUserId,
      displayName: p.displayName || "Unknown",
      imageUrl: undefined,
      score: p.collaborationCount
    }))

  // Filter by query if provided
  if (query && query.length > 0) {
    const lowerQuery = query.toLowerCase()
    suggestions = suggestions.filter(p =>
      p.displayName.toLowerCase().includes(lowerQuery)
    )
  }

  // Return the top suggestions based on score
  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Get expense suggestions based on frequency and recent usage
 */
export async function getExpenseSuggestions(
  options: SuggestionOptions
): Promise<ExpenseSuggestion[]> {
  const { eventId, userId, query, limit = 5, excludeIds = [] } = options

  // Get frequently used expense titles
  const frequentExpensesQuery = db
    .select({
      id: expensesTable.id,
      title: expensesTable.title,
      amount: expensesTable.amount,
      // Score based on frequency of usage
      count: sql<number>`count(*)`.as("usage_count")
    })
    .from(expensesTable)
    .where(
      sql`${expensesTable.eventId} IN (
        SELECT ${eventsTable.id} FROM ${eventsTable}
        JOIN ${participantsTable} AS p ON ${eventsTable.id} = p.eventId
        WHERE p.userId = ${userId}
      )`
    )
    .groupBy(expensesTable.id, expensesTable.title, expensesTable.amount)
    .orderBy(desc(sql`usage_count`))
    .limit(20)

  const frequentExpenses = await frequentExpensesQuery

  // Filter and map to suggestion format
  let suggestions = frequentExpenses
    .filter(e => !excludeIds.includes(e.id))
    .map(e => ({
      id: e.id,
      title: e.title,
      amount: Number(e.amount),
      score: e.count
    }))

  // Filter by query if provided
  if (query && query.length > 0) {
    const lowerQuery = query.toLowerCase()
    suggestions = suggestions.filter(e =>
      e.title.toLowerCase().includes(lowerQuery)
    )
  }

  // Return the top suggestions based on score
  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Get category-specific suggestions based on user input
 */
export async function getSuggestions(
  category: SuggestionCategory,
  options: SuggestionOptions
) {
  switch (category) {
    case "participant":
      return getParticipantSuggestions(options)
    case "expense":
      return getExpenseSuggestions(options)
    case "vendor":
      // Implementation for vendor suggestions would go here
      return []
    case "payment":
      // Implementation for payment method suggestions would go here
      return []
    default:
      return []
  }
}
