"use client"

import { SelectParticipant } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, ArrowRight } from "lucide-react"

interface SettlementPlanProps {
  eventId: string
  participants: SelectParticipant[]
  settlements: any[]
  balances: any[]
}

export default function SettlementPlan({
  eventId,
  participants,
  settlements,
  balances
}: SettlementPlanProps) {
  // Demo settlements for UI rendering
  const demoSettlements = [
    {
      fromParticipantId: participants[0]?.id || "",
      toParticipantId: participants[1]?.id || "",
      amount: 25.5
    },
    {
      fromParticipantId: participants[2]?.id || "",
      toParticipantId: participants[1]?.id || "",
      amount: 15.75
    }
  ].filter(s => s.fromParticipantId && s.toParticipantId)

  // Find participant names
  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId)
    return participant?.displayName || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settlement Plan</h3>
        <p className="text-muted-foreground text-sm">
          The most efficient way to settle all debts
        </p>
      </div>

      <div className="space-y-4">
        {demoSettlements.length === 0 ? (
          <div className="rounded-md border p-4 text-center">
            <p>All balances are settled!</p>
          </div>
        ) : (
          demoSettlements.map((settlement, index) => (
            <div
              key={index}
              className="rounded-md border p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  ${settlement.amount.toFixed(2)}
                </span>
                <Badge variant="outline" className="text-xs">
                  Pending
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm">
                  {getParticipantName(settlement.fromParticipantId)}
                </span>
                <ArrowRight className="text-muted-foreground size-4" />
                <span className="text-sm">
                  {getParticipantName(settlement.toParticipantId)}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <Clock className="mr-1 size-3" /> Remind
                </Button>
                <Button size="sm" className="text-xs">
                  <Check className="mr-1 size-3" /> Mark as Paid
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
