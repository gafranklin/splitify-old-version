"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import RideshareConnect from "./_components/rideshare-connect"

export default async function RideshareImportPage({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Connect Rideshare Account</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <RideshareImportFetcher eventId={eventId} />
      </Suspense>
    </div>
  )
}

async function RideshareImportFetcher({ eventId }: { eventId: string }) {
  // Verify the event exists
  const { data: event, isSuccess } = await getEventWithDetailsAction(eventId)

  if (!isSuccess || !event) {
    notFound()
  }

  return <RideshareConnect eventId={eventId} />
}
