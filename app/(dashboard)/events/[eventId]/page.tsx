"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import { Skeleton } from "@/components/ui/skeleton"
import EventHeader from "./_components/event-header"
import EventSummary from "./_components/event-summary"

interface EventPageProps {
  params: Promise<{ eventId: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  return (
    <div className="p-6">
      <Suspense fallback={<EventHeaderSkeleton />}>
        <EventHeaderFetcher params={params} />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<EventSummarySkeleton />}>
          <EventSummaryFetcher params={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function EventHeaderFetcher({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  const eventResponse = await getEventWithDetailsAction(eventId)

  if (!eventResponse.isSuccess || !eventResponse.data) {
    notFound()
  }

  return <EventHeader event={eventResponse.data} />
}

async function EventSummaryFetcher({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  const eventResponse = await getEventWithDetailsAction(eventId)

  if (!eventResponse.isSuccess || !eventResponse.data) {
    notFound()
  }

  return <EventSummary event={eventResponse.data} />
}

function EventHeaderSkeleton() {
  return (
    <div className="border-b pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-10 w-48" />
          <div className="mt-2 flex flex-wrap gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="size-9" />
        </div>
      </div>
    </div>
  )
}

function EventSummarySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>

      <Skeleton className="h-40 w-full" />
    </div>
  )
}
