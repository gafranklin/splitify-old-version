"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectParticipant } from "@/db/schema"

interface ParticipantWithBalance extends SelectParticipant {
  balance: number
}

interface BalanceChartProps {
  participants: ParticipantWithBalance[]
}

export default function BalanceChart({ participants }: BalanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate the maximum balance (absolute value) for scaling
    const maxBalance = Math.max(
      ...participants.map(p => Math.abs(p.balance)),
      0.01 // Minimum to avoid division by zero
    )

    // Calculate the center y-coordinate
    const centerY = canvas.height / 2

    // Calculate the bar width based on the number of participants
    const barWidth = canvas.width / (participants.length * 2)
    const barGap = barWidth / 2

    // Draw the horizontal axis
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(canvas.width, centerY)
    ctx.strokeStyle = "#d4d4d8" // Zinc-300
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw the bars for each participant
    participants.forEach((participant, index) => {
      const x = (barWidth + barGap) * index * 2 + barWidth / 2

      // Determine bar height and direction based on balance
      const barHeight =
        (Math.abs(participant.balance) / maxBalance) * (canvas.height / 2 - 20)
      const y = participant.balance > 0 ? centerY - barHeight : centerY

      // Set color based on balance (positive/negative)
      ctx.fillStyle =
        participant.balance > 0
          ? "rgba(34, 197, 94, 0.6)" // Green for positive balances
          : "rgba(239, 68, 68, 0.6)" // Red for negative balances

      // Draw bar
      ctx.fillRect(
        x,
        y,
        barWidth,
        participant.balance > 0 ? barHeight : Math.abs(barHeight)
      )

      // Draw participant name
      ctx.fillStyle = "#71717a" // Zinc-500
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(
        participant.displayName?.substring(0, 10) || "",
        x + barWidth / 2,
        canvas.height - 5
      )

      // Draw balance amount
      ctx.fillStyle = "#18181b" // Zinc-900
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(
        `$${Math.abs(participant.balance).toFixed(2)}`,
        x + barWidth / 2,
        participant.balance > 0
          ? centerY - barHeight - 5
          : centerY + barHeight + 15
      )
    })
  }, [participants])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <canvas
            ref={canvasRef}
            width={500}
            height={220}
            className="size-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
