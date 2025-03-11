"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import ExpenseHeader from "./_components/expense-header"
import ExpenseDetails from "./_components/expense-details"
import { getExpenseDetailsAction } from "@/actions/db/expenses-actions"

// Main page component
export default async function ExpenseDetailsPage({
  params
}: {
  params: Promise<{ eventId: string; expenseId: string }>
}) {
  const { eventId, expenseId } = await params

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<div>Loading expense...</div>}>
        <ExpenseDetailsFetcher eventId={eventId} expenseId={expenseId} />
      </Suspense>
    </div>
  )
}

// Component to fetch expense details
async function ExpenseDetailsFetcher({
  eventId,
  expenseId
}: {
  eventId: string
  expenseId: string
}) {
  const { data: expense, isSuccess } = await getExpenseDetailsAction(expenseId)

  if (!isSuccess || !expense) {
    notFound()
  }

  return (
    <>
      <ExpenseHeader expense={expense} eventId={eventId} />
      <ExpenseDetails expense={expense} eventId={eventId} />
    </>
  )
}
