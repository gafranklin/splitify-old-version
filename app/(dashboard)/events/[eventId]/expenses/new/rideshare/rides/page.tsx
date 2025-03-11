"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import { getEventParticipantSummariesAction } from "@/actions/db/participants-actions"
import RideList from "../_components/ride-list"

export default async function RideshareRidesPage({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Select a Ride</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <RideshareRidesFetcher eventId={eventId} />
      </Suspense>
    </div>
  )
}

async function RideshareRidesFetcher({ eventId }: { eventId: string }) {
  // Verify the event exists
  const { data: event, isSuccess: eventSuccess } =
    await getEventWithDetailsAction(eventId)

  if (!eventSuccess || !event) {
    notFound()
  }

  // Get participants with proper summary format including isCurrentUser
  const { data: participants, isSuccess: participantsSuccess } =
    await getEventParticipantSummariesAction(eventId)

  if (!participantsSuccess || !participants.length) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <h3 className="text-sm font-medium text-yellow-800">
          No participants found
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          There must be participants in the event to create expenses.
        </p>
      </div>
    )
  }

  return <RideList eventId={eventId} participants={participants} />
}
