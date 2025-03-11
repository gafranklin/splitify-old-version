"use server"

import { db } from "@/db/db"
import { auth } from "@clerk/nextjs/server"
import { 
  eventsTable, 
  InsertNotification, 
  notificationTable, 
  SelectNotification,
  settlementsTable
} from "@/db/schema"
import { ActionState, NotificationWithRelatedData } from "@/types"
import { and, desc, eq } from "drizzle-orm"

export async function createNotificationAction(
  notification: InsertNotification
): Promise<ActionState<SelectNotification>> {
  try {
    const [newNotification] = await db
      .insert(notificationTable)
      .values(notification)
      .returning()
      
    return {
      isSuccess: true,
      message: "Notification created successfully",
      data: newNotification
    }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { isSuccess: false, message: "Failed to create notification" }
  }
}

export async function getNotificationsAction(): Promise<ActionState<NotificationWithRelatedData[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    const notifications = await db
      .select()
      .from(notificationTable)
      .where(eq(notificationTable.userId, userId))
      .orderBy(desc(notificationTable.createdAt))
      .limit(50)
      
    const notificationsWithDetails: NotificationWithRelatedData[] = await Promise.all(
      notifications.map(async (notification) => {
        const result = { ...notification } as NotificationWithRelatedData
        
        // Get event name if available
        if (result.eventId) {
          const event = await db
            .select({ name: eventsTable.name })
            .from(eventsTable)
            .where(eq(eventsTable.id, result.eventId))
            .then(rows => rows[0])
            
          if (event) {
            result.eventName = event.name
          }
        }
        
        // Get settlement details if available
        if (result.settlementId) {
          const settlement = await db
            .select({
              fromParticipantId: settlementsTable.fromParticipantId,
              toParticipantId: settlementsTable.toParticipantId,
              amount: settlementsTable.amount
            })
            .from(settlementsTable)
            .where(eq(settlementsTable.id, result.settlementId))
            .then(rows => rows[0])
            
          if (settlement) {
            result.settlementDetails = {
              fromUser: settlement.fromParticipantId,
              toUser: settlement.toParticipantId,
              amount: Number(settlement.amount)
            }
          }
        }
        
        return result
      })
    )
    
    return {
      isSuccess: true,
      message: "Notifications retrieved successfully",
      data: notificationsWithDetails
    }
  } catch (error) {
    console.error("Error getting notifications:", error)
    return { isSuccess: false, message: "Failed to get notifications" }
  }
}

export async function markNotificationAsReadAction(
  id: string
): Promise<ActionState<SelectNotification>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    const [updatedNotification] = await db
      .update(notificationTable)
      .set({ read: true })
      .where(and(
        eq(notificationTable.id, id),
        eq(notificationTable.userId, userId)
      ))
      .returning()
      
    if (!updatedNotification) {
      return { isSuccess: false, message: "Notification not found" }
    }
    
    return {
      isSuccess: true,
      message: "Notification marked as read",
      data: updatedNotification
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { isSuccess: false, message: "Failed to mark notification as read" }
  }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    await db
      .update(notificationTable)
      .set({ read: true })
      .where(and(
        eq(notificationTable.userId, userId),
        eq(notificationTable.read, false)
      ))
      
    return {
      isSuccess: true,
      message: "All notifications marked as read",
      data: undefined
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { isSuccess: false, message: "Failed to mark all notifications as read" }
  }
}

export async function deleteNotificationAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    await db
      .delete(notificationTable)
      .where(and(
        eq(notificationTable.id, id),
        eq(notificationTable.userId, userId)
      ))
      
    return {
      isSuccess: true,
      message: "Notification deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { isSuccess: false, message: "Failed to delete notification" }
  }
}

export async function clearAllNotificationsAction(): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    await db
      .delete(notificationTable)
      .where(eq(notificationTable.userId, userId))
      
    return {
      isSuccess: true,
      message: "All notifications cleared",
      data: undefined
    }
  } catch (error) {
    console.error("Error clearing all notifications:", error)
    return { isSuccess: false, message: "Failed to clear all notifications" }
  }
} 