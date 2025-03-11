"use server"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getEventWithDetailsAction } from "@/actions/db/events-actions"
import { getEventParticipantSummariesAction } from "@/actions/db/participants-actions"
import ParticipantList from "./_components/participant-list"
import ParticipantForm from "./_components/participant-form"
import InviteForm from "./_components/invite-form"

interface ParticipantsPageProps {
  params: Promise<{ eventId: string }>
}

export default async function ParticipantsPage({
  params
}: ParticipantsPageProps) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Participants</h1>
        <p className="text-muted-foreground mt-2">
          Manage who's involved in this event.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Suspense fallback={<ParticipantListSkeleton />}>
            <ParticipantListFetcher params={params} />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<AddParticipantFormSkeleton />}>
            <AddParticipantFormFetcher params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function ParticipantListFetcher({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  const participantsResponse = await getEventParticipantSummariesAction(eventId)
  const eventResponse = await getEventWithDetailsAction(eventId)

  if (!participantsResponse.isSuccess || !eventResponse.isSuccess) {
    notFound()
  }

  const participants = participantsResponse.data
  const event = eventResponse.data
  const isUserOrganizer = event.userRole === "organizer"

  return (
    <ParticipantList
      participants={participants}
      eventId={eventId}
      isUserOrganizer={isUserOrganizer}
    />
  )
}

async function AddParticipantFormFetcher({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  const eventResponse = await getEventWithDetailsAction(eventId)

  if (!eventResponse.isSuccess) {
    notFound()
  }

  const event = eventResponse.data
  const isUserOrganizer = event.userRole === "organizer"

  if (!isUserOrganizer) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Only organizers can add or invite participants.
        </p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="add">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="add">Add User</TabsTrigger>
        <TabsTrigger value="invite">Invite by Email</TabsTrigger>
      </TabsList>
      <TabsContent value="add" className="mt-4">
        <ParticipantForm eventId={eventId} />
      </TabsContent>
      <TabsContent value="invite" className="mt-4">
        <InviteForm eventId={eventId} />
      </TabsContent>
    </Tabs>
  )
}

function ParticipantListSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function AddParticipantFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
