"use server"

import EventForm from "../_components/event-form"

export default async function NewEventPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to create a new event.
        </p>
      </div>

      <EventForm />
    </div>
  )
}
