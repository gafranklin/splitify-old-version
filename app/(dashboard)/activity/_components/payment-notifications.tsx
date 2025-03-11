"use client"

import { useNotifications } from "@/lib/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Bell,
  BellOff,
  Check,
  CreditCard,
  DollarSign,
  ExternalLink,
  Trash2
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function PaymentNotifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications()

  // Filter payment-related notifications
  const paymentNotifications = notifications.filter(notification =>
    notification.type.startsWith("payment_")
  )

  const unreadPaymentNotifications = paymentNotifications.filter(
    notification => !notification.read
  )

  const readPaymentNotifications = paymentNotifications.filter(
    notification => notification.read
  )

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={refresh}>
          Try Again
        </Button>
      </div>
    )
  }

  if (paymentNotifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Payment Notifications</CardTitle>
          <CardDescription>
            You don't have any payment notifications. When you receive payment
            requests or updates, they will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Payment Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-6 px-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="mr-2 size-4" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadPaymentNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadPaymentNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-4 space-y-4">
          {unreadPaymentNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex h-24 items-center justify-center">
                <p className="text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          ) : (
            unreadPaymentNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          {paymentNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}

          {paymentNotifications.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="mr-2 size-4" />
                Clear All Notifications
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete
}: {
  notification: any
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "payment_request":
        return <DollarSign className="size-5 text-amber-500" />
      case "payment_reminder":
        return <Bell className="size-5 text-amber-500" />
      case "payment_received":
      case "payment_confirmed":
        return <CreditCard className="size-5 text-green-500" />
      case "payment_disputed":
        return <BellOff className="size-5 text-red-500" />
      default:
        return <Bell className="text-muted-foreground size-5" />
    }
  }

  const getActionUrl = () => {
    if (notification.actionUrl) {
      return notification.actionUrl
    }

    if (notification.eventId && notification.settlementId) {
      return `/events/${notification.eventId}/settlements?id=${notification.settlementId}`
    }

    if (notification.eventId) {
      return `/events/${notification.eventId}/settlements`
    }

    return null
  }

  const actionUrl = getActionUrl()

  return (
    <Card className={notification.read ? "bg-muted/30" : "border-primary/50"}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getNotificationIcon()}
            <CardTitle className="text-base">{notification.title}</CardTitle>
          </div>
          <Badge variant="outline">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true
            })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-foreground text-sm">
          {notification.message}
        </CardDescription>

        {notification.settlementDetails && (
          <div className="bg-muted mt-2 rounded-md p-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Amount:</span>
              <span className="font-medium">
                {formatCurrency(notification.settlementDetails.amount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex gap-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="mr-2 size-4" />
              Mark as Read
            </Button>
          )}
          {actionUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link href={actionUrl}>
                <ExternalLink className="mr-2 size-4" />
                View Details
              </Link>
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
