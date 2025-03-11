"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Calendar,
  Edit,
  MapPin,
  MoreHorizontal,
  Trash2,
  Users
} from "lucide-react"

import { EventWithDetails } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { deleteEventAction } from "@/actions/db/events-actions"

interface EventHeaderProps {
  event: EventWithDetails
}

export default function EventHeader({ event }: EventHeaderProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const startDate = event.startDate ? new Date(event.startDate) : null
  const endDate = event.endDate ? new Date(event.endDate) : null

  const isOrganizer = event.userRole === "organizer"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await deleteEventAction(event.id)
      if (response.isSuccess) {
        router.push("/dashboard")
        router.refresh()
      } else {
        console.error("Failed to delete event:", response.message)
        // Could add toast notification here
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="border-b pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <Badge variant={event.isActive ? "default" : "secondary"}>
              {event.isActive ? "Active" : "Archived"}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-4">
            {startDate && (
              <div className="text-muted-foreground flex items-center text-sm">
                <Calendar className="mr-1 size-4" />
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
                <MapPin className="mr-1 size-4" />
                <span>{event.location}</span>
              </div>
            )}

            <div className="text-muted-foreground flex items-center text-sm">
              <Users className="mr-1 size-4" />
              <span>{event.participantCount} participants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOrganizer && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.id}/participants`}>
                      <Users className="mr-2 size-4" />
                      Manage Participants
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event and all associated data,
              including expenses and settlements. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
