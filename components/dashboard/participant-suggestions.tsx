"use client"

import { useState } from "react"
import { useSuggestions } from "@/lib/hooks/use-suggestions"
import { ParticipantSuggestion } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParticipantSuggestionsProps {
  eventId?: string
  excludeIds?: string[]
  onSelect: (participant: ParticipantSuggestion) => void
  className?: string
  placeholder?: string
}

export default function ParticipantSuggestions({
  eventId,
  excludeIds,
  onSelect,
  className,
  placeholder = "Search participants..."
}: ParticipantSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { suggestions, isLoading, error, setQuery } = useSuggestions({
    eventId,
    category: "participant",
    excludeIds,
    enabled: isOpen
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleSelect = (participant: ParticipantSuggestion) => {
    onSelect(participant)
    setIsOpen(false)
    setQuery("")
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
        <Input
          placeholder={placeholder}
          className="pl-8"
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {isOpen && (
        <div className="bg-background absolute z-10 mt-1 w-full rounded-md border shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-destructive p-4 text-center text-sm">
              {error}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              No participants found
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto py-1">
              {(suggestions as ParticipantSuggestion[]).map(participant => (
                <li
                  key={participant.id}
                  className="hover:bg-accent flex cursor-pointer items-center px-4 py-2"
                  onClick={() => handleSelect(participant)}
                >
                  <Avatar className="mr-2 size-8">
                    <AvatarImage src={participant.imageUrl} />
                    <AvatarFallback>
                      {participant.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{participant.displayName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
