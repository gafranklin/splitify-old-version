"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CrownIcon,
  MoreHorizontal,
  ShieldIcon,
  Trash2Icon,
  UserIcon
} from "lucide-react"

import { ParticipantSummary } from "@/types"
import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  removeParticipantAction,
  updateParticipantAction
} from "@/actions/db/participants-actions"

interface ParticipantListProps {
  participants: ParticipantSummary[]
  eventId: string
  isUserOrganizer: boolean
}

export default function ParticipantList({
  participants,
  eventId,
  isUserOrganizer
}: ParticipantListProps) {
  const router = useRouter()
  const [participantToRemove, setParticipantToRemove] =
    useState<ParticipantSummary | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemoveParticipant = async () => {
    if (!participantToRemove) return

    setIsRemoving(true)
    try {
      const response = await removeParticipantAction(participantToRemove.id)
      if (response.isSuccess) {
        router.refresh()
      } else {
        console.error("Failed to remove participant:", response.message)
        // Could add toast notification here
      }
    } catch (error) {
      console.error("Error removing participant:", error)
    } finally {
      setIsRemoving(false)
      setParticipantToRemove(null)
    }
  }

  const handleRoleChange = async (participantId: string, newRole: string) => {
    try {
      const response = await updateParticipantAction(participantId, {
        role: newRole as "organizer" | "member"
      })
      if (response.isSuccess) {
        router.refresh()
      } else {
        console.error("Failed to update participant role:", response.message)
        // Could add toast notification here
      }
    } catch (error) {
      console.error("Error updating participant role:", error)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            {isUserOrganizer && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map(participant => (
            <TableRow key={participant.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {participant.displayName || "Unnamed Participant"}
                  {participant.isCurrentUser && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {participant.role === "organizer" ? (
                    <>
                      <CrownIcon className="mr-1 size-4 text-amber-500" />
                      <span>Organizer</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="text-muted-foreground mr-1 size-4" />
                      <span>Member</span>
                    </>
                  )}
                </div>
              </TableCell>
              {isUserOrganizer && (
                <TableCell>
                  {!participant.isCurrentUser ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {participant.role === "member" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(participant.id, "organizer")
                            }
                          >
                            <CrownIcon className="mr-2 size-4" />
                            Make Organizer
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(participant.id, "member")
                            }
                          >
                            <UserIcon className="mr-2 size-4" />
                            Make Member
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setParticipantToRemove(participant)}
                        >
                          <Trash2Icon className="mr-2 size-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-muted-foreground text-sm">(You)</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {participants.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={isUserOrganizer ? 3 : 2}
                className="h-24 text-center"
              >
                No participants found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!participantToRemove}
        onOpenChange={open => !open && setParticipantToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {participantToRemove?.displayName || "this participant"}
              </strong>{" "}
              from the event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveParticipant}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
