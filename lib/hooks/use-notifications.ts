"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  clearAllNotificationsAction,
  deleteNotificationAction,
  getNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction
} from "@/actions/db/notification-actions"
import { NotificationWithRelatedData } from "@/types"
import { useToast } from "@/lib/hooks/use-toast"

interface UseNotificationsOptions {
  pollingInterval?: number
  enabled?: boolean
}

export function useNotifications({
  pollingInterval = 30000, // 30 seconds
  enabled = true
}: UseNotificationsOptions = {}) {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<
    NotificationWithRelatedData[]
  >([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getNotificationsAction()

      if (result.isSuccess) {
        setNotifications(result.data)
        setUnreadCount(result.data.filter(n => !n.read).length)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }, [userId, enabled])

  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) return

      try {
        const result = await markNotificationAsReadAction(id)

        if (result.isSuccess) {
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === id
                ? { ...notification, read: true }
                : notification
            )
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      } catch (err) {
        console.error("Error marking notification as read:", err)
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive"
        })
      }
    },
    [userId, toast]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      const result = await markAllNotificationsAsReadAction()

      if (result.isSuccess) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        )
        setUnreadCount(0)
        toast({
          title: "Success",
          description: "All notifications marked as read"
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      })
    }
  }, [userId, toast])

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!userId) return

      try {
        const result = await deleteNotificationAction(id)

        if (result.isSuccess) {
          const removedNotification = notifications.find(n => n.id === id)
          setNotifications(prev => prev.filter(n => n.id !== id))

          if (removedNotification && !removedNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }

          toast({
            title: "Success",
            description: "Notification deleted"
          })
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      } catch (err) {
        console.error("Error deleting notification:", err)
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive"
        })
      }
    },
    [userId, notifications, toast]
  )

  const clearAll = useCallback(async () => {
    if (!userId) return

    try {
      const result = await clearAllNotificationsAction()

      if (result.isSuccess) {
        setNotifications([])
        setUnreadCount(0)
        toast({
          title: "Success",
          description: "All notifications cleared"
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error clearing notifications:", err)
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive"
      })
    }
  }, [userId, toast])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchNotifications()
    }
  }, [enabled, fetchNotifications])

  // Polling for new notifications
  useEffect(() => {
    if (!enabled || pollingInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchNotifications()
    }, pollingInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, pollingInterval, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
}
