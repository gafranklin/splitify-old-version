"use client"

import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon, UsersIcon, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

// Using a more specific type that includes the additional properties we need
interface EventWithDetails {
  id: string
  name: string
  description: string | null
  location: string | null
  startDate: Date | string | null
  endDate: Date | string | null
  isActive: boolean
  currency: string | null
  createdAt: Date
  updatedAt: Date
  creatorId: string
  status?: string
  participantCount?: number
  totalExpenses?: number
}

interface EventListProps {
  events: EventWithDetails[]
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
                  {format(new Date(event.startDate || ""), "MMM d, yyyy")}
                  {event.endDate &&
                    ` - ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                </p>
              </div>
              {event.status && (
                <Badge variant="outline" className="capitalize">
                  {event.status}
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
              {event.totalExpenses !== undefined && (
                <div>
                  <p className="text-sm font-medium">
                    {formatCurrency(
                      event.totalExpenses,
                      event.currency || "USD"
                    )}
                  </p>
                </div>
              )}
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
