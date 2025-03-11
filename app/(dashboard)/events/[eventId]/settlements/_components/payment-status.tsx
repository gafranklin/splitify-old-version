"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle
} from "lucide-react"
import { SelectSettlement } from "@/db/schema"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Create our own badge component since the status field names don't exactly match
function StatusBadge({ status }: { status: string }) {
  const getProps = () => {
    switch (status) {
      case "pending":
        return {
          variant: "outline" as const,
          className: "text-muted-foreground border-muted-foreground",
          label: "Pending"
        }
      case "requested":
        return {
          variant: "outline" as const,
          className: "text-blue-500 border-blue-500",
          label: "Initiated"
        }
      case "completed":
        return {
          variant: "outline" as const,
          className: "text-green-500 border-green-500",
          label: "Confirmed"
        }
      case "disputed":
        return {
          variant: "outline" as const,
          className: "text-amber-500 border-amber-500",
          label: "Disputed"
        }
      case "cancelled":
        return {
          variant: "outline" as const,
          className: "text-red-500 border-red-500",
          label: "Cancelled"
        }
      default:
        return {
          variant: "outline" as const,
          className: "text-muted-foreground border-muted-foreground",
          label: status.charAt(0).toUpperCase() + status.slice(1)
        }
    }
  }

  const { variant, className, label } = getProps()

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

interface PaymentStatusProps {
  settlement: SelectSettlement
  isPayer: boolean
  isPayee: boolean
  className?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function PaymentStatus({
  settlement,
  isPayer,
  isPayee,
  className,
  onRefresh,
  isRefreshing = false
}: PaymentStatusProps) {
  const router = useRouter()
  const [localRefreshing, setLocalRefreshing] = useState(false)

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      setLocalRefreshing(true)
      // If no external refresh handler is provided, just refresh the page
      setTimeout(() => {
        router.refresh()
        setLocalRefreshing(false)
      }, 500)
    }
  }

  const refreshing = isRefreshing || localRefreshing

  const getStatusDetails = () => {
    switch (settlement.status) {
      case "pending":
        return {
          title: "Payment Pending",
          description: "This payment has not been initiated yet.",
          icon: <Clock className="text-muted-foreground mr-2 size-5" />
        }
      case "requested":
        return {
          title: "Payment Initiated",
          description:
            "The payment has been initiated and is waiting for confirmation.",
          icon: <Clock className="mr-2 size-5 text-blue-500" />
        }
      case "completed":
        return {
          title: "Payment Confirmed",
          description: "The payment has been confirmed by the recipient.",
          icon: <CheckCircle2 className="mr-2 size-5 text-green-500" />
        }
      case "cancelled":
        return {
          title: "Payment Cancelled",
          description: "This payment has been cancelled.",
          icon: <XCircle className="mr-2 size-5 text-red-500" />
        }
      default:
        return {
          title: "Unknown Status",
          description: "The payment status is unknown.",
          icon: <AlertCircle className="text-muted-foreground mr-2 size-5" />
        }
    }
  }

  const statusDetails = getStatusDetails()

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Payment Status</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={cn(
                      "size-4",
                      refreshing && "text-primary animate-spin"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh payment status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center">
            {statusDetails.icon}
            <span className="font-medium">{statusDetails.title}</span>
            <div className="ml-auto">
              <StatusBadge status={settlement.status} />
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            {statusDetails.description}
          </p>

          {settlement.paymentMethod && (
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="mr-2">
                {settlement.paymentMethod}
              </Badge>
              {settlement.paymentReference && (
                <span className="text-muted-foreground">
                  Ref: {settlement.paymentReference}
                </span>
              )}
            </div>
          )}

          {settlement.completedAt && (
            <div className="text-muted-foreground text-sm">
              Confirmed on{" "}
              {new Date(settlement.completedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {isPayer && settlement.status === "pending" && (
              <Button
                onClick={() =>
                  router.push(
                    `/events/${settlement.eventId}/settlements/${settlement.id}/pay`
                  )
                }
                className="flex-1"
              >
                Mark as Paid
              </Button>
            )}

            {isPayee && settlement.status === "requested" && (
              <div className="flex w-full gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() =>
                    router.push(
                      `/events/${settlement.eventId}/settlements/${settlement.id}/confirm`
                    )
                  }
                >
                  Confirm Payment
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() =>
                    router.push(
                      `/events/${settlement.eventId}/settlements/${settlement.id}/dispute`
                    )
                  }
                >
                  Dispute
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentStatusSkeleton() {
  return (
    <Card>
      <CardHeader className="bg-muted/50 pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center">
            <Skeleton className="mr-2 size-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <div className="ml-auto">
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center">
            <Skeleton className="mr-2 h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
