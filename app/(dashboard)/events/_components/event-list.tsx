"use client"

import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon, UsersIcon, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { EventSummary } from "@/types"

// Using EventSummary instead of EventWithDetails to match what getUserEventsAction returns
interface EventListProps {
  events: EventSummary[]
}

export default function EventList({ events }: EventListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-muted-foreground text-sm">
                  <CalendarIcon className="mr-1 inline-block size-3" />
                  {event.startDate
                    ? format(new Date(event.startDate), "MMM d, yyyy")
                    : "No start date"}
                  {event.endDate &&
                    ` - ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                </p>
              </div>
              {event.userRole && (
                <Badge variant="outline" className="capitalize">
                  {event.userRole}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  <UsersIcon className="mr-1 inline-block size-3" />
                  {event.participantCount || 0} participants
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event.id}/expenses`}>Expenses</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/events/${event.id}`}>
                View
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
