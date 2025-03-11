"use server"

import { db } from "@/db/db"
import { 
  InsertExpenseItem, 
  SelectExpenseItem, 
  expenseItemsTable
} from "@/db/schema"
import { 
  expensesTable,
  participantsTable
} from "@/db/schema"
import { 
  ActionState, 
  ExpenseItemInput
} from "@/types"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// Create a new expense item
export async function createExpenseItemAction(
  itemInput: ExpenseItemInput
): Promise<ActionState<SelectExpenseItem>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, itemInput.expenseId)
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

    // Only allow organizers or the payer to add items
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can add items" }
    }

    // Create the expense item
    const itemData: InsertExpenseItem = {
      expenseId: itemInput.expenseId,
      name: itemInput.name,
      description: itemInput.description,
      quantity: itemInput.quantity.toString(), // Convert to string for numeric type
      price: itemInput.price.toString() // Convert to string for numeric type
    }

    const [newItem] = await db.insert(expenseItemsTable).values(itemData).returning()
    
    // Update the expense amount to reflect the new total
    await updateExpenseTotal(itemInput.expenseId)

    return {
      isSuccess: true,
      message: "Expense item created successfully",
      data: newItem
    }
  } catch (error) {
    console.error("Error creating expense item:", error)
    return { isSuccess: false, message: "Failed to create expense item" }
  }
}

// Get items for an expense
export async function getExpenseItemsAction(
  expenseId: string
): Promise<ActionState<SelectExpenseItem[]>> {
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

    // Get all expense items
    const items = await db.query.expenseItems.findMany({
      where: eq(expenseItemsTable.expenseId, expenseId)
    })

    return {
      isSuccess: true,
      message: "Expense items retrieved successfully",
      data: items
    }
  } catch (error) {
    console.error("Error getting expense items:", error)
    return { isSuccess: false, message: "Failed to get expense items" }
  }
}

// Update an expense item
export async function updateExpenseItemAction(
  itemId: string,
  itemInput: Partial<ExpenseItemInput>
): Promise<ActionState<SelectExpenseItem>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense item
    const item = await db.query.expenseItems.findFirst({
      where: eq(expenseItemsTable.id, itemId)
    })

    if (!item) {
      return { isSuccess: false, message: "Expense item not found" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, item.expenseId)
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

    // Only allow organizers or the payer to update items
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can update items" }
    }

    // Prepare update data
    const updateData: Partial<InsertExpenseItem> = {}
    
    if (itemInput.name) updateData.name = itemInput.name
    if (itemInput.description !== undefined) updateData.description = itemInput.description
    if (itemInput.quantity !== undefined) updateData.quantity = itemInput.quantity.toString()
    if (itemInput.price !== undefined) updateData.price = itemInput.price.toString()

    // Update the expense item
    const [updatedItem] = await db
      .update(expenseItemsTable)
      .set(updateData)
      .where(eq(expenseItemsTable.id, itemId))
      .returning()

    // Update the expense amount to reflect the new total
    await updateExpenseTotal(item.expenseId)

    return {
      isSuccess: true,
      message: "Expense item updated successfully",
      data: updatedItem
    }
  } catch (error) {
    console.error("Error updating expense item:", error)
    return { isSuccess: false, message: "Failed to update expense item" }
  }
}

// Delete an expense item
export async function deleteExpenseItemAction(
  itemId: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the expense item
    const item = await db.query.expenseItems.findFirst({
      where: eq(expenseItemsTable.id, itemId)
    })

    if (!item) {
      return { isSuccess: false, message: "Expense item not found" }
    }

    // Get the expense to check permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, item.expenseId)
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

    // Only allow organizers or the payer to delete items
    if (!isOrganizer && !isPayer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers or the payer can delete items" }
    }

    // Store the expense ID before deleting
    const expenseId = item.expenseId

    // Delete the expense item
    await db.delete(expenseItemsTable).where(eq(expenseItemsTable.id, itemId))

    // Update the expense amount to reflect the new total
    await updateExpenseTotal(expenseId)

    return {
      isSuccess: true,
      message: "Expense item deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting expense item:", error)
    return { isSuccess: false, message: "Failed to delete expense item" }
  }
}

// Helper function to update the total amount of an expense based on its items
async function updateExpenseTotal(expenseId: string): Promise<void> {
  try {
    // Get all items for the expense
    const items = await db.query.expenseItems.findMany({
      where: eq(expenseItemsTable.expenseId, expenseId)
    })

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      const price = Number(item.price)
      const quantity = Number(item.quantity)
      return total + (price * quantity)
    }, 0)

    // Update the expense with the new total
    await db
      .update(expensesTable)
      .set({ amount: totalAmount.toString() })
      .where(eq(expensesTable.id, expenseId))
  } catch (error) {
    console.error("Error updating expense total:", error)
  }
} 