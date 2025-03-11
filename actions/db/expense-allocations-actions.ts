"use server"

import { db } from "@/db/db"
import { 
  InsertExpenseAllocation, 
  SelectExpenseAllocation, 
  expenseAllocationsTable,
  allocationTypeEnum
} from "@/db/schema"
import { 
  expensesTable,
  participantsTable,
  expenseItemsTable
} from "@/db/schema"
import { 
  ActionState, 
  ExpenseAllocationInput
} from "@/types"
import { eq, and, inArray } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// Create a new expense allocation
export async function createExpenseAllocationAction(
  allocationInput: ExpenseAllocationInput
): Promise<ActionState<SelectExpenseAllocation>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, allocationInput.expenseId)
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

    // Get the payer participant to check if the user is the payer
    const payerParticipant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expense.payerId)
    })

    const isOrganizer = userParticipant.role === 'organizer'
    const isPayer = payerParticipant?.userId === userId

    // Only allow organizers or the payer to add allocations
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can add allocations" }
    }

    // Check if the participant exists
    const participant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.id, allocationInput.participantId),
        eq(participantsTable.eventId, expense.eventId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!participant) {
      return { isSuccess: false, message: "Invalid participant: Not a participant in this event" }
    }

    // If expense item ID is provided, check if it exists
    if (allocationInput.expenseItemId) {
      const expenseItem = await db.query.expenseItems.findFirst({
        where: and(
          eq(expenseItemsTable.id, allocationInput.expenseItemId),
          eq(expenseItemsTable.expenseId, allocationInput.expenseId)
        )
      })

      if (!expenseItem) {
        return { isSuccess: false, message: "Invalid expense item: Not part of this expense" }
      }
    }

    // Create the allocation
    const allocationData: InsertExpenseAllocation = {
      expenseId: allocationInput.expenseId,
      expenseItemId: allocationInput.expenseItemId,
      participantId: allocationInput.participantId,
      allocationType: allocationInput.allocationType as any,
      percentage: allocationInput.percentage?.toString(),
      amount: allocationInput.amount?.toString()
    }

    // Validate allocation data based on type
    if (allocationData.allocationType === 'percent' && !allocationData.percentage) {
      return { isSuccess: false, message: "Percentage must be provided for percent allocation type" }
    }

    if (allocationData.allocationType === 'amount' && !allocationData.amount) {
      return { isSuccess: false, message: "Amount must be provided for amount allocation type" }
    }

    const [newAllocation] = await db.insert(expenseAllocationsTable).values(allocationData).returning()
    
    return {
      isSuccess: true,
      message: "Allocation created successfully",
      data: newAllocation
    }
  } catch (error) {
    console.error("Error creating allocation:", error)
    return { isSuccess: false, message: "Failed to create allocation" }
  }
}

// Get allocations for an expense
export async function getExpenseAllocationsAction(
  expenseId: string
): Promise<ActionState<SelectExpenseAllocation[]>> {
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

    // Get all allocations for the expense
    const allocations = await db.query.expenseAllocations.findMany({
      where: eq(expenseAllocationsTable.expenseId, expenseId)
    })

    return {
      isSuccess: true,
      message: "Allocations retrieved successfully",
      data: allocations
    }
  } catch (error) {
    console.error("Error getting allocations:", error)
    return { isSuccess: false, message: "Failed to get allocations" }
  }
}

