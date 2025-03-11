"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { 
  InsertRideshare, 
  SelectRideshare, 
  ridesharesTable,
  rideshareProviderEnum
} from "@/db/schema"
import { 
  expensesTable, 
  participantsTable,
  expenseStatusEnum
} from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq, inArray } from "drizzle-orm"

/**
 * Creates a new rideshare record
 */
export async function createRideshareAction(
  rideshare: InsertRideshare
): Promise<ActionState<SelectRideshare>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, rideshare.expenseId)
    })

    if (!expense) {
      return { isSuccess: false, message: "Expense not found" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, expense.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Create the rideshare record
    const [newRideshare] = await db.insert(ridesharesTable).values(rideshare).returning()
    
    return {
      isSuccess: true,
      message: "Rideshare record created successfully",
      data: newRideshare
    }
  } catch (error) {
    console.error("Error creating rideshare record:", error)
    return { isSuccess: false, message: "Failed to create rideshare record" }
  }
}

/**
 * Retrieves a rideshare by its ID
 */
export async function getRideshareByIdAction(
  id: string
): Promise<ActionState<SelectRideshare>> {
  try {
    const rideshare = await db.query.rideshares.findFirst({
      where: eq(ridesharesTable.id, id)
    })

    if (!rideshare) {
      return {
        isSuccess: false,
        message: "Rideshare not found"
      }
    }

    return {
      isSuccess: true,
      message: "Rideshare retrieved successfully",
      data: rideshare
    }
  } catch (error) {
    console.error("Error retrieving rideshare:", error)
    return { isSuccess: false, message: "Failed to retrieve rideshare" }
  }
}

/**
 * Retrieves rideshares for a specific expense
 */
export async function getRidesharesByExpenseIdAction(
  expenseId: string
): Promise<ActionState<SelectRideshare[]>> {
  try {
    const rideshares = await db.query.rideshares.findMany({
      where: eq(ridesharesTable.expenseId, expenseId)
    })

    return {
      isSuccess: true,
      message: "Rideshares retrieved successfully",
      data: rideshares
    }
  } catch (error) {
    console.error("Error retrieving rideshares:", error)
    return { isSuccess: false, message: "Failed to retrieve rideshares" }
  }
}

/**
 * Retrieves rideshares for a specific event
 */
export async function getRidesharesByEventIdAction(
  eventId: string
): Promise<ActionState<SelectRideshare[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Get all expenses for the event
    const expenses = await db.query.expenses.findMany({
      where: eq(expensesTable.eventId, eventId),
      columns: {
        id: true
      }
    })

    const expenseIds = expenses.map(e => e.id)

    // No expenses, so no rideshares
    if (expenseIds.length === 0) {
      return {
        isSuccess: true,
        message: "No rideshares found for this event",
        data: []
      }
    }

    // Get all rideshares for those expenses
    const rideshares = await db.query.rideshares.findMany({
      where: inArray(ridesharesTable.expenseId, expenseIds)
    })
    
    return {
      isSuccess: true,
      message: "Rideshares retrieved successfully",
      data: rideshares
    }
  } catch (error) {
    console.error("Error getting rideshares:", error)
    return { isSuccess: false, message: "Failed to get rideshares" }
  }
}

/**
 * Updates a rideshare record
 */
export async function updateRideshareAction(
  id: string,
  data: Partial<InsertRideshare>
): Promise<ActionState<SelectRideshare>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the rideshare record to check permissions
    const rideshare = await db.query.rideshares.findFirst({
      where: eq(ridesharesTable.id, id)
    })

    if (!rideshare) {
      return { isSuccess: false, message: "Rideshare record not found" }
    }

    // Get the expense
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, rideshare.expenseId)
    })

    if (!expense) {
      return { isSuccess: false, message: "Associated expense not found" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, expense.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Update the rideshare record
    const [updatedRideshare] = await db
      .update(ridesharesTable)
      .set(data)
      .where(eq(ridesharesTable.id, id))
      .returning()
    
    return {
      isSuccess: true,
      message: "Rideshare record updated successfully",
      data: updatedRideshare
    }
  } catch (error) {
    console.error("Error updating rideshare record:", error)
    return { isSuccess: false, message: "Failed to update rideshare record" }
  }
}

