"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getExpenseWithItemsAction } from "@/actions/db/expenses-actions"
import { getEventParticipantSummariesAction } from "@/actions/db/participants-actions"
import { getExpenseAllocationsAction } from "@/actions/db/expense-allocations-actions"
import SplitForm from "./_components/split-form"
import SplitSummary from "./_components/split-summary"
import { auth } from "@clerk/nextjs/server"
import { ParticipantSummary } from "@/types"
import { SelectParticipant } from "@/db/schema/participants-schema"

// Main page component
export default async function ExpenseSplitPage({
  params
}: {
  params: Promise<{ eventId: string; expenseId: string }>
}) {
  const { eventId, expenseId } = await params

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Split Expense</h1>

      <Suspense fallback={<div>Loading expense data...</div>}>
        <ExpenseSplitFetcher eventId={eventId} expenseId={expenseId} />
      </Suspense>
    </div>
  )
}

// Component to fetch expense and participant data
async function ExpenseSplitFetcher({
  eventId,
  expenseId
}: {
  eventId: string
  expenseId: string
}) {
  // Get the expense
  const { data: expense, isSuccess: expenseSuccess } =
    await getExpenseWithItemsAction(expenseId)

  if (!expenseSuccess || !expense) {
    notFound()
  }

  // Get participants
  const { data: participants, isSuccess: participantsSuccess } =
    await getEventParticipantSummariesAction(eventId)

  if (!participantsSuccess || !participants.length) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <h3 className="text-sm font-medium text-yellow-800">
          No participants found
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          There must be participants in the event to split expenses.
        </p>
      </div>
    )
  }

  // Get existing allocations
  const { data: allocations, isSuccess: allocationsSuccess } =
    await getExpenseAllocationsAction(expenseId)

  // Debug: Log the participant objects to confirm their structure
  console.log(
    "Participants data structure:",
    JSON.stringify(participants, null, 2)
  )

  // Additional debug: Check if each participant has isCurrentUser property
  const hasIsCurrentUser = participants.every(p => "isCurrentUser" in p)
  console.log("All participants have isCurrentUser property?", hasIsCurrentUser)

  // Ensure each participant has the isCurrentUser property to satisfy the ParticipantSummary type
  const authData = await auth()
  const userId = authData?.userId || "" // Fallback for build time when auth might not work
  const enrichedParticipants = participants.map(
    (participant: ParticipantSummary | SelectParticipant) => {
      // If isCurrentUser is already defined, use it, otherwise compute it
      if ("isCurrentUser" in participant) {
        return participant as ParticipantSummary
      }
      // Add the missing property
      return {
        id: participant.id,
        userId: participant.userId,
        displayName: participant.displayName,
        role: participant.role,
        isCurrentUser: userId ? participant.userId === userId : false
      } as ParticipantSummary
    }
  )

  return (
    <div className="space-y-8">
      <SplitSummary expense={expense} />
      <SplitForm
        expense={expense}
        participants={enrichedParticipants}
        existingAllocations={allocationsSuccess ? allocations : []}
        eventId={eventId}
      />
    </div>
  )
}