// Update an expense allocation
export async function updateExpenseAllocationAction(
  allocationId: string,
  allocationInput: Partial<ExpenseAllocationInput>
): Promise<ActionState<SelectExpenseAllocation>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the allocation
    const allocation = await db.query.expenseAllocations.findFirst({
      where: eq(expenseAllocationsTable.id, allocationId)
    })

    if (!allocation) {
      return { isSuccess: false, message: "Allocation not found" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, allocation.expenseId)
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

    // Get the payer participant to check if the user is the payer
    const payerParticipant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expense.payerId)
    })

    const isOrganizer = userParticipant.role === 'organizer'
    const isPayer = payerParticipant?.userId === userId

    // Only allow organizers or the payer to update allocations
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can update allocations" }
    }

    // If changing participant, check if the new participant exists
    if (allocationInput.participantId && allocationInput.participantId !== allocation.participantId) {
      const participant = await db.query.participants.findFirst({
        where: and(
          eq(participantsTable.id, allocationInput.participantId),
          eq(participantsTable.eventId, expense.eventId),
          eq(participantsTable.isActive, 'true')
        )
      })

      if (!participant) {
        return { isSuccess: false, message: "Invalid participant: Not a participant in this event" }
      }
    }

    // If changing expense item, check if it exists
    if (allocationInput.expenseItemId && allocationInput.expenseItemId !== allocation.expenseItemId) {
      const expenseItem = await db.query.expenseItems.findFirst({
        where: and(
          eq(expenseItemsTable.id, allocationInput.expenseItemId),
          eq(expenseItemsTable.expenseId, allocation.expenseId)
        )
      })

      if (!expenseItem) {
        return { isSuccess: false, message: "Invalid expense item: Not part of this expense" }
      }
    }

    // Prepare update data
    const updateData: Partial<InsertExpenseAllocation> = {}
    
    if (allocationInput.participantId) updateData.participantId = allocationInput.participantId
    if (allocationInput.expenseItemId !== undefined) updateData.expenseItemId = allocationInput.expenseItemId
    if (allocationInput.allocationType) updateData.allocationType = allocationInput.allocationType as any
    if (allocationInput.percentage !== undefined) updateData.percentage = allocationInput.percentage?.toString()
    if (allocationInput.amount !== undefined) updateData.amount = allocationInput.amount?.toString()

    // Validate allocation data based on type
    const allocationType = allocationInput.allocationType ? allocationInput.allocationType : allocation.allocationType
    
    if (allocationType === 'percent' && 
        allocationInput.percentage === undefined && 
        !allocation.percentage) {
      return { isSuccess: false, message: "Percentage must be provided for percent allocation type" }
    }

    if (allocationType === 'amount' && 
        allocationInput.amount === undefined && 
        !allocation.amount) {
      return { isSuccess: false, message: "Amount must be provided for amount allocation type" }
    }

    // Update the allocation
    const [updatedAllocation] = await db
      .update(expenseAllocationsTable)
      .set(updateData)
      .where(eq(expenseAllocationsTable.id, allocationId))
      .returning()

    return {
      isSuccess: true,
      message: "Allocation updated successfully",
      data: updatedAllocation
    }
  } catch (error) {
    console.error("Error updating allocation:", error)
    return { isSuccess: false, message: "Failed to update allocation" }
  }
}

// Delete an expense allocation
export async function deleteExpenseAllocationAction(
  allocationId: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the allocation
    const allocation = await db.query.expenseAllocations.findFirst({
      where: eq(expenseAllocationsTable.id, allocationId)
    })

    if (!allocation) {
      return { isSuccess: false, message: "Allocation not found" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, allocation.expenseId)
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

    // Get the payer participant to check if the user is the payer
    const payerParticipant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expense.payerId)
    })

    const isOrganizer = userParticipant.role === 'organizer'
    const isPayer = payerParticipant?.userId === userId

    // Only allow organizers or the payer to delete allocations
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can delete allocations" }
    }

    // Delete the allocation
    await db.delete(expenseAllocationsTable).where(eq(expenseAllocationsTable.id, allocationId))

    return {
      isSuccess: true,
      message: "Allocation deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting allocation:", error)
    return { isSuccess: false, message: "Failed to delete allocation" }
  }
}