/**
 * Deletes a rideshare record
 */
export async function deleteRideshareAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the rideshare record to check permissions
    const rideshare = await db.query.rideshares.findFirst({
      where: eq(ridesharesTable.id, id)
    })

    if (!rideshare) {
      return { isSuccess: false, message: "Rideshare record not found" }
    }

    // Get the expense
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, rideshare.expenseId)
    })

    if (!expense) {
      return { isSuccess: false, message: "Associated expense not found" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, expense.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Delete the rideshare record
    await db.delete(ridesharesTable).where(eq(ridesharesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Rideshare record deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting rideshare record:", error)
    return { isSuccess: false, message: "Failed to delete rideshare record" }
  }
}

/**
 * Deletes all rideshares for a specific expense
 */
export async function deleteRidesharesByExpenseIdAction(
  expenseId: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(ridesharesTable)
      .where(eq(ridesharesTable.expenseId, expenseId))

    return {
      isSuccess: true,
      message: "Rideshares deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting rideshares:", error)
    return { isSuccess: false, message: "Failed to delete rideshares" }
  }
}

/**
 * Retrieves a rideshare by expense ID
 */
export async function getRideshareByExpenseIdAction(
  expenseId: string
): Promise<ActionState<SelectRideshare>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, expenseId)
    })

    if (!expense) {
      return { isSuccess: false, message: "Expense not found" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, expense.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Get the rideshare record
    const rideshare = await db.query.rideshares.findFirst({
      where: eq(ridesharesTable.expenseId, expenseId)
    })

    if (!rideshare) {
      return { isSuccess: false, message: "Rideshare record not found" }
    }
    
    return {
      isSuccess: true,
      message: "Rideshare record retrieved successfully",
      data: rideshare
    }
  } catch (error) {
    console.error("Error getting rideshare record:", error)
    return { isSuccess: false, message: "Failed to get rideshare record" }
  }
}

/**
 * Creates an expense from a rideshare
 */
export async function createExpenseFromRideshareAction(
  eventId: string,
  rideData: {
    provider: string,
    rideId: string,
    pickupAddress: string,
    dropoffAddress: string,
    pickupTime: string,
    dropoffTime: string,
    distance: number,
    duration: number,
    fare: number,
    payerId: string
  }
): Promise<ActionState<{ expenseId: string, rideshareId: string }>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Check if the payer is a participant in the event
    const payerParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.id, rideData.payerId),
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!payerParticipant) {
      return { isSuccess: false, message: "Invalid payer: Not a participant in this event" }
    }

    // Get the pickup and dropoff dates from the ISO strings
    const pickupDate = new Date(rideData.pickupTime)
    const dropoffDate = new Date(rideData.dropoffTime)

    // Create a new expense for the ride
    const [expense] = await db.insert(expensesTable).values({
      eventId,
      payerId: rideData.payerId,
      title: `${rideData.provider.charAt(0).toUpperCase() + rideData.provider.slice(1)} ride`,
      description: `From ${rideData.pickupAddress} to ${rideData.dropoffAddress}`,
      amount: rideData.fare.toString(),
      date: pickupDate,
      status: "confirmed"
    }).returning()

    // Create a rideshare record linked to the expense
    const [rideshare] = await db.insert(ridesharesTable).values({
      expenseId: expense.id,
      provider: rideData.provider as any,
      rideId: rideData.rideId,
      pickupAddress: rideData.pickupAddress,
      dropoffAddress: rideData.dropoffAddress,
      pickupTime: pickupDate,
      dropoffTime: dropoffDate,
      distance: rideData.distance.toString(),
      duration: rideData.duration.toString(),
      rawData: {} // No raw data in this demo
    }).returning()
    
    return {
      isSuccess: true,
      message: "Expense and rideshare record created successfully",
      data: {
        expenseId: expense.id,
        rideshareId: rideshare.id
      }
    }
  } catch (error) {
    console.error("Error creating expense from rideshare:", error)
    return { isSuccess: false, message: "Failed to create expense from rideshare" }
  }
} 