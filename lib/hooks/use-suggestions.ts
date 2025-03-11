"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  ExpenseSuggestion,
  ParticipantSuggestion,
  SuggestionCategory
} from "@/types"
import { getSuggestions } from "@/lib/suggestions"

interface UseSuggestionsOptions {
  eventId?: string
  category: SuggestionCategory
  limit?: number
  excludeIds?: string[]
  enabled?: boolean
}

export function useSuggestions({
  eventId,
  category,
  limit = 5,
  excludeIds = [],
  enabled = true
}: UseSuggestionsOptions) {
  const { userId } = useAuth()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<
    ParticipantSuggestion[] | ExpenseSuggestion[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!userId || !enabled) return

      setIsLoading(true)
      setError(null)

      try {
        const result = await getSuggestions(category, {
          eventId,
          userId,
          query: searchQuery,
          limit,
          excludeIds
        })

        setSuggestions(result)
      } catch (err) {
        console.error("Error fetching suggestions:", err)
        setError("Failed to load suggestions")
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [userId, eventId, category, limit, excludeIds, enabled]
  )

  // Fetch suggestions when query changes (with debounce)
  useEffect(() => {
    if (!enabled) return

    const handler = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [query, fetchSuggestions, enabled])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchSuggestions("")
    }
  }, [enabled, fetchSuggestions])

  return {
    suggestions,
    isLoading,
    error,
    setQuery,
    refresh: () => fetchSuggestions(query)
  }
}
