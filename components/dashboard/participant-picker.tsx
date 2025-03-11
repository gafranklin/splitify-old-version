"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react"

import { SelectParticipant } from "@/db/schema"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

interface ParticipantPickerProps {
  participants: SelectParticipant[]
  selectedParticipantIds: string[]
  onChange: (participantIds: string[]) => void
  disabled?: boolean
  className?: string
  multiple?: boolean
  placeholder?: string
}

export default function ParticipantPicker({
  participants,
  selectedParticipantIds,
  onChange,
  disabled = false,
  className,
  multiple = true,
  placeholder = "Select participants"
}: ParticipantPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedParticipants = participants.filter(participant =>
    selectedParticipantIds.includes(participant.id)
  )

  const handleSelect = (participantId: string) => {
    if (multiple) {
      if (selectedParticipantIds.includes(participantId)) {
        onChange(selectedParticipantIds.filter(id => id !== participantId))
      } else {
        onChange([...selectedParticipantIds, participantId])
      }
    } else {
      onChange([participantId])
      setOpen(false)
    }
  }

  const handleRemove = (participantId: string) => {
    onChange(selectedParticipantIds.filter(id => id !== participantId))
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedParticipantIds.length > 0
              ? `${selectedParticipantIds.length} participant${selectedParticipantIds.length > 1 ? "s" : ""} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search participants..." />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <UserPlus className="text-muted-foreground mb-2 size-10" />
                  <p className="text-muted-foreground text-sm">
                    No participants found
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {participants.map(participant => (
                  <CommandItem
                    key={participant.id}
                    value={participant.id}
                    onSelect={() => handleSelect(participant.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="mr-2 size-6">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {participant.displayName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {participant.displayName ||
                          participant.email ||
                          "Unknown"}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        selectedParticipantIds.includes(participant.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedParticipants.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedParticipants.map(participant => (
            <Badge
              key={participant.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Avatar className="size-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-[10px]">
                  {participant.displayName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[150px] truncate">
                {participant.displayName || participant.email || "Unknown"}
              </span>
              {!disabled && (
                <X
                  className="size-3 cursor-pointer"
                  onClick={() => handleRemove(participant.id)}
                />
              )}
            </Badge>
          ))}
          {!disabled && selectedParticipants.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClear}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
