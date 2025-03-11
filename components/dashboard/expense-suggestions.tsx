"use client"

import { useState } from "react"
import { useSuggestions } from "@/lib/hooks/use-suggestions"
import { ExpenseSuggestion } from "@/types"
import { Input } from "@/components/ui/input"
import { Loader2, Receipt, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

interface ExpenseSuggestionsProps {
  eventId?: string
  excludeIds?: string[]
  onSelect: (expense: ExpenseSuggestion) => void
  className?: string
  placeholder?: string
}

export default function ExpenseSuggestions({
  eventId,
  excludeIds,
  onSelect,
  className,
  placeholder = "Search expenses..."
}: ExpenseSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { suggestions, isLoading, error, setQuery } = useSuggestions({
    eventId,
    category: "expense",
    excludeIds,
    enabled: isOpen
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleSelect = (expense: ExpenseSuggestion) => {
    onSelect(expense)
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
              No expenses found
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto py-1">
              {(suggestions as ExpenseSuggestion[]).map(expense => (
                <li
                  key={expense.id}
                  className="hover:bg-accent flex cursor-pointer items-center justify-between px-4 py-2"
                  onClick={() => handleSelect(expense)}
                >
                  <div className="flex items-center">
                    <Receipt className="text-muted-foreground mr-2 size-4" />
                    <span>{expense.title}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
