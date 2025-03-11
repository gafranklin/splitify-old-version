/*
Settlement optimization algorithm to minimize the number of transactions between participants.
*/

import { SettlementOptimizationResult } from "@/types"
import Decimal from "decimal.js"

interface ParticipantBalance {
  participantId: string
  balance: Decimal
}

/**
 * Optimizes settlements to minimize the number of transactions between participants.
 *
 * @param balances Record of participant IDs to their balances (positive = owed money, negative = owes money)
 * @returns Optimized settlement plan
 */
export function optimizeSettlements(
  balances: Record<string, string>
): SettlementOptimizationResult {
  // Convert string balances to Decimal for precise calculations
  const participantBalances: ParticipantBalance[] = Object.entries(
    balances
  ).map(([participantId, balance]) => ({
    participantId,
    balance: new Decimal(balance)
  }))

  // Count how many non-zero balances we have (original transactions needed)
  const originalTransactions = participantBalances.filter(
    p => !p.balance.isZero()
  ).length

  // Separate participants into creditors (positive balance) and debtors (negative balance)
  const creditors = participantBalances
    .filter(p => p.balance.greaterThan(0))
    .sort((a, b) => b.balance.minus(a.balance).toNumber()) // Sort descending

  const debtors = participantBalances
    .filter(p => p.balance.lessThan(0))
    .sort((a, b) => a.balance.minus(b.balance).toNumber()) // Sort ascending (most negative first)

  const settlements: {
    fromParticipantId: string
    toParticipantId: string
    amount: string
  }[] = []

  // Greedy algorithm to match largest creditors with largest debtors
  let creditorIndex = 0
  let debtorIndex = 0

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]

    // The amount to settle is the minimum of what the creditor is owed and what the debtor owes
    // (we take the absolute value of the debtor's balance since it's negative)
    const amountToSettle = Decimal.min(creditor.balance, debtor.balance.abs())

    if (amountToSettle.greaterThan(0)) {
      // Create a settlement
      settlements.push({
        fromParticipantId: debtor.participantId,
        toParticipantId: creditor.participantId,
        amount: amountToSettle.toString()
      })

      // Update balances
      creditor.balance = creditor.balance.minus(amountToSettle)
      debtor.balance = debtor.balance.plus(amountToSettle)
    }

    // Move to the next participant if their balance is settled
    if (creditor.balance.isZero() || creditor.balance.lessThan(0.01)) {
      creditorIndex++
    }

    if (debtor.balance.isZero() || debtor.balance.greaterThan(-0.01)) {
      debtorIndex++
    }
  }

  return {
    settlements,
    totalTransactions: settlements.length,
    originalTransactions
  }
}

/**
 * Calculates participant balances based on expenses and existing settlements.
 *
 * @param expenses Array of expenses with allocations
 * @param participants Array of participants
 * @param existingSettlements Array of existing settlements
 * @returns Record of participant IDs to their balances
 */
export function calculateBalances(
  expenses: any[], // Replace with proper expense type
  participants: any[], // Replace with proper participant type
  existingSettlements: any[] // Replace with proper settlement type
): Record<string, string> {
  // Initialize balances for all participants
  const balances: Record<string, Decimal> = {}
  participants.forEach(p => {
    balances[p.id] = new Decimal(0)
  })

  // Process expenses and their allocations
  expenses.forEach(expense => {
    // The payer of the expense gets credit
    if (balances[expense.payerId]) {
      balances[expense.payerId] = balances[expense.payerId].plus(
        new Decimal(expense.amount)
      )
    }

    // Each participant with an allocation owes money
    expense.allocations?.forEach((allocation: any) => {
      if (balances[allocation.participantId]) {
        balances[allocation.participantId] = balances[
          allocation.participantId
        ].minus(new Decimal(allocation.amount))
      }
    })
  })

  // Process existing settlements
  existingSettlements.forEach(settlement => {
    if (
      settlement.status === "completed" &&
      balances[settlement.fromParticipantId] &&
      balances[settlement.toParticipantId]
    ) {
      // The person who paid (fromParticipantId) gets credit
      balances[settlement.fromParticipantId] = balances[
        settlement.fromParticipantId
      ].plus(new Decimal(settlement.amount))

      // The person who received (toParticipantId) owes money
      balances[settlement.toParticipantId] = balances[
        settlement.toParticipantId
      ].minus(new Decimal(settlement.amount))
    }
  })

  // Convert Decimal objects back to strings
  const stringBalances: Record<string, string> = {}
  Object.entries(balances).forEach(([participantId, balance]) => {
    stringBalances[participantId] = balance.toFixed(2)
  })

  return stringBalances
}
