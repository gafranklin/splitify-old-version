"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, AlertCircle, Ban } from "lucide-react"

export type PaymentStatus =
  | "pending"
  | "completed"
  | "confirmed"
  | "disputed"
  | "cancelled"

const statusConfig: Record<
  PaymentStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    icon: React.ReactNode
    className?: string
  }
> = {
  pending: {
    label: "Pending",
    variant: "outline",
    icon: <Clock className="mr-1 size-3" />,
    className: "border-yellow-500 text-yellow-500"
  },
  completed: {
    label: "Completed",
    variant: "outline",
    icon: <CheckCircle className="mr-1 size-3" />,
    className: "border-blue-500 text-blue-500"
  },
  confirmed: {
    label: "Confirmed",
    variant: "outline",
    icon: <CheckCircle className="mr-1 size-3" />,
    className: "border-green-500 text-green-500"
  },
  disputed: {
    label: "Disputed",
    variant: "outline",
    icon: <AlertCircle className="mr-1 size-3" />,
    className: "border-red-500 text-red-500"
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline",
    icon: <Ban className="mr-1 size-3" />,
    className: "border-gray-500 text-gray-500"
  }
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export default function PaymentStatusBadge({
  status,
  className
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center font-normal",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}
