"use client"

import { format } from "date-fns"
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"
import Link from "next/link"

import { SelectEvent } from "@/db/schema"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

interface EventCardProps {
  event: SelectEvent
  className?: string
  participantCount?: number
  expenseCount?: number
}

export default function EventCard({
  event,
  className,
  participantCount = 0,
  expenseCount = 0
}: EventCardProps) {
  const startDate = event.startDate ? new Date(event.startDate) : null
  const endDate = event.endDate ? new Date(event.endDate) : null

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{event.name}</CardTitle>
          <Badge variant={event.isActive ? "default" : "secondary"}>
            {event.isActive ? "Active" : "Archived"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {event.description || "No description provided"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {startDate && (
          <div className="text-muted-foreground flex items-center text-sm">
            <CalendarIcon className="mr-2 size-4" />
            <span>
              {format(startDate, "MMM d, yyyy")}
              {endDate &&
                endDate.getTime() !== startDate.getTime() &&
                ` - ${format(endDate, "MMM d, yyyy")}`}
            </span>
          </div>
        )}

        {event.location && (
          <div className="text-muted-foreground flex items-center text-sm">
            <MapPinIcon className="mr-2 size-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        <div className="text-muted-foreground flex items-center text-sm">
          <UsersIcon className="mr-2 size-4" />
          <span>{participantCount} participants</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-muted-foreground text-sm">
          {expenseCount} expenses
        </div>
        <Button asChild size="sm">
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
