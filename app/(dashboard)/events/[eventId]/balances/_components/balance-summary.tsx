"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SelectEvent,
  SelectExpense,
  SelectExpenseAllocation,
  SelectParticipant
} from "@/db/schema"
import { ExpenseSummary } from "@/types"
import { useBalanceCalculation } from "@/lib/hooks/use-balance-calculation"
import { formatCurrency } from "@/lib/utils"
import BalanceChart from "./balance-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown } from "lucide-react"

interface ParticipantWithBalance extends SelectParticipant {
  balance: number
}

interface SettlementTransaction {
  fromParticipantId: string
  toParticipantId: string
  amount: number
}

interface BalanceSummaryProps {
  event: SelectEvent
  expenses: ExpenseSummary[]
  participants: SelectParticipant[]
  allocations: SelectExpenseAllocation[]
}

export default function BalanceSummary({
  event,
  expenses,
  participants,
  allocations
}: BalanceSummaryProps) {
  const { participantBalances, settlementPlan, totalSpent, totalOwed } =
    useBalanceCalculation({
      expenses,
      allocations,
      participants
    })

  // Get participant names by ID for display in the settlement plan
  const participantNamesById = useMemo(() => {
    const names: Record<string, string> = {}
    participants.forEach(p => {
      names[p.id] = p.displayName || `Participant ${p.id.slice(0, 4)}`
    })
    return names
  }, [participants])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total spent</span>
              <span className="text-sm font-medium">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Expense count
              </span>
              <span className="text-sm font-medium">{expenses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Participant count
              </span>
              <span className="text-sm font-medium">{participants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Average per person
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(
                  participants.length ? totalSpent / participants.length : 0
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {participantBalances.length > 0 && (
        <BalanceChart participants={participantBalances} />
      )}

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Participant Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {participantBalances.map(participant => (
              <div
                key={participant.id}
                className="flex items-center justify-between border-b py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {participant.displayName?.substring(0, 2) || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{participant.displayName}</div>
                    <div className="text-muted-foreground text-xs">
                      {participant.email}
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 font-medium ${
                    participant.balance > 0
                      ? "text-green-600"
                      : participant.balance < 0
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {participant.balance > 0 && <ArrowUp className="size-3" />}
                  {participant.balance < 0 && <ArrowDown className="size-3" />}
                  {formatCurrency(Math.abs(participant.balance))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {settlementPlan.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recommended Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlementPlan.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {participantNamesById[settlement.fromParticipantId]}
                    </span>
                    <span className="text-muted-foreground">pays</span>
                    <span className="font-medium">
                      {participantNamesById[settlement.toParticipantId]}
                    </span>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(settlement.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
