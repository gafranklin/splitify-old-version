"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { participantsTable, expensesTable } from "@/db/schema"
import {
  updateExpenseAction,
  getExpenseWithItemsAction
} from "@/actions/db/expenses-actions"
import ExpenseForm from "../../_components/expense-form"
import { auth } from "@clerk/nextjs/server"

// Main page component
export default async function EditExpensePage({
  params
}: {
  params: Promise<{ eventId: string; expenseId: string }>
}) {
  const { eventId, expenseId } = await params

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Expense</h1>

      <Suspense fallback={<div>Loading expense data...</div>}>
        <EditExpenseFormFetcher eventId={eventId} expenseId={expenseId} />
      </Suspense>
    </div>
  )
}

// Component to fetch data and render the form
async function EditExpenseFormFetcher({
  eventId,
  expenseId
}: {
  eventId: string
  expenseId: string
}) {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">
          Authentication required
        </h3>
        <p className="mt-2 text-sm text-red-700">
          You must be logged in to edit an expense.
        </p>
      </div>
    )
  }

  // Get the expense with items
  const { data: expense, isSuccess: expenseSuccess } =
    await getExpenseWithItemsAction(expenseId)

  if (!expenseSuccess || !expense) {
    notFound()
  }

  // Get all active participants for the event
  const participants = await db.query.participants.findMany({
    where: eq(participantsTable.eventId, eventId)
  })

  // Filter only active participants
  const activeParticipants = participants.filter(p => p.isActive === "true")

  if (!activeParticipants.length) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <h3 className="text-sm font-medium text-yellow-800">
          No participants available
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          You need at least one participant to edit an expense. Please add
          participants to this event first.
        </p>
      </div>
    )
  }

  // Prepare expense input data from the expense object
  const expenseInput = {
    eventId,
    title: expense.title,
    description: expense.description || undefined,
    amount: Number(expense.amount),
    date: expense.date,
    payerId: expense.payerId,
    status: expense.status
  }

  return (
    <ExpenseForm
      eventId={eventId}
      participants={activeParticipants}
      expense={expenseInput}
      submitAction={data => updateExpenseAction(expenseId, data)}
      submitButtonText="Update Expense"
    />
  )
}
