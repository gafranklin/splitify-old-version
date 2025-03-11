"use client"

import { useState, useMemo } from "react"
import { ParticipantSummary } from "@/types"

interface SplitCalculationProps {
  amount: number
  participants: ParticipantSummary[]
  selectedParticipantIds: string[]
}

interface CustomAmountSplit {
  [participantId: string]: number
}

interface PercentageSplit {
  [participantId: string]: number
}

export function useSplitCalculation({
  amount,
  participants,
  selectedParticipantIds
}: SplitCalculationProps) {
  // State for custom amount split
  const [customAmounts, setCustomAmounts] = useState<CustomAmountSplit>({})

  // State for percentage split
  const [percentages, setPercentages] = useState<PercentageSplit>({})

  // Calculate equal split
  const equalSplit = useMemo(() => {
    if (selectedParticipantIds.length === 0) return 0
    return amount / selectedParticipantIds.length
  }, [amount, selectedParticipantIds])

  // Calculate remaining amount for custom split
  const customSplitRemaining = useMemo(() => {
    const allocatedAmount = Object.values(customAmounts).reduce(
      (sum, value) => sum + value,
      0
    )
    return amount - allocatedAmount
  }, [amount, customAmounts])

  // Calculate remaining percentage for percentage split
  const percentageSplitRemaining = useMemo(() => {
    const allocatedPercentage = Object.values(percentages).reduce(
      (sum, value) => sum + value,
      0
    )
    return 100 - allocatedPercentage
  }, [percentages])

  // Validate if splits are valid
  const isCustomSplitValid = useMemo(() => {
    return Math.abs(customSplitRemaining) < 0.01
  }, [customSplitRemaining])

  const isPercentageSplitValid = useMemo(() => {
    return Math.abs(percentageSplitRemaining) < 0.01
  }, [percentageSplitRemaining])

  // Helper to set a custom amount for a participant
  const setCustomAmount = (participantId: string, value: number) => {
    setCustomAmounts(prev => ({
      ...prev,
      [participantId]: value
    }))
  }

  // Helper to set a percentage for a participant
  const setPercentage = (participantId: string, value: number) => {
    setPercentages(prev => ({
      ...prev,
      [participantId]: value
    }))
  }

  // Reset all custom amounts
  const resetCustomAmounts = () => {
    setCustomAmounts({})
  }

  // Reset all percentages
  const resetPercentages = () => {
    setPercentages({})
  }

  // Distribute remaining amount/percentage equally
  const distributeRemaining = (type: "amount" | "percentage") => {
    if (selectedParticipantIds.length === 0) return

    if (type === "amount") {
      const remaining = customSplitRemaining
      const perParticipant = remaining / selectedParticipantIds.length

      const newCustomAmounts = { ...customAmounts }

      selectedParticipantIds.forEach(id => {
        newCustomAmounts[id] = (newCustomAmounts[id] || 0) + perParticipant
      })

      setCustomAmounts(newCustomAmounts)
    } else {
      const remaining = percentageSplitRemaining
      const perParticipant = remaining / selectedParticipantIds.length

      const newPercentages = { ...percentages }

      selectedParticipantIds.forEach(id => {
        newPercentages[id] = (newPercentages[id] || 0) + perParticipant
      })

      setPercentages(newPercentages)
    }
  }

  // Calculate the amount for percentage split
  const getAmountFromPercentage = (participantId: string) => {
    const percentage = percentages[participantId] || 0
    return (percentage / 100) * amount
  }

  return {
    equalSplit,
    customAmounts,
    percentages,
    customSplitRemaining,
    percentageSplitRemaining,
    isCustomSplitValid,
    isPercentageSplitValid,
    setCustomAmount,
    setPercentage,
    resetCustomAmounts,
    resetPercentages,
    distributeRemaining,
    getAmountFromPercentage
  }
}
