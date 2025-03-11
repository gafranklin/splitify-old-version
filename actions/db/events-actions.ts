"use server"

import { db } from "@/db/db"
import { InsertEvent, SelectEvent, eventsTable } from "@/db/schema"
import { participantsTable, participantRoleEnum } from "@/db/schema"
import { expensesTable } from "@/db/schema"
import { ActionState, EventWithDetails, EventSummary } from "@/types"
import { eq, and, sql, count, sum, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// Create a new event
export async function createEventAction(
  event: InsertEvent
): Promise<ActionState<SelectEvent>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Set the creator ID to the current user
    const eventWithCreator = {
      ...event,
      creatorId: userId
    }

    const [newEvent] = await db.insert(eventsTable).values(eventWithCreator).returning()
    
    // Add the creator as an organizer participant
    await db.insert(participantsTable).values({
      eventId: newEvent.id,
      userId: userId,
      role: 'organizer',
      displayName: null, // Will be filled in from the user's profile when displayed
      isActive: 'true'
    })

    return {
      isSuccess: true,
      message: "Event created successfully",
      data: newEvent
    }
  } catch (error) {
    console.error("Error creating event:", error)
    return { isSuccess: false, message: "Failed to create event" }
  }
}

// Get all events for a user
export async function getUserEventsAction(): Promise<ActionState<EventSummary[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Find all events where the user is a participant
    const eventsData = await db
      .select({
        id: eventsTable.id,
        name: eventsTable.name,
        startDate: eventsTable.startDate,
        endDate: eventsTable.endDate,
        isActive: eventsTable.isActive,
        participantCount: count(participantsTable.id).as('participantCount'),
        userRole: participantsTable.role
      })
      .from(eventsTable)
      .innerJoin(
        participantsTable,
        and(
          eq(participantsTable.eventId, eventsTable.id),
          eq(participantsTable.userId, userId),
          eq(participantsTable.isActive, 'true')
        )
      )
      .groupBy(eventsTable.id, participantsTable.role)
      .orderBy(desc(eventsTable.updatedAt))
      .execute()

    // Transform the data to match EventSummary type
    const events: EventSummary[] = eventsData.map(event => ({
      id: event.id,
      name: event.name,
      startDate: event.startDate || undefined,
      endDate: event.endDate || undefined,
      participantCount: event.participantCount,
      isActive: event.isActive,
      userRole: event.userRole
    }))

    return {
      isSuccess: true,
      message: "Events retrieved successfully",
      data: events
    }
  } catch (error) {
    console.error("Error getting user events:", error)
    return { isSuccess: false, message: "Failed to get events" }
  }
}

// Get an event by ID with additional details
export async function getEventWithDetailsAction(
  eventId: string
): Promise<ActionState<EventWithDetails>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the event
    const event = await db.query.events.findFirst({
      where: eq(eventsTable.id, eventId)
    })

    if (!event) {
      return { isSuccess: false, message: "Event not found" }
    }

    // Get participant count
    const participantCountResult = await db
      .select({ count: count() })
      .from(participantsTable)
      .where(and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.isActive, 'true')
      ))
      .execute()

    const participantCount = participantCountResult[0]?.count || 0

    // Get total expenses
    const totalExpensesResult = await db
      .select({ total: sum(expensesTable.amount) })
      .from(expensesTable)
      .where(eq(expensesTable.eventId, eventId))
      .execute()

    const totalExpenses = Number(totalExpensesResult[0]?.total) || 0

    // Check if user is a participant and get their role
    const participant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    const userRole = participant?.role

    const eventWithDetails: EventWithDetails = {
      ...event,
      participantCount,
      totalExpenses,
      userRole
    }

    return {
      isSuccess: true,
      message: "Event retrieved successfully",
      data: eventWithDetails
    }
  } catch (error) {
    console.error("Error getting event details:", error)
    return { isSuccess: false, message: "Failed to get event details" }
  }
}

// Update an event
export async function updateEventAction(
  eventId: string,
  data: Partial<InsertEvent>
): Promise<ActionState<SelectEvent>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user is an organizer
    const participant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.role, 'organizer'),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!participant) {
      return { isSuccess: false, message: "Unauthorized: Only organizers can update events" }
    }

    // Update the event
    const [updatedEvent] = await db
      .update(eventsTable)
      .set(data)
      .where(eq(eventsTable.id, eventId))
      .returning()

    if (!updatedEvent) {
      return { isSuccess: false, message: "Event not found" }
    }

    return {
      isSuccess: true,
      message: "Event updated successfully",
      data: updatedEvent
    }
  } catch (error) {
    console.error("Error updating event:", error)
    return { isSuccess: false, message: "Failed to update event" }
  }
}

// Delete an event
export async function deleteEventAction(
  eventId: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user is the creator
    const event = await db.query.events.findFirst({
      where: eq(eventsTable.id, eventId)
    })

    if (!event) {
      return { isSuccess: false, message: "Event not found" }
    }

    if (event.creatorId !== userId) {
      return { isSuccess: false, message: "Unauthorized: Only the creator can delete the event" }
    }

    // Delete the event
    await db.delete(eventsTable).where(eq(eventsTable.id, eventId))

    return {
      isSuccess: true,
      message: "Event deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { isSuccess: false, message: "Failed to delete event" }
  }
} 