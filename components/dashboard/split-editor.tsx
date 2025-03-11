"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { ParticipantSummary } from "@/types"

export interface SplitParticipant extends ParticipantSummary {
  amount: number
  percentage: number
  isIncluded: boolean
}

interface SplitEditorProps {
  participants: ParticipantSummary[]
  totalAmount: number
  onSave: (
    splitData: SplitParticipant[]
  ) => Promise<{ success: boolean; message: string }>
  isProUser?: boolean
}

export default function SplitEditor({
  participants,
  totalAmount,
  onSave,
  isProUser = false
}: SplitEditorProps) {
  const [splitMethod, setSplitMethod] = useState("equal")
  const [splitData, setSplitData] = useState<SplitParticipant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize split data
  useEffect(() => {
    const initialSplitData = participants.map(participant => ({
      ...participant,
      amount: 0,
      percentage: 0,
      isIncluded: true
    }))
    setSplitData(initialSplitData)
    updateEqualSplit(initialSplitData)
  }, [participants, totalAmount])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Update equal split
  const updateEqualSplit = (data = splitData) => {
    const includedParticipants = data.filter(p => p.isIncluded)
    if (includedParticipants.length === 0) return

    const equalAmount = totalAmount / includedParticipants.length
    const equalPercentage = 100 / includedParticipants.length

    setSplitData(
      data.map(p => ({
        ...p,
        amount: p.isIncluded ? equalAmount : 0,
        percentage: p.isIncluded ? equalPercentage : 0
      }))
    )
  }

  // Toggle participant inclusion
  const toggleParticipant = (id: string) => {
    const newSplitData = splitData.map(p =>
      p.id === id ? { ...p, isIncluded: !p.isIncluded } : p
    )
    setSplitData(newSplitData)

    if (splitMethod === "equal") {
      updateEqualSplit(newSplitData)
    } else if (splitMethod === "percentage") {
      updatePercentageSplit(newSplitData)
    }
  }

  // Update custom amount
  const updateCustomAmount = (id: string, amount: number) => {
    setSplitData(
      splitData.map(p =>
        p.id === id
          ? {
              ...p,
              amount,
              percentage: (amount / totalAmount) * 100
            }
          : p
      )
    )
  }

  // Update percentage split
  const updatePercentageSplit = (data = splitData) => {
    const includedParticipants = data.filter(p => p.isIncluded)
    if (includedParticipants.length === 0) return

    // Distribute remaining percentage evenly
    const totalPercentage = includedParticipants.reduce(
      (sum, p) => sum + p.percentage,
      0
    )

    if (totalPercentage !== 100) {
      const remainingPercentage = 100 - totalPercentage
      const perParticipant = remainingPercentage / includedParticipants.length

      setSplitData(
        data.map(p => {
          if (!p.isIncluded) return { ...p, percentage: 0, amount: 0 }
          const newPercentage = p.percentage + perParticipant
          return {
            ...p,
            percentage: newPercentage,
            amount: (totalAmount * newPercentage) / 100
          }
        })
      )
    }
  }

  // Update percentage for a participant
  const updateParticipantPercentage = (id: string, percentage: number) => {
    setSplitData(
      splitData.map(p =>
        p.id === id
          ? {
              ...p,
              percentage,
              amount: (totalAmount * percentage) / 100
            }
          : p
      )
    )
  }

  // Handle split method change
  const handleSplitMethodChange = (value: string) => {
    setSplitMethod(value)

    if (value === "equal") {
      updateEqualSplit()
    } else if (value === "percentage") {
      // Initialize percentage split
      const includedParticipants = splitData.filter(p => p.isIncluded)
      if (includedParticipants.length === 0) return

      const equalPercentage = 100 / includedParticipants.length

      setSplitData(
        splitData.map(p => ({
          ...p,
          percentage: p.isIncluded ? equalPercentage : 0,
          amount: p.isIncluded ? (totalAmount * equalPercentage) / 100 : 0
        }))
      )
    }
  }

  // Validate split data
  const validateSplitData = () => {
    const includedParticipants = splitData.filter(p => p.isIncluded)
    if (includedParticipants.length === 0) {
      setError("Please include at least one participant")
      return false
    }

    const totalSplitAmount = splitData.reduce((sum, p) => sum + p.amount, 0)

    // Allow for small floating point differences
    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      setError(
        `Total split amount (${formatCurrency(totalSplitAmount)}) doesn't match expense amount (${formatCurrency(totalAmount)})`
      )
      return false
    }

    return true
  }

  // Handle save
  const handleSave = async () => {
    if (!validateSplitData()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await onSave(splitData)

      if (result.success) {
        setSuccess(result.message || "Split saved successfully")
      } else {
        setError(result.message || "Failed to save split")
      }
    } catch (error) {
      setError("An error occurred while saving the split")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total split amount
  const totalSplitAmount = splitData.reduce((sum, p) => sum + p.amount, 0)
  const totalSplitPercentage = splitData.reduce(
    (sum, p) => sum + p.percentage,
    0
  )

  // Check if split is balanced
  const isBalanced = Math.abs(totalSplitAmount - totalAmount) < 0.01
  const isPercentageBalanced = Math.abs(totalSplitPercentage - 100) < 0.01

  return (
    <Card>
      <CardHeader>
        <CardTitle>Split Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="equal" onValueChange={handleSplitMethodChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equal">Equal</TabsTrigger>
            <TabsTrigger value="custom" disabled={!isProUser}>
              Custom {!isProUser && "(Pro)"}
            </TabsTrigger>
            <TabsTrigger value="percentage" disabled={!isProUser}>
              Percentage {!isProUser && "(Pro)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equal" className="space-y-6">
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm">
                Split the expense equally among all selected participants.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Participants</h3>
                <div className="text-muted-foreground text-sm">
                  Total: {formatCurrency(totalSplitAmount)}
                </div>
              </div>

              <div className="space-y-3">
                {splitData.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`equal-${participant.id}`}
                        checked={participant.isIncluded}
                        onCheckedChange={() =>
                          toggleParticipant(participant.id)
                        }
                      />
                      <Label
                        htmlFor={`equal-${participant.id}`}
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
                    <div className="font-medium">
                      {participant.isIncluded
                        ? formatCurrency(participant.amount)
                        : "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {isProUser && (
            <TabsContent value="custom" className="space-y-6">
              <div className="bg-muted rounded-md p-4">
                <p className="text-sm">
                  Specify custom amounts for each participant.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Participants</h3>
                  <div
                    className={`text-sm ${isBalanced ? "text-muted-foreground" : "text-red-500"}`}
                  >
                    Total: {formatCurrency(totalSplitAmount)} /{" "}
                    {formatCurrency(totalAmount)}
                  </div>
                </div>

                <div className="space-y-3">
                  {splitData.map(participant => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`custom-${participant.id}`}
                          checked={participant.isIncluded}
                          onCheckedChange={() =>
                            toggleParticipant(participant.id)
                          }
                        />
                        <Label
                          htmlFor={`custom-${participant.id}`}
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
                      <div className="w-32">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={participant.amount}
                          onChange={e =>
                            updateCustomAmount(
                              participant.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          disabled={!participant.isIncluded}
                          className="text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {isProUser && (
            <TabsContent value="percentage" className="space-y-6">
              <div className="bg-muted rounded-md p-4">
                <p className="text-sm">
                  Assign percentages of the total to each participant.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Participants</h3>
                  <div
                    className={`text-sm ${isPercentageBalanced ? "text-muted-foreground" : "text-red-500"}`}
                  >
                    Total: {totalSplitPercentage.toFixed(1)}% / 100%
                  </div>
                </div>

                <div className="space-y-5">
                  {splitData.map(participant => (
                    <div
                      key={participant.id}
                      className="space-y-2 rounded-md border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`percentage-${participant.id}`}
                            checked={participant.isIncluded}
                            onCheckedChange={() =>
                              toggleParticipant(participant.id)
                            }
                          />
                          <Label
                            htmlFor={`percentage-${participant.id}`}
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
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {participant.percentage.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground text-sm">
                            ({formatCurrency(participant.amount)})
                          </span>
                        </div>
                      </div>

                      <Slider
                        value={[participant.percentage]}
                        min={0}
                        max={100}
                        step={1}
                        disabled={!participant.isIncluded}
                        onValueChange={values =>
                          updateParticipantPercentage(participant.id, values[0])
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

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

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Split
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
