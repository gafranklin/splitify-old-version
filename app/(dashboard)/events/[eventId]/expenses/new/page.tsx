"use server"

import { Suspense } from "react"
import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { participantsTable } from "@/db/schema"
import { createExpenseAction } from "@/actions/db/expenses-actions"
import ExpenseForm from "../_components/expense-form"
import { auth } from "@clerk/nextjs/server"

// Main page component
export default async function NewExpensePage({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Add New Expense</h1>

      <Suspense fallback={<div>Loading participants...</div>}>
        <NewExpenseFormFetcher eventId={eventId} />
      </Suspense>
    </div>
  )
}

// Component to fetch data and render the form
async function NewExpenseFormFetcher({ eventId }: { eventId: string }) {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">
          Authentication required
        </h3>
        <p className="mt-2 text-sm text-red-700">
          You must be logged in to create an expense.
        </p>
      </div>
    )
  }

  // Get all active participants for the event directly from the database
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
          You need at least one participant to create an expense. Please add
          participants to this event first.
        </p>
      </div>
    )
  }

  return (
    <ExpenseForm
      eventId={eventId}
      participants={activeParticipants}
      submitAction={createExpenseAction}
      submitButtonText="Create Expense"
    />
  )
}
