"use server"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import { getEventExpensesAction } from "@/actions/db/expenses-actions"
import { getEventParticipantsAction } from "@/actions/db/participants-actions"
import { getExpenseAllocationsAction } from "@/actions/db/expense-allocations-actions"
import BalanceSummary from "./_components/balance-summary"
import BalanceSummarySkeleton from "./_components/balance-summary-skeleton"
import { SelectParticipant, participantRoleEnum } from "@/db/schema"

export default async function BalancesPage({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Balances</h1>
        <Button asChild>
          <Link href={`/events/${eventId}/settlements`}>
            View Settlements
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      <Suspense fallback={<BalanceSummarySkeleton />}>
        <BalanceSummaryFetcher eventId={eventId} />
      </Suspense>
    </div>
  )
}

// Component to fetch and display balances
async function BalanceSummaryFetcher({ eventId }: { eventId: string }) {
  const { data: event, isSuccess: eventSuccess } =
    await getEventWithDetailsAction(eventId)
  const { data: expenses, isSuccess: expensesSuccess } =
    await getEventExpensesAction(eventId)
  const { data: participants, isSuccess: participantsSuccess } =
    await getEventParticipantsAction(eventId)

  // Default to empty array if expenses is undefined
  const expenseIds = expenses?.map(expense => expense.id) || []

  // Pass the event ID directly since most likely the function accepts an eventId parameter
  const { data: allocations, isSuccess: allocationsSuccess } =
    await getExpenseAllocationsAction(eventId)

  const isSuccess =
    eventSuccess && expensesSuccess && participantsSuccess && allocationsSuccess

  if (!isSuccess || !expenses || !participants || !allocations || !event) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Unable to load balances</h3>
        <p className="text-muted-foreground text-sm">
          There was an error loading the balances for this event.
        </p>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No Expenses Yet</h3>
        <p className="text-muted-foreground text-sm">
          Create expenses to see balance calculations for {event.name}.
        </p>
        <Button className="mt-4" asChild>
          <Link href={`/events/${eventId}/expenses/new`}>Add Expense</Link>
        </Button>
      </div>
    )
  }

  // Make sure participants has all required fields for SelectParticipant
  // This ensures we're passing the correct type to BalanceSummary
  const fullParticipants: SelectParticipant[] = (participants as any[]).map(
    p => {
      // Check if the participant already has all the required fields
      if (
        "createdAt" in p &&
        "updatedAt" in p &&
        "isActive" in p &&
        "eventId" in p &&
        "email" in p
      ) {
        return p as SelectParticipant
      }

      // Otherwise add the missing fields with defaults
      return {
        id: p.id,
        userId: p.userId,
        displayName: p.displayName,
        role: p.role as "organizer" | "member",
        // Add missing fields with sensible defaults
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: "true",
        eventId: eventId,
        email: null
      }
    }
  )

  return (
    <BalanceSummary
      event={event}
      expenses={expenses}
      participants={fullParticipants}
      allocations={allocations}
    />
  )
}
