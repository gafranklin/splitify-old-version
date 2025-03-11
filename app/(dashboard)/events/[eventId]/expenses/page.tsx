"use server"

import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEventExpensesAction } from "@/actions/db/expenses-actions"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import ExpenseListSkeleton from "./_components/expense-list-skeleton"

// Main page component
export default async function ExpensesPage({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button asChild>
          <Link href={`/events/${eventId}/expenses/new`}>
            <Plus className="mr-2 size-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ExpenseListSkeleton />}>
        <ExpenseListFetcher eventId={eventId} />
      </Suspense>
    </div>
  )
}

// Component to fetch and display expenses
async function ExpenseListFetcher({ eventId }: { eventId: string }) {
  const { data: event, isSuccess: eventSuccess } =
    await getEventWithDetailsAction(eventId)
  const { data: expenses, isSuccess } = await getEventExpensesAction(eventId)

  if (!isSuccess || !eventSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Unable to load expenses</h3>
        <p className="text-muted-foreground text-sm">
          There was an error loading the expenses for this event.
        </p>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No Expenses Yet</h3>
        <p className="text-muted-foreground text-sm">
          Create your first expense to start splitting costs in {event.name}.
        </p>
        <Button className="mt-4" asChild>
          <Link href={`/events/${eventId}/expenses/new`}>
            <Plus className="mr-2 size-4" />
            Add Expense
          </Link>
        </Button>
      </div>
    )
  }

  return <ExpenseList expenses={expenses} eventId={eventId} />
}

// Import the expense list component to avoid circular dependencies
import ExpenseList from "./_components/expense-list"
