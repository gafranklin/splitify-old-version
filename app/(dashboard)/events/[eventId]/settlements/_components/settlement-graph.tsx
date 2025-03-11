"use client"

import { useState, useEffect, useRef } from "react"
import { SelectParticipant, SelectSettlement } from "@/db/schema"
import { formatCurrency } from "@/lib/hooks/use-utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge"
import {
  ArrowRight,
  Users,
  DollarSign,
  CheckCircle2,
  Clock
} from "lucide-react"

interface SettlementGraphProps {
  participants: SelectParticipant[]
  settlements: SelectSettlement[]
  balances: Record<string, string>
}

export default function SettlementGraph({
  participants,
  settlements,
  balances
}: SettlementGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  )

  // Filter active settlements (not cancelled)
  const activeSettlements = settlements.filter(s => s.status !== "cancelled")

  // Get completed settlements
  const completedSettlements = activeSettlements.filter(
    s => s.status === "completed"
  )
  const pendingSettlements = activeSettlements.filter(
    s => s.status !== "completed"
  )

  // Calculate total amount of all settlements
  const totalAmount = activeSettlements.reduce((sum, settlement) => {
    return sum + parseFloat(settlement.amount.toString())
  }, 0)

  // Calculate completion percentage
  const completionPercentage =
    activeSettlements.length > 0
      ? Math.round(
          (completedSettlements.length / activeSettlements.length) * 100
        )
      : 0

  // Get participant map for quick lookups
  const participantMap = participants.reduce(
    (acc, participant) => {
      acc[participant.id] = participant
      return acc
    },
    {} as Record<string, SelectParticipant>
  )

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Skip if no participants
    if (participants.length === 0) return

    // Calculate center and radius
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 40

    // Draw participants in a circle
    const participantPositions: Record<string, { x: number; y: number }> = {}

    participants.forEach((participant, index) => {
      const angle = (index / participants.length) * Math.PI * 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      participantPositions[participant.id] = { x, y }

      // Draw participant node
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)

      // Highlight selected participant
      if (selectedParticipant === participant.id) {
        ctx.fillStyle = "#3b82f6" // blue-500
        ctx.strokeStyle = "#1d4ed8" // blue-700
        ctx.lineWidth = 3
      } else {
        // Color based on balance
        const balance = parseFloat(balances[participant.id] || "0")
        if (balance > 0) {
          ctx.fillStyle = "#10b981" // green-500
          ctx.strokeStyle = "#059669" // green-600
        } else if (balance < 0) {
          ctx.fillStyle = "#ef4444" // red-500
          ctx.strokeStyle = "#dc2626" // red-600
        } else {
          ctx.fillStyle = "#6b7280" // gray-500
          ctx.strokeStyle = "#4b5563" // gray-600
        }
        ctx.lineWidth = 2
      }

      ctx.fill()
      ctx.stroke()

      // Draw participant initials
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const initials = (participant.displayName || "")
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)

      ctx.fillText(initials, x, y)
    })

    // Draw settlement connections
    activeSettlements.forEach(settlement => {
      const fromPos = participantPositions[settlement.fromParticipantId]
      const toPos = participantPositions[settlement.toParticipantId]

      if (!fromPos || !toPos) return

      // Calculate direction vector
      const dx = toPos.x - fromPos.x
      const dy = toPos.y - fromPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Normalize direction vector
      const nx = dx / distance
      const ny = dy / distance

      // Calculate start and end points (offset from participant nodes)
      const startX = fromPos.x + nx * 22
      const startY = fromPos.y + ny * 22
      const endX = toPos.x - nx * 22
      const endY = toPos.y - ny * 22

      // Draw line
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)

      // Style based on settlement status
      if (settlement.status === "completed") {
        ctx.strokeStyle = "#10b981" // green-500
      } else if (settlement.status === "requested") {
        ctx.strokeStyle = "#3b82f6" // blue-500
      } else {
        ctx.strokeStyle = "#f59e0b" // amber-500
      }

      // Highlight if selected participant is involved
      if (
        selectedParticipant === settlement.fromParticipantId ||
        selectedParticipant === settlement.toParticipantId
      ) {
        ctx.lineWidth = 3
      } else {
        ctx.lineWidth = 2
      }

      ctx.stroke()

      // Draw arrow
      const arrowSize = 8
      const angle = Math.atan2(dy, dx)

      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = ctx.strokeStyle
      ctx.fill()

      // Draw amount label
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2

      // Add slight offset perpendicular to the line
      const perpX = -ny * 15
      const perpY = nx * 15

      const labelX = midX + perpX
      const labelY = midY + perpY

      // Draw label background
      const amount = parseFloat(settlement.amount.toString())
      const amountText = formatCurrency(amount).replace(/\.00$/, "")
      const textWidth = ctx.measureText(amountText).width

      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.roundRect(
        labelX - textWidth / 2 - 5,
        labelY - 10,
        textWidth + 10,
        20,
        5
      )
      ctx.fill()

      // Draw amount text
      ctx.fillStyle = "#000000"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(amountText, labelX, labelY)
    })
  }, [participants, activeSettlements, selectedParticipant, balances])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Settlement Visualization</h3>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={300}
          className="bg-muted/30 h-[300px] w-full rounded-lg"
          onClick={() => setSelectedParticipant(null)}
        />

        {activeSettlements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <Users className="mx-auto mb-2 size-10 opacity-20" />
              <p>No settlements to visualize</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">
              Total: {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-500" />
            <span className="text-sm">{completionPercentage}% Complete</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="size-3 rounded-full bg-green-500" />
            <span className="text-xs">Completed</span>
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <div className="size-3 rounded-full bg-blue-500" />
            <span className="text-xs">Requested</span>
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <div className="size-3 rounded-full bg-amber-500" />
            <span className="text-xs">Pending</span>
          </Badge>
        </div>
      </div>

      {selectedParticipant && (
        <Card className="p-3">
          <div className="text-sm">
            <div className="font-medium">
              {participantMap[selectedParticipant]?.displayName || "Unknown"}
            </div>
            <div className="text-muted-foreground">
              Balance:{" "}
              {formatCurrency(parseFloat(balances[selectedParticipant] || "0"))}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Participants</h4>
        <div className="flex flex-wrap gap-2">
          {participants.map(participant => (
            <Badge
              key={participant.id}
              variant={
                selectedParticipant === participant.id ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() =>
                setSelectedParticipant(
                  selectedParticipant === participant.id ? null : participant.id
                )
              }
            >
              {participant.displayName}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
