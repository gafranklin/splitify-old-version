"use server"

import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { ReceiptContainer } from "./_components/receipt-container"

// Updated interface to match Next.js 15 PageProps constraint
interface ReceiptPageProps {
  params: Promise<{
    eventId: string
  }>
  searchParams: Promise<{
    expenseId?: string
  }>
}

export default async function ReceiptPage({
  params,
  searchParams
}: ReceiptPageProps) {
  // Log the types to check our assumption
  console.log("Params type:", Object.prototype.toString.call(params))
  console.log(
    "SearchParams type:",
    Object.prototype.toString.call(searchParams)
  )

  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  // Await params to get the eventId
  const { eventId } = await params
  // Await searchParams to get the expenseId
  const { expenseId } = await searchParams

  // Redirect if no expenseId is provided
  if (!expenseId) {
    redirect(`/events/${eventId}/expenses/new`)
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <Suspense
        fallback={
          <div className="flex justify-center p-12">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <ReceiptContainer eventId={eventId} expenseId={expenseId} />
      </Suspense>
    </div>
  )
}
