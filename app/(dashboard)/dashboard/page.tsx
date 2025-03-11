"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { CalendarRange, CreditCard, Users } from "lucide-react"

import { getUserEventsAction } from "@/actions/db/events-actions"
import { EventSummary } from "@/types"
import { SelectEvent } from "@/db/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import EventList from "../_components/event-list"

export default async function DashboardPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome to Splitify
        </h2>
        <p className="text-muted-foreground">
          Manage your shared expenses and track who owes what.
        </p>

        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Events</h3>

          <Suspense fallback={<EventListSkeleton />}>
            <EventListFetcher />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function DashboardStats() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const eventsResponse = await getUserEventsAction()
  const events = eventsResponse.isSuccess ? eventsResponse.data : []

  // Calculate some basic stats
  const totalEvents = events.length
  const activeEvents = events.filter(
    (event: EventSummary) =>
      !event.endDate || new Date(event.endDate) >= new Date()
  ).length
  const totalParticipants = events.reduce(
    (sum: number, event: EventSummary) => sum + (event.participantCount || 0),
    0
  )

  // Count expenses (assuming events might not have expenseCount property)
  const totalExpenses = events.reduce(
    (sum: number, event: EventSummary) =>
      sum + ((event as any).expenseCount || 0),
    0
  )

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <CalendarRange className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <p className="text-muted-foreground text-xs">
            {activeEvents} active events
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Participants</CardTitle>
          <Users className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <p className="text-muted-foreground text-xs">
            Across all your events
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <CreditCard className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalExpenses}</div>
          <p className="text-muted-foreground text-xs">Tracked and managed</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="size-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-8 w-[60px]" />
            <Skeleton className="h-4 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function EventListFetcher() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const eventsResponse = await getUserEventsAction()
  const events = eventsResponse.isSuccess ? eventsResponse.data : []

  // Convert EventSummary to the format expected by EventList
  const eventsForList = events.map((event: EventSummary) => {
    // Create a minimal SelectEvent with required fields
    const selectEvent: SelectEvent = {
      id: event.id,
      name: event.name,
      description: null,
      location: null,
      startDate: event.startDate || null,
      endDate: event.endDate || null,
      isActive: event.isActive,
      currency: "USD", // Default currency
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorId: userId
    }

    return {
      ...selectEvent,
      participantCount: event.participantCount,
      expenseCount: 0 // Default to 0 if not available
    }
  })

  return <EventList events={eventsForList} />
}

function EventListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}
