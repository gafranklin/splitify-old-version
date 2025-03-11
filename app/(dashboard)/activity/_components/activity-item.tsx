"use client"

import { ActivityWithRelatedData } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Trash,
  User,
  Users
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface ActivityItemProps {
  activity: ActivityWithRelatedData
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "event_created":
      case "event_updated":
        return <Calendar className="size-5 text-blue-500" />
      case "event_deleted":
        return <Trash className="size-5 text-red-500" />
      case "participant_added":
        return <User className="size-5 text-green-500" />
      case "participant_removed":
        return <User className="size-5 text-red-500" />
      case "expense_created":
      case "expense_updated":
        return <FileText className="size-5 text-purple-500" />
      case "expense_deleted":
        return <Trash className="size-5 text-red-500" />
      case "expense_split":
        return <Users className="size-5 text-indigo-500" />
      case "payment_requested":
        return <DollarSign className="size-5 text-amber-500" />
      case "payment_completed":
      case "payment_confirmed":
        return <CreditCard className="size-5 text-green-500" />
      case "payment_disputed":
        return <MessageSquare className="size-5 text-red-500" />
      case "payment_proof_uploaded":
        return <FileText className="size-5 text-blue-500" />
      case "settlement_created":
        return <PlusCircle className="size-5 text-green-500" />
      case "settlement_updated":
        return <RefreshCw className="size-5 text-blue-500" />
      default:
        return <Calendar className="size-5 text-gray-500" />
    }
  }

  const getActivityTitle = () => {
    switch (activity.type) {
      case "event_created":
        return `Created event "${activity.eventName}"`
      case "event_updated":
        return `Updated event "${activity.eventName}"`
      case "event_deleted":
        return `Deleted event "${activity.eventName}"`
      case "participant_added":
        return `Added participant to "${activity.eventName}"`
      case "participant_removed":
        return `Removed participant from "${activity.eventName}"`
      case "expense_created":
        return `Added expense "${activity.expenseName}" to "${activity.eventName}"`
      case "expense_updated":
        return `Updated expense "${activity.expenseName}" in "${activity.eventName}"`
      case "expense_deleted":
        return `Deleted expense "${activity.expenseName}" from "${activity.eventName}"`
      case "expense_split":
        return `Split expense "${activity.expenseName}" in "${activity.eventName}"`
      case "payment_requested":
        return activity.settlementDetails
          ? `Requested payment of ${formatCurrency(activity.settlementDetails.amount)} in "${activity.eventName}"`
          : `Requested payment in "${activity.eventName}"`
      case "payment_completed":
        return activity.settlementDetails
          ? `Completed payment of ${formatCurrency(activity.settlementDetails.amount)} in "${activity.eventName}"`
          : `Completed payment in "${activity.eventName}"`
      case "payment_confirmed":
        return activity.settlementDetails
          ? `Confirmed payment of ${formatCurrency(activity.settlementDetails.amount)} in "${activity.eventName}"`
          : `Confirmed payment in "${activity.eventName}"`
      case "payment_disputed":
        return activity.settlementDetails
          ? `Disputed payment of ${formatCurrency(activity.settlementDetails.amount)} in "${activity.eventName}"`
          : `Disputed payment in "${activity.eventName}"`
      case "payment_proof_uploaded":
        return activity.settlementDetails
          ? `Uploaded proof for payment of ${formatCurrency(activity.settlementDetails.amount)} in "${activity.eventName}"`
          : `Uploaded payment proof in "${activity.eventName}"`
      case "settlement_created":
        return `Created settlement in "${activity.eventName}"`
      case "settlement_updated":
        return `Updated settlement in "${activity.eventName}"`
      default:
        return "Unknown activity"
    }
  }

  const getActivityLink = () => {
    if (activity.eventId) {
      if (activity.type.startsWith("expense_") && activity.expenseId) {
        return `/events/${activity.eventId}/expenses/${activity.expenseId}`
      } else if (
        activity.type.startsWith("payment_") ||
        activity.type.startsWith("settlement_")
      ) {
        return `/events/${activity.eventId}/settlements`
      } else {
        return `/events/${activity.eventId}`
      }
    }
    return null
  }

  const activityLink = getActivityLink()

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">{getActivityIcon()}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {activityLink ? (
                  <Link href={activityLink} className="hover:underline">
                    {getActivityTitle()}
                  </Link>
                ) : (
                  getActivityTitle()
                )}
              </div>
              <Badge variant="outline" className="ml-2">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true
                })}
              </Badge>
            </div>
            {activity.metadata && (
              <p className="text-muted-foreground text-sm">
                {activity.metadata}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
