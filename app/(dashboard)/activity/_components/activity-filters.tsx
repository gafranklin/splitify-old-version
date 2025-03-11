"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { ActivityFilters } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarIcon, Filter, RefreshCw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

const activityTypes = [
  { value: "event_created", label: "Event Created" },
  { value: "event_updated", label: "Event Updated" },
  { value: "event_deleted", label: "Event Deleted" },
  { value: "participant_added", label: "Participant Added" },
  { value: "participant_removed", label: "Participant Removed" },
  { value: "expense_created", label: "Expense Created" },
  { value: "expense_updated", label: "Expense Updated" },
  { value: "expense_deleted", label: "Expense Deleted" },
  { value: "expense_split", label: "Expense Split" },
  { value: "payment_requested", label: "Payment Requested" },
  { value: "payment_completed", label: "Payment Completed" },
  { value: "payment_confirmed", label: "Payment Confirmed" },
  { value: "payment_disputed", label: "Payment Disputed" },
  { value: "payment_proof_uploaded", label: "Payment Proof Uploaded" },
  { value: "settlement_created", label: "Settlement Created" },
  { value: "settlement_updated", label: "Settlement Updated" }
]

interface ActivityFiltersProps {
  onFilterChange?: (filters: ActivityFilters) => void
}

export default function ActivityFilters({
  onFilterChange
}: ActivityFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type)

    setSelectedTypes(newTypes)

    if (onFilterChange) {
      onFilterChange({
        type: newTypes.length > 0 ? newTypes : undefined,
        date: dateRange
      })
    }
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)

    if (onFilterChange) {
      onFilterChange({
        type: selectedTypes.length > 0 ? selectedTypes : undefined,
        date: range
      })
    }
  }

  const handleClearFilters = () => {
    setSelectedTypes([])
    setDateRange(undefined)

    if (onFilterChange) {
      onFilterChange({})
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="mr-2 size-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Activity Type</h3>
          <div className="space-y-2">
            {activityTypes.map(type => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={checked =>
                    handleTypeChange(type.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="text-sm font-normal"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Date Range</h3>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleClearFilters}
        >
          <RefreshCw className="mr-2 size-4" />
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  )
}
