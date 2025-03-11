"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import { getEventSettlementsAction } from "@/actions/db/settlements-actions"
import { getEventParticipantsAction } from "@/actions/db/participants-actions"
import { getEventExpensesAction } from "@/actions/db/expenses-actions"
import { calculateBalances } from "@/lib/settlement"
import SettlementPlan from "./_components/settlement-plan"
import SettlementPlanSkeleton from "./_components/settlement-plan-skeleton"
import SettlementGraph from "./_components/settlement-graph"
import SettlementGraphSkeleton from "./_components/settlement-graph-skeleton"

interface SettlementsPageProps {
  params: Promise<{
    eventId: string
  }>
}

export default async function SettlementsPage({
  params
}: SettlementsPageProps) {
  const { eventId } = await params

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settlements</h1>
        <p className="text-muted-foreground">
          Track and manage payments between participants
        </p>
      </div>

      <Suspense fallback={<SettlementDataSkeleton />}>
        <SettlementDataLoader eventId={eventId} />
      </Suspense>
    </div>
  )
}

interface SettlementDataLoaderProps {
  eventId: string
}

async function SettlementDataLoader({ eventId }: SettlementDataLoaderProps) {
  const { userId } = await auth()
  if (!userId) return null

  // Get event details
  const eventResponse = await getEventWithDetailsAction(eventId)
  if (!eventResponse.isSuccess || !eventResponse.data) {
    notFound()
  }
  const event = eventResponse.data

  // Get event participants
  const participantsResponse = await getEventParticipantsAction(eventId)
  if (!participantsResponse.isSuccess || !participantsResponse.data) {
    return <div>Failed to load participants</div>
  }
  const participants = participantsResponse.data

  // Get event expenses with allocations
  const expensesResponse = await getEventExpensesAction(eventId)
  if (!expensesResponse.isSuccess || !expensesResponse.data) {
    return <div>Failed to load expenses</div>
  }
  const expenses = expensesResponse.data

  // Get existing settlements
  const settlementsResponse = await getEventSettlementsAction(eventId)
  if (!settlementsResponse.isSuccess || !settlementsResponse.data) {
    return <div>Failed to load settlements</div>
  }
  const settlements = settlementsResponse.data

  // Calculate balances
  const balances = calculateBalances(expenses, participants, settlements)

  // Log balance structure for debugging
  console.log("Balances type:", typeof balances)
  console.log("Balances structure:", JSON.stringify(balances, null, 2))

  // Transform balances from Record<string, string> to array format
  const balancesArray = Object.entries(balances).map(
    ([participantId, balance]) => ({
      participantId,
      balance
    })
  )

  console.log(
    "Transformed balances array:",
    JSON.stringify(balancesArray, null, 2)
  )

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <Suspense fallback={<SettlementPlanSkeleton />}>
              <SettlementPlan
                eventId={eventId}
                participants={participants}
                settlements={settlements}
                balances={balancesArray}
              />
            </Suspense>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <Suspense fallback={<SettlementGraphSkeleton />}>
              <SettlementGraph
                participants={participants}
                settlements={settlements}
                balances={balancesArray}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettlementDataSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <SettlementPlanSkeleton />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <SettlementGraphSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
