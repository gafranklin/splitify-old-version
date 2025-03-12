"use server"

import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { auth } from "@clerk/nextjs/server"

import { Button } from "@/components/ui/button"
import { getUserEventsAction } from "@/actions/db/events-actions"
import EventList from "./_components/event-list"
import EventListSkeleton from "./_components/event-list-skeleton"

export default async function EventsPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 size-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Suspense fallback={<EventListSkeleton />}>
        <EventsFetcher />
      </Suspense>
    </div>
  )
}

async function EventsFetcher() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Authentication required</h3>
        <p className="text-muted-foreground text-sm">
          Please sign in to view your events.
        </p>
      </div>
    )
  }

  console.log(
    `DEBUG: Getting events for user ${userId}, calling getUserEventsAction without parameters`
  )
  const { data: events, isSuccess } = await getUserEventsAction()

  console.log(
    `DEBUG: getUserEventsAction result - success: ${isSuccess}, events count: ${events?.length || 0}`
  )

  if (!isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Unable to load events</h3>
        <p className="text-muted-foreground text-sm">
          There was an error loading your events. Please try again later.
        </p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No Events Yet</h3>
        <p className="text-muted-foreground text-sm">
          Create your first event to start tracking expenses.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/events/new">
            <Plus className="mr-2 size-4" />
            Create Event
          </Link>
        </Button>
      </div>
    )
  }

  return <EventList events={events} />
}
