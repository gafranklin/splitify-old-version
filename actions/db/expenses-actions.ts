"use server"

import { db } from "@/db/db"
import { 
  InsertExpense, 
  SelectExpense, 
  expensesTable,
  expenseStatusEnum 
} from "@/db/schema"
import { 
  eventsTable,
  participantsTable,
  receiptsTable,
  expenseItemsTable
} from "@/db/schema"
import { 
  ActionState, 
  ExpenseWithItems, 
  ExpenseWithDetails, 
  ExpenseSummary,
  ExpenseInput
} from "@/types"
import { eq, and, count, desc, sql } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// Create a new expense
export async function createExpenseAction(
  expenseInput: ExpenseInput
): Promise<ActionState<SelectExpense>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, expenseInput.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Check if the payer is a participant in the event
    const payerIsParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.id, expenseInput.payerId),
        eq(participantsTable.eventId, expenseInput.eventId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!payerIsParticipant) {
      return { isSuccess: false, message: "Invalid payer: Not a participant in this event" }
    }

    // Create the expense
    const expenseData: InsertExpense = {
      eventId: expenseInput.eventId,
      payerId: expenseInput.payerId,
      title: expenseInput.title,
      description: expenseInput.description,
      amount: expenseInput.amount.toString(), // Convert to string for numeric type
      date: expenseInput.date,
      status: (expenseInput.status as any) || 'pending'
    }

    const [newExpense] = await db.insert(expensesTable).values(expenseData).returning()
    
    return {
      isSuccess: true,
      message: "Expense created successfully",
      data: newExpense
    }
  } catch (error) {
    console.error("Error creating expense:", error)
    return { isSuccess: false, message: "Failed to create expense" }
  }
}

// Get expenses for an event
export async function getEventExpensesAction(
  eventId: string
): Promise<ActionState<ExpenseSummary[]>> {
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

    // Get expenses with payer information and item count
    const expenses = await db
      .select({
        id: expensesTable.id,
        title: expensesTable.title,
        amount: expensesTable.amount,
        date: expensesTable.date,
        payerId: expensesTable.payerId,
        payerName: participantsTable.displayName,
        status: expensesTable.status,
        itemCount: count(expenseItemsTable.id).as('itemCount')
      })
      .from(expensesTable)
      .leftJoin(participantsTable, eq(expensesTable.payerId, participantsTable.id))
      .leftJoin(expenseItemsTable, eq(expensesTable.id, expenseItemsTable.expenseId))
      .where(eq(expensesTable.eventId, eventId))
      .groupBy(
        expensesTable.id,
        expensesTable.title,
        expensesTable.amount,
        expensesTable.date,
        expensesTable.payerId,
        participantsTable.displayName,
        expensesTable.status
      )
      .orderBy(desc(expensesTable.date))
      .execute()

    // Map to ExpenseSummary and handle null values
    const expenseSummaries: ExpenseSummary[] = expenses.map(expense => ({
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      date: expense.date,
      payerId: expense.payerId,
      payerName: expense.payerName || 'Unknown',
      status: expense.status,
      itemCount: expense.itemCount
    }))

    return {
      isSuccess: true,
      message: "Expenses retrieved successfully",
      data: expenseSummaries
    }
  } catch (error) {
    console.error("Error getting event expenses:", error)
    return { isSuccess: false, message: "Failed to get expenses" }
  }
}

// Get a single expense with items
export async function getExpenseWithItemsAction(
  expenseId: string
): Promise<ActionState<ExpenseWithItems>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, expenseId),
      with: {
        event: true
      }
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

    // Get expense items
    const items = await db.query.expenseItems.findMany({
      where: eq(expenseItemsTable.expenseId, expenseId)
    })

    // Check if there's a receipt
    const receipt = await db.query.receipts.findFirst({
      where: eq(receiptsTable.expenseId, expenseId)
    })

    const expenseWithItems: ExpenseWithItems = {
      ...expense,
      items,
      hasReceipt: !!receipt
    }

    return {
      isSuccess: true,
      message: "Expense retrieved successfully",
      data: expenseWithItems
    }
  } catch (error) {
    console.error("Error getting expense details:", error)
    return { isSuccess: false, message: "Failed to get expense details" }
  }
}

// Get a single expense with full details
export async function getExpenseDetailsAction(
  expenseId: string
): Promise<ActionState<ExpenseWithDetails>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense with items first
    const expenseResult = await getExpenseWithItemsAction(expenseId)
    
    if (!expenseResult.isSuccess) {
      return expenseResult
    }

    const expenseWithItems = expenseResult.data

    // Get the payer's name
    const payer = await db.query.participants.findFirst({
      where: eq(participantsTable.id, expenseWithItems.payerId)
    })

    // Get allocations
    const allocations = await db.query.expenseAllocations.findMany({
      where: eq(receiptsTable.expenseId, expenseId)
    })

    const expenseWithDetails: ExpenseWithDetails = {
      ...expenseWithItems,
      allocations,
      payerName: payer?.displayName || 'Unknown'
    }

    return {
      isSuccess: true,
      message: "Expense details retrieved successfully",
      data: expenseWithDetails
    }
  } catch (error) {
    console.error("Error getting expense details:", error)
    return { isSuccess: false, message: "Failed to get expense details" }
  }
}

// Update an expense
export async function updateExpenseAction(
  expenseId: string,
  expenseInput: Partial<ExpenseInput>
): Promise<ActionState<SelectExpense>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense
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

    // Only allow organizers or the payer to update the expense
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can update this expense" }
    }

    // If changing the payer, check if the new payer is a participant
    if (expenseInput.payerId && expenseInput.payerId !== expense.payerId) {
      const newPayerIsParticipant = await db.query.participants.findFirst({
        where: and(
          eq(participantsTable.id, expenseInput.payerId),
          eq(participantsTable.eventId, expense.eventId),
          eq(participantsTable.isActive, 'true')
        )
      })

      if (!newPayerIsParticipant) {
        return { isSuccess: false, message: "Invalid payer: Not a participant in this event" }
      }
    }

    // Prepare update data
    const updateData: Partial<InsertExpense> = {}
    
    if (expenseInput.title) updateData.title = expenseInput.title
    if (expenseInput.description !== undefined) updateData.description = expenseInput.description
    if (expenseInput.amount !== undefined) updateData.amount = expenseInput.amount.toString()
    if (expenseInput.date) updateData.date = expenseInput.date
    if (expenseInput.payerId) updateData.payerId = expenseInput.payerId
    if (expenseInput.status) updateData.status = expenseInput.status as any

    // Update the expense
    const [updatedExpense] = await db
      .update(expensesTable)
      .set(updateData)
      .where(eq(expensesTable.id, expenseId))
      .returning()

    return {
      isSuccess: true,
      message: "Expense updated successfully",
      data: updatedExpense
    }
  } catch (error) {
    console.error("Error updating expense:", error)
    return { isSuccess: false, message: "Failed to update expense" }
  }
}

// Delete an expense
export async function deleteExpenseAction(
  expenseId: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense
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

    // Only allow organizers or the payer to delete the expense
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can delete this expense" }
    }

    // Delete the expense (cascade delete will handle items, allocations, and receipts)
    await db.delete(expensesTable).where(eq(expensesTable.id, expenseId))

    return {
      isSuccess: true,
      message: "Expense deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting expense:", error)
    return { isSuccess: false, message: "Failed to delete expense" }
  }
} 