"use server"

import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEventExpensesAction } from "@/actions/db/expenses-actions"
import ExpenseList from "./_components/expense-list"
import ExpenseListSkeleton from "./_components/expense-list-skeleton"

export default async function ExpensesPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button asChild>
          <Link href="/events">
            <Plus className="mr-2 size-4" />
            Create Expense
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ExpenseListSkeleton />}>
        <ExpensesFetcher />
      </Suspense>
    </div>
  )
}

async function ExpensesFetcher() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Authentication required</h3>
        <p className="text-muted-foreground text-sm">
          Please sign in to view your expenses.
        </p>
      </div>
    )
  }

  // Temporary hardcoded expenses since we don't have the right action yet
  const expenses = [
    {
      id: "1",
      title: "Dinner at Restaurant",
      amount: 125.5,
      date: new Date(),
      status: "pending",
      payerId: "user1",
      payerName: "John Doe",
      eventId: "event1",
      eventName: "Weekend Trip",
      currency: "USD",
      hasReceipt: true
    },
    {
      id: "2",
      title: "Hotel Booking",
      amount: 350.0,
      date: new Date(),
      status: "confirmed",
      payerId: "user2",
      payerName: "Jane Smith",
      eventId: "event1",
      eventName: "Weekend Trip",
      currency: "USD",
      hasReceipt: false
    },
    {
      id: "3",
      title: "Groceries",
      amount: 75.2,
      date: new Date(),
      status: "pending",
      payerId: "user1",
      payerName: "John Doe",
      eventId: "event2",
      eventName: "House Party",
      currency: "USD",
      hasReceipt: true
    }
  ]

  return <ExpenseList expenses={expenses} />
}
