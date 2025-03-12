"use server"

import { db } from "@/db/db"
import { InsertEvent, SelectEvent, eventsTable } from "@/db/schema"
import { participantsTable, participantRoleEnum } from "@/db/schema"
import { profilesTable } from "@/db/schema"
import { expensesTable } from "@/db/schema"
import { ActionState, EventWithDetails, EventSummary } from "@/types"
import { eq, and, sql, count, sum, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// Create a new event
export async function createEventAction(
  event: InsertEvent
): Promise<ActionState<SelectEvent>> {
  try {
    console.log("Starting createEventAction with event:", event)
    console.log("Events table available:", eventsTable ? "Yes" : "No")
    console.log("Database URL:", process.env.DATABASE_URL ? "Set" : "Not set")
    
    const { userId } = await auth()
    console.log("Authenticated userId:", userId)
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // First, check if a profile exists for this user
    console.log("Checking if profile exists for user:", userId)
    const existingProfile = await db.select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
      .limit(1);
    
    // If profile doesn't exist, create one
    if (existingProfile.length === 0) {
      console.log("Profile not found, creating new profile for user:", userId)
      try {
        await db.insert(profilesTable).values({
          userId: userId,
          membership: 'free',
        });
        console.log("Profile created successfully")
      } catch (profileError) {
        console.error("Error creating profile:", profileError)
        return { isSuccess: false, message: "Failed to create user profile" }
      }
    } else {
      console.log("User profile exists:", existingProfile[0])
    }

    // Set the creator ID to the current user
    const eventWithCreator = {
      ...event,
      creatorId: userId
    }
    console.log("Prepared event with creator:", eventWithCreator)

    // Debug the table structure
    try {
      // Using a try-catch within the main try to isolate this diagnostic code
      console.log("Attempting to query eventsTable metadata")
      const tableInfo = await db.select().from(eventsTable).limit(0)
      console.log("Events table query successful, response:", tableInfo)
    } catch (metadataErr: any) {
      console.error("Error querying table metadata:", metadataErr)
      console.error("Full error details:", {
        name: metadataErr.name,
        message: metadataErr.message,
        stack: metadataErr.stack,
        code: metadataErr.code,
        detail: metadataErr.detail,
        table: metadataErr.table,
        constraint: metadataErr.constraint
      })
    }

    console.log("Attempting to insert into eventsTable")
    // Try a raw SQL query to check if the table exists
    try {
      const tableCheck = await db.execute(sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'events'
      );`);
      console.log("Table existence check result:", tableCheck)
    } catch (tableCheckErr: any) {
      console.error("Error checking if table exists:", tableCheckErr)
    }
    
    const [newEvent] = await db.insert(eventsTable).values(eventWithCreator).returning()
    console.log("Event inserted successfully:", newEvent)
    
    // Add the creator as an organizer participant
    console.log("Adding creator as participant")
    await db.insert(participantsTable).values({
      eventId: newEvent.id,
      userId: userId,
      role: 'organizer',
      displayName: null, // Will be filled in from the user's profile when displayed
      isActive: 'true'
    })
    console.log("Participant added successfully")

    return {
      isSuccess: true,
      message: "Event created successfully",
      data: newEvent
    }
  } catch (error) {
    console.error("Error creating event:", error)
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
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
    console.log(`Getting event details for ID: ${eventId}`)
    const { userId } = await auth()
    
    if (!userId) {
      console.log("Unauthorized: No userId found")
      return { isSuccess: false, message: "Unauthorized" }
    }
    console.log(`Authorized userId: ${userId}`)

    // Check what tables exist in the database
    try {
      console.log("Checking all tables in the database...")
      const tableListResult = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      console.log("Tables in database:", tableListResult)
    } catch (tableListErr: any) {
      console.error("Error checking tables in database:", tableListErr)
    }

    // Try a raw SQL query to check if the tables exist
    let hasExpensesTable = false;
    try {
      const tableCheck = await db.execute(sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'events'
      );`);
      console.log("Events table existence check result:", tableCheck)
      
      const expensesTableCheck = await db.execute(sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'expenses'
      );`);
      console.log("Expenses table existence check result:", expensesTableCheck)
      
      // Check if expenses table exists
      hasExpensesTable = expensesTableCheck[0]?.exists === true;
    } catch (tableCheckErr: any) {
      console.error("Error checking if tables exist:", tableCheckErr)
    }

    // Get the event
    console.log(`Querying events table for ID: ${eventId}`)
    const event = await db.query.events.findFirst({
      where: eq(eventsTable.id, eventId)
    })

    if (!event) {
      console.log(`Event not found with ID: ${eventId}`)
      return { isSuccess: false, message: "Event not found" }
    }
    console.log(`Event found:`, event)

    // Get participant count
    let participantCount = 0;
    try {
      const participantCountResult = await db
        .select({ count: count() })
        .from(participantsTable)
        .where(and(
          eq(participantsTable.eventId, eventId),
          eq(participantsTable.isActive, 'true')
        ))
        .execute()
      participantCount = participantCountResult[0]?.count || 0;
    } catch (err) {
      console.error("Error getting participant count:", err);
      // If it fails, we'll use the default value of 0
    }

    // Get total expenses only if the expenses table exists
    let totalExpenses = 0;
    if (hasExpensesTable) {
      try {
        const totalExpensesResult = await db
          .select({ total: sum(expensesTable.amount) })
          .from(expensesTable)
          .where(eq(expensesTable.eventId, eventId))
          .execute()
        totalExpenses = Number(totalExpensesResult[0]?.total) || 0;
      } catch (err) {
        console.error("Error getting total expenses:", err);
        // If it fails, we'll use the default value of 0
      }
    } else {
      console.log("Skipping expenses calculation - table doesn't exist");
    }

    // Check if user is a participant and get their role
    let userRole;
    try {
      const participant = await db.query.participants.findFirst({
        where: and(
          eq(participantsTable.eventId, eventId),
          eq(participantsTable.userId, userId),
          eq(participantsTable.isActive, 'true')
        )
      })
      userRole = participant?.role;
    } catch (err) {
      console.error("Error checking participant role:", err);
      // If it fails, userRole will remain undefined
    }

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