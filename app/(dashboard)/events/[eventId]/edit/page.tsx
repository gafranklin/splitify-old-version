"use server"

import { notFound } from "next/navigation"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import EventForm from "../../_components/event-form"

interface EditEventPageProps {
  params: Promise<{ eventId: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params

  // Fetch the event details
  const eventResponse = await getEventWithDetailsAction(eventId)

  if (!eventResponse.isSuccess || !eventResponse.data) {
    notFound()
  }

  const event = eventResponse.data

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground mt-2">
          Update the details of your event.
        </p>
      </div>

      <EventForm event={event} />
    </div>
  )
}
