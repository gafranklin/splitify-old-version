"use client"

import { SelectParticipant } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"

interface SettlementGraphProps {
  participants: SelectParticipant[]
  settlements: any[]
  balances: any[]
}

export default function SettlementGraph({
  participants,
  settlements,
  balances
}: SettlementGraphProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settlement Graph</h3>
        <p className="text-muted-foreground text-sm">
          Visualization of money flow between participants
        </p>
      </div>

      <div className="flex h-[300px] items-center justify-center rounded-md border">
        <p className="text-muted-foreground text-sm">
          Graph visualization will appear here
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Total settled</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Pending settlements</p>
              <p className="text-2xl font-bold">
                {participants.length > 1 ? participants.length - 1 : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
