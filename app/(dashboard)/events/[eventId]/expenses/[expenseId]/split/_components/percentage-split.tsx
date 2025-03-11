"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import { ExpenseWithItems, ParticipantSummary } from "@/types"
import { useSplitCalculation } from "@/lib/hooks/use-split-calculation"
import { createPercentageAllocationsAction } from "@/actions/db/expense-allocations-actions"

interface PercentageSplitProps {
  expense: ExpenseWithItems
  participants: ParticipantSummary[]
  selectedParticipantIds: string[]
  onSelectParticipant: (participantId: string) => void
  eventId: string
}

export default function PercentageSplit({
  expense,
  participants,
  selectedParticipantIds,
  onSelectParticipant,
  eventId
}: PercentageSplitProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    percentages,
    setPercentage,
    percentageSplitRemaining,
    isPercentageSplitValid,
    resetPercentages,
    distributeRemaining,
    getAmountFromPercentage
  } = useSplitCalculation({
    amount: Number(expense.amount),
    participants,
    selectedParticipantIds
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(2)}%`
  }

  // Handle percentage change
  const handlePercentageChange = (participantId: string, valueStr: string) => {
    // Convert to number, defaulting to 0 if invalid
    const value = parseFloat(valueStr) || 0
    setPercentage(participantId, value)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedParticipantIds.length === 0) {
      setError("Please select at least one participant")
      return
    }

    if (!isPercentageSplitValid) {
      setError("The total percentage must equal 100%")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Create input for the action
      const percentageSplitInputs = selectedParticipantIds.map(
        participantId => ({
          participantId,
          percentage: percentages[participantId] || 0
        })
      )

      const result = await createPercentageAllocationsAction(
        expense.id,
        percentageSplitInputs
      )

      if (result.isSuccess) {
        setSuccess("Expense split successfully")
        router.refresh()
        // Redirect back to expense details after a short delay
        setTimeout(() => {
          router.push(`/events/${eventId}/expenses/${expense.id}`)
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("An error occurred while splitting the expense")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Percentage Split</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted rounded-md p-4">
          <p className="text-sm">
            Assign percentages to each participant. Total remaining:{" "}
            <span
              className={`font-medium ${Math.abs(percentageSplitRemaining) < 0.01 ? "text-green-600" : "text-red-600"}`}
            >
              {formatPercentage(percentageSplitRemaining)}
            </span>
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetPercentages()}
              type="button"
            >
              <RefreshCw className="mr-2 size-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => distributeRemaining("percentage")}
              type="button"
              disabled={selectedParticipantIds.length === 0}
            >
              Distribute Remaining
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Select Participants and Percentages</h3>

          <div className="grid grid-cols-1 gap-3">
            {participants.map(participant => (
              <div
                key={participant.id}
                className="flex items-start space-x-3 rounded-md border p-3"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`participant-${participant.id}`}
                    checked={selectedParticipantIds.includes(participant.id)}
                    onCheckedChange={() => onSelectParticipant(participant.id)}
                  />
                  <Label
                    htmlFor={`participant-${participant.id}`}
                    className="cursor-pointer"
                  >
                    {participant.displayName ||
                      `User ${participant.id.substring(0, 4)}`}
                    {participant.isCurrentUser && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (You)
                      </span>
                    )}
                  </Label>
                </div>
                <div className="flex-1 pl-3">
                  <div className="flex items-center">
                    <div className="relative max-w-[120px]">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={percentages[participant.id] || ""}
                        onChange={e =>
                          handlePercentageChange(participant.id, e.target.value)
                        }
                        placeholder="0.00"
                        disabled={
                          !selectedParticipantIds.includes(participant.id)
                        }
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        %
                      </span>
                    </div>
                    <span className="ml-3 text-sm text-gray-500">
                      {selectedParticipantIds.includes(participant.id) &&
                        formatCurrency(getAmountFromPercentage(participant.id))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              selectedParticipantIds.length === 0 ||
              !isPercentageSplitValid
            }
          >
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Split Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
