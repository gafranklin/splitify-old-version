"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const paymentStatusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      status: {
        pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
        requested: "bg-blue-50 text-blue-700 ring-blue-600/20",
        completed: "bg-green-50 text-green-700 ring-green-600/20",
        cancelled: "bg-red-50 text-red-700 ring-red-600/20"
      }
    },
    defaultVariants: {
      status: "pending"
    }
  }
)

const statusText = {
  pending: "Pending",
  requested: "Requested",
  completed: "Completed",
  cancelled: "Cancelled"
}

export interface PaymentStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof paymentStatusVariants> {
  status: "pending" | "requested" | "completed" | "cancelled"
}

export function PaymentStatusBadge({
  className,
  status,
  ...props
}: PaymentStatusBadgeProps) {
  return (
    <div
      className={cn(paymentStatusVariants({ status }), className)}
      {...props}
    >
      {statusText[status]}
    </div>
  )
}
