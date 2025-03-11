"use client"

import { useMemo } from "react"
import {
  SelectExpense,
  SelectExpenseAllocation,
  SelectParticipant
} from "@/db/schema"
import { ExpenseSummary } from "@/types"

interface ParticipantWithBalance extends SelectParticipant {
  balance: number
}

interface SettlementTransaction {
  fromParticipantId: string
  toParticipantId: string
  amount: number
}

interface BalanceCalculationProps {
  expenses: ExpenseSummary[]
  allocations: SelectExpenseAllocation[]
  participants: SelectParticipant[]
}

export function useBalanceCalculation({
  expenses,
  allocations,
  participants
}: BalanceCalculationProps) {
  // Calculate each participant's balance
  const participantBalances = useMemo((): ParticipantWithBalance[] => {
    if (!participants.length || !expenses.length) {
      return participants.map(p => ({ ...p, balance: 0 }))
    }

    // Initialize balances for all participants
    const balances: Record<string, number> = {}
    participants.forEach(p => {
      balances[p.id] = 0
    })

    // For each expense, add the amount to the payer's balance
    expenses.forEach(expense => {
      if (expense.payerId) {
        balances[expense.payerId] =
          (balances[expense.payerId] || 0) + Number(expense.amount)
      }
    })

    // For each allocation, subtract the allocated amount from the participant's balance
    allocations.forEach(allocation => {
      const amount = Number(allocation.amount) || 0
      if (allocation.participantId && amount > 0) {
        balances[allocation.participantId] =
          (balances[allocation.participantId] || 0) - amount
      }
    })

    // Return participants with their calculated balances
    return participants.map(p => ({
      ...p,
      balance: balances[p.id] || 0
    }))
  }, [expenses, allocations, participants])

  // Calculate who owes whom
  const settlementPlan = useMemo(() => {
    // Deep copy of balances
    const balancesToSettle = participantBalances.map(p => ({
      id: p.id,
      balance: p.balance
    }))

    const settlements: {
      fromParticipantId: string
      toParticipantId: string
      amount: number
    }[] = []

    // Optimization algorithm to minimize number of transactions
    while (true) {
      // Find participants with the most negative and most positive balances
      const mostNegative = balancesToSettle.reduce(
        (prev, curr) => (curr.balance < prev.balance ? curr : prev),
        { id: "", balance: 0 }
      )

      const mostPositive = balancesToSettle.reduce(
        (prev, curr) => (curr.balance > prev.balance ? curr : prev),
        { id: "", balance: 0 }
      )

      // If all balances are approximately zero, we're done
      if (
        Math.abs(mostNegative.balance) < 0.01 &&
        Math.abs(mostPositive.balance) < 0.01
      ) {
        break
      }

      // Calculate how much can be settled in this iteration
      const amountToSettle = Math.min(
        Math.abs(mostNegative.balance),
        mostPositive.balance
      )

      if (amountToSettle > 0.01) {
        // Create a settlement transaction
        settlements.push({
          fromParticipantId: mostNegative.id,
          toParticipantId: mostPositive.id,
          amount: Number(amountToSettle.toFixed(2))
        })

        // Update balances
        mostNegative.balance += amountToSettle
        mostPositive.balance -= amountToSettle
      } else {
        // We've settled all significant amounts
        break
      }
    }

    return settlements
  }, [participantBalances])

  // Calculate total amount spent in the event
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  }, [expenses])

  // Calculate total owed (sum of all positive balances)
  const totalOwed = useMemo(() => {
    return participantBalances
      .filter(p => p.balance > 0)
      .reduce((sum, p) => sum + p.balance, 0)
  }, [participantBalances])

  return {
    participantBalances,
    settlementPlan,
    totalSpent,
    totalOwed
  }
}
