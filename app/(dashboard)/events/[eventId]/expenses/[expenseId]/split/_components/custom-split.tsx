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
import { createCustomAmountAllocationsAction } from "@/actions/db/expense-allocations-actions"

interface CustomSplitProps {
  expense: ExpenseWithItems
  participants: ParticipantSummary[]
  selectedParticipantIds: string[]
  onSelectParticipant: (participantId: string) => void
  eventId: string
}

export default function CustomSplit({
  expense,
  participants,
  selectedParticipantIds,
  onSelectParticipant,
  eventId
}: CustomSplitProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    customAmounts,
    setCustomAmount,
    customSplitRemaining,
    isCustomSplitValid,
    resetCustomAmounts,
    distributeRemaining
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

  // Handle custom amount change
  const handleAmountChange = (participantId: string, valueStr: string) => {
    // Convert to number, defaulting to 0 if invalid
    const value = parseFloat(valueStr) || 0
    setCustomAmount(participantId, value)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedParticipantIds.length === 0) {
      setError("Please select at least one participant")
      return
    }

    if (!isCustomSplitValid) {
      setError("The total split amount must equal the expense amount")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Create input for the action
      const customAmountInputs = selectedParticipantIds.map(participantId => ({
        participantId,
        amount: customAmounts[participantId] || 0
      }))

      const result = await createCustomAmountAllocationsAction(
        expense.id,
        customAmountInputs
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
        <CardTitle>Custom Amount Split</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted rounded-md p-4">
          <p className="text-sm">
            Specify exact amounts for each participant. Total remaining:{" "}
            <span
              className={`font-medium ${Math.abs(customSplitRemaining) < 0.01 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(customSplitRemaining)}
            </span>
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetCustomAmounts()}
              type="button"
            >
              <RefreshCw className="mr-2 size-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => distributeRemaining("amount")}
              type="button"
              disabled={selectedParticipantIds.length === 0}
            >
              Distribute Remaining
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Select Participants and Amounts</h3>

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
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customAmounts[participant.id] || ""}
                      onChange={e =>
                        handleAmountChange(participant.id, e.target.value)
                      }
                      placeholder="0.00"
                      disabled={
                        !selectedParticipantIds.includes(participant.id)
                      }
                      className="max-w-[120px]"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      {selectedParticipantIds.includes(participant.id) &&
                        (customAmounts[participant.id]
                          ? formatCurrency(customAmounts[participant.id])
                          : "$0.00")}
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
              !isCustomSplitValid
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