// Create equal allocations for all participants in an expense
export async function createEqualAllocationsAction(
  expenseId: string
): Promise<ActionState<SelectExpenseAllocation[]>> {
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

    // Get the payer participant to check if the user is the payer
    const payerParticipant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expense.payerId)
    })

    const isOrganizer = userParticipant.role === 'organizer'
    const isPayer = payerParticipant?.userId === userId

    // Only allow organizers or the payer to add allocations
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can add allocations" }
    }

    // Get all active participants in the event
    const participants = await db.query.participants.findMany({
      where: and(
        eq(participantsTable.eventId, expense.eventId),
        eq(participantsTable.isActive, 'true')
      )
    })

    // Delete any existing allocations
    await db.delete(expenseAllocationsTable).where(eq(expenseAllocationsTable.expenseId, expenseId))

    // Create an equal allocation for each participant
    const allocations: InsertExpenseAllocation[] = participants.map(participant => ({
      expenseId,
      participantId: participant.id,
      allocationType: 'equal',
      percentage: null,
      amount: null,
      expenseItemId: null
    }))

    // Insert the allocations
    const createdAllocations = await db.insert(expenseAllocationsTable).values(allocations).returning()

    return {
      isSuccess: true,
      message: "Equal allocations created successfully",
      data: createdAllocations
    }
  } catch (error) {
    console.error("Error creating equal allocations:", error)
    return { isSuccess: false, message: "Failed to create equal allocations" }
  }
}

// Create allocations with custom amounts
export async function createCustomAmountAllocationsAction(
  expenseId: string,
  customAmounts: { participantId: string; amount: number }[]
): Promise<ActionState<SelectExpenseAllocation[]>> {
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

    // Get the payer participant to check if the user is the payer
    const payerParticipant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expense.payerId)
    })

    const isOrganizer = userParticipant.role === 'organizer'
    const isPayer = payerParticipant?.userId === userId

    // Only allow organizers or the payer to add allocations
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can add allocations" }
    }

    // Validate the sum of custom amounts matches the expense amount
    const totalAmount = customAmounts.reduce((sum, item) => sum + item.amount, 0)
    const expenseAmount = Number(expense.amount)
    
    if (Math.abs(totalAmount - expenseAmount) > 0.01) {
      return { 
        isSuccess: false, 
        message: `Total allocated amount (${totalAmount}) does not match expense amount (${expenseAmount})` 
      }
    }

    // Delete any existing allocations
    await db.delete(expenseAllocationsTable).where(eq(expenseAllocationsTable.expenseId, expenseId))

    // Create custom allocations for each participant
    const allocations: InsertExpenseAllocation[] = customAmounts.map(item => ({
      expenseId,
      participantId: item.participantId,
      allocationType: 'amount',
      percentage: null,
      amount: item.amount.toString(),
      expenseItemId: null
    }))

    // Insert the allocations
    const createdAllocations = await db.insert(expenseAllocationsTable).values(allocations).returning()

    return {
      isSuccess: true,
      message: "Custom amount allocations created successfully",
      data: createdAllocations
    }
  } catch (error) {
    console.error("Error creating custom amount allocations:", error)
    return { isSuccess: false, message: "Failed to create custom amount allocations" }
  }
}

// Create allocations with percentage splits
export async function createPercentageAllocationsAction(
  expenseId: string,
  percentageSplits: { participantId: string; percentage: number }[]
): Promise<ActionState<SelectExpenseAllocation[]>> {
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

    // Get the payer participant to check if the user is the payer
    const payerParticipant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expense.payerId)
    })

    const isOrganizer = userParticipant.role === 'organizer'
    const isPayer = payerParticipant?.userId === userId

    // Only allow organizers or the payer to add allocations
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can add allocations" }
    }

    // Validate the sum of percentages is 100%
    const totalPercentage = percentageSplits.reduce((sum, item) => sum + item.percentage, 0)
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return { 
        isSuccess: false, 
        message: `Total percentage (${totalPercentage}%) must equal 100%` 
      }
    }

    // Delete any existing allocations
    await db.delete(expenseAllocationsTable).where(eq(expenseAllocationsTable.expenseId, expenseId))

    // Create percentage allocations for each participant
    const allocations: InsertExpenseAllocation[] = percentageSplits.map(item => ({
      expenseId,
      participantId: item.participantId,
      allocationType: 'percent',
      percentage: item.percentage.toString(),
      amount: null,
      expenseItemId: null
    }))

    // Insert the allocations
    const createdAllocations = await db.insert(expenseAllocationsTable).values(allocations).returning()

    return {
      isSuccess: true,
      message: "Percentage allocations created successfully",
      data: createdAllocations
    }
  } catch (error) {
    console.error("Error creating percentage allocations:", error)
    return { isSuccess: false, message: "Failed to create percentage allocations" }
  }
} 