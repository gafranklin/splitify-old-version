"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { SelectEvent } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import EventCard from "@/components/dashboard/event-card"
import { cn } from "@/lib/utils"

interface EventListProps {
  events: Array<
    SelectEvent & { participantCount: number; expenseCount: number }
  >
  className?: string
}

export default function EventList({ events, className }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date")

  // Filter events based on search query
  const filteredEvents = events.filter(
    event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location &&
        event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Sort events based on selected sort option
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      const aDate = a.startDate ? new Date(a.startDate) : new Date(0)
      const bDate = b.startDate ? new Date(b.startDate) : new Date(0)
      return bDate.getTime() - aDate.getTime() // Most recent first
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "participants") {
      return b.participantCount - a.participantCount
    }
    return 0
  })

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (newest)</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="participants">Participants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 size-4" />
            New Event
          </Link>
        </Button>
      </div>

      {sortedEvents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              participantCount={event.participantCount}
              expenseCount={event.expenseCount}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first event to get started"}
          </p>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 size-4" />
              Create Event
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
