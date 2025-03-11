"use server"

import { db } from "@/db/db"
import {
  InsertSettlement,
  SelectSettlement,
  settlementsTable,
  participantsTable,
  eventsTable
} from "@/db/schema"
import {
  ActionState,
  SettlementRequest,
  SettlementUpdate,
  SettlementWithRelations
} from "@/types"
import { and, eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { optimizeSettlements } from "@/lib/settlement"

/**
 * Creates a new settlement.
 */
export async function createSettlementAction(
  settlement: SettlementRequest
): Promise<ActionState<SelectSettlement>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, settlement.eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    // Create the settlement
    const [newSettlement] = await db
      .insert(settlementsTable)
      .values({
        eventId: settlement.eventId,
        fromParticipantId: settlement.fromParticipantId,
        toParticipantId: settlement.toParticipantId,
        amount: settlement.amount,
        notes: settlement.notes
      })
      .returning()

    return {
      isSuccess: true,
      message: "Settlement created successfully",
      data: newSettlement
    }
  } catch (error) {
    console.error("Error creating settlement:", error)
    return { isSuccess: false, message: "Failed to create settlement" }
  }
}

/**
 * Gets all settlements for an event.
 */
export async function getEventSettlementsAction(
  eventId: string
): Promise<ActionState<SettlementWithRelations[]>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    // Get all settlements for the event with related participants
    const settlements = await db.query.settlements.findMany({
      where: eq(settlementsTable.eventId, eventId),
      with: {
        fromParticipant: true,
        toParticipant: true,
        event: true
      }
    })

    return {
      isSuccess: true,
      message: "Settlements retrieved successfully",
      data: settlements as unknown as SettlementWithRelations[]
    }
  } catch (error) {
    console.error("Error getting settlements:", error)
    return { isSuccess: false, message: "Failed to get settlements" }
  }
}

/**
 * Gets a settlement by ID.
 */
export async function getSettlementAction(
  id: string
): Promise<ActionState<SettlementWithRelations>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the settlement with related participants
    const settlement = await db.query.settlements.findFirst({
      where: eq(settlementsTable.id, id),
      with: {
        fromParticipant: true,
        toParticipant: true,
        event: true
      }
    })

    if (!settlement) {
      return { isSuccess: false, message: "Settlement not found" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, settlement.eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    return {
      isSuccess: true,
      message: "Settlement retrieved successfully",
      data: settlement as unknown as SettlementWithRelations
    }
  } catch (error) {
    console.error("Error getting settlement:", error)
    return { isSuccess: false, message: "Failed to get settlement" }
  }
}

/**
 * Updates a settlement.
 */
export async function updateSettlementAction(
  id: string,
  data: SettlementUpdate
): Promise<ActionState<SelectSettlement>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the settlement
    const settlement = await db.query.settlements.findFirst({
      where: eq(settlementsTable.id, id),
      with: {
        event: true
      }
    })

    if (!settlement) {
      return { isSuccess: false, message: "Settlement not found" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, settlement.eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    // Update timestamps based on status changes
    const updateData: Partial<InsertSettlement> = { ...data }
    
    if (data.status === "requested" && !settlement.requestedAt) {
      updateData.requestedAt = new Date()
    }
    
    if (data.status === "completed" && !settlement.completedAt) {
      updateData.completedAt = new Date()
    }

    // Update the settlement
    const [updatedSettlement] = await db
      .update(settlementsTable)
      .set(updateData)
      .where(eq(settlementsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Settlement updated successfully",
      data: updatedSettlement
    }
  } catch (error) {
    console.error("Error updating settlement:", error)
    return { isSuccess: false, message: "Failed to update settlement" }
  }
}

/**
 * Deletes a settlement.
 */
export async function deleteSettlementAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the settlement
    const settlement = await db.query.settlements.findFirst({
      where: eq(settlementsTable.id, id)
    })

    if (!settlement) {
      return { isSuccess: false, message: "Settlement not found" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, settlement.eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    // Only allow deletion of pending settlements
    if (settlement.status !== "pending") {
      return {
        isSuccess: false,
        message: "Only pending settlements can be deleted"
      }
    }

    // Delete the settlement
    await db.delete(settlementsTable).where(eq(settlementsTable.id, id))

    return {
      isSuccess: true,
      message: "Settlement deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting settlement:", error)
    return { isSuccess: false, message: "Failed to delete settlement" }
  }
}

/**
 * Generates an optimized settlement plan for an event.
 */
export async function generateSettlementPlanAction(
  eventId: string,
  balances: Record<string, string>
): Promise<ActionState<any>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    // Generate the optimized settlement plan
    const optimizedPlan = optimizeSettlements(balances)

    return {
      isSuccess: true,
      message: "Settlement plan generated successfully",
      data: optimizedPlan
    }
  } catch (error) {
    console.error("Error generating settlement plan:", error)
    return { isSuccess: false, message: "Failed to generate settlement plan" }
  }
}

/**
 * Creates multiple settlements at once based on an optimized plan.
 */
export async function createSettlementsFromPlanAction(
  eventId: string,
  settlements: {
    fromParticipantId: string
    toParticipantId: string
    amount: string
  }[]
): Promise<ActionState<SelectSettlement[]>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify that the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId)
      )
    })

    if (!userParticipant) {
      return {
        isSuccess: false,
        message: "You are not a participant in this event"
      }
    }

    // Create all settlements
    const settlementValues = settlements.map(s => ({
      eventId,
      fromParticipantId: s.fromParticipantId,
      toParticipantId: s.toParticipantId,
      amount: s.amount
    }))

    const newSettlements = await db
      .insert(settlementsTable)
      .values(settlementValues)
      .returning()

    return {
      isSuccess: true,
      message: "Settlements created successfully",
      data: newSettlements
    }
  } catch (error) {
    console.error("Error creating settlements from plan:", error)
    return { isSuccess: false, message: "Failed to create settlements" }
  }
} 