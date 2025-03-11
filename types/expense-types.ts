/*
Contains the expense-related types.
*/

import {
  SelectExpense,
  SelectExpenseItem,
  SelectExpenseAllocation
} from "@/db/schema"

// Extended expense type with additional information
export interface ExpenseWithItems extends SelectExpense {
  items: SelectExpenseItem[]
  hasReceipt: boolean
}

// Extended expense type with complete details
export interface ExpenseWithDetails extends ExpenseWithItems {
  allocations: SelectExpenseAllocation[]
  payerName: string
}

// Expense summary for dashboard display
export interface ExpenseSummary {
  id: string
  title: string
  amount: number
  date: Date
  payerId: string
  payerName: string
  status: string
  itemCount: number
}

// Input for creating/updating expense
export interface ExpenseInput {
  eventId: string
  payerId: string
  title: string
  description?: string
  amount: number
  date: Date
  status?: string
}

// Input for creating/updating expense items
export interface ExpenseItemInput {
  expenseId: string
  name: string
  description?: string
  quantity: number
  price: number
}

// Input for creating/updating expense allocations
export interface ExpenseAllocationInput {
  expenseId: string
  expenseItemId?: string
  participantId: string
  allocationType: string
  percentage?: number
  amount?: number
}
