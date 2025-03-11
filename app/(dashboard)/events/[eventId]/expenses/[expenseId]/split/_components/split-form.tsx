"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { ExpenseWithItems, ParticipantSummary } from "@/types"
import { SelectExpenseAllocation } from "@/db/schema"
import { createEqualAllocationsAction } from "@/actions/db/expense-allocations-actions"
import CustomSplit from "./custom-split"
import PercentageSplit from "./percentage-split"

interface SplitFormProps {
  expense: ExpenseWithItems
  participants: ParticipantSummary[]
  existingAllocations: SelectExpenseAllocation[]
  eventId: string
}

export default function SplitForm({
  expense,
  participants,
  existingAllocations,
  eventId
}: SplitFormProps) {
  const router = useRouter()
  const [splitMethod, setSplitMethod] = useState("equal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Selected participants (for now, we'll use all participants)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    participants.map(p => p.id)
  )

  // Format currency
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(amount))
  }

  // Calculate per-person amount for equal split
  const equalAmount = Number(expense.amount) / selectedParticipants.length
  const formattedEqualAmount = formatCurrency(equalAmount)

  // Handle participant selection
  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId)
      } else {
        return [...prev, participantId]
      }
    })
  }

  // Handle split submission for equal split
  const handleEqualSplitSubmit = async () => {
    if (selectedParticipants.length === 0) {
      setError("Please select at least one participant")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // For equal split
      const result = await createEqualAllocationsAction(expense.id)

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
        <CardTitle>Split Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="equal" onValueChange={setSplitMethod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equal">Equal</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="percentage">Percentage</TabsTrigger>
          </TabsList>

          <TabsContent value="equal" className="space-y-6">
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm">
                Split the expense equally among all selected participants. Each
                person will pay{" "}
                <span className="font-medium">{formattedEqualAmount}</span>.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Select Participants</h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-2 rounded-md border p-3"
                  >
                    <Checkbox
                      id={`participant-${participant.id}`}
                      checked={selectedParticipants.includes(participant.id)}
                      onCheckedChange={() =>
                        handleParticipantToggle(participant.id)
                      }
                    />
                    <Label
                      htmlFor={`participant-${participant.id}`}
                      className="flex-1 cursor-pointer"
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
                onClick={handleEqualSplitSubmit}
                disabled={isSubmitting || selectedParticipants.length === 0}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Split Expense
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <CustomSplit
              expense={expense}
              participants={participants}
              selectedParticipantIds={selectedParticipants}
              onSelectParticipant={handleParticipantToggle}
              eventId={eventId}
            />
          </TabsContent>

          <TabsContent value="percentage">
            <PercentageSplit
              expense={expense}
              participants={participants}
              selectedParticipantIds={selectedParticipants}
              onSelectParticipant={handleParticipantToggle}
              eventId={eventId}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
