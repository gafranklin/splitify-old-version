"use server"

import { db } from "@/db/db"
import { auth } from "@clerk/nextjs/server"
import { 
  activityTable, 
  activityTypeEnum, 
  eventsTable, 
  expensesTable, 
  InsertActivity, 
  SelectActivity, 
  settlementsTable 
} from "@/db/schema"
import { ActionState, ActivityFilters, ActivityWithRelatedData, GroupedActivities } from "@/types"
import { and, desc, eq, gte, lte, sql } from "drizzle-orm"

export async function createActivityAction(
  activity: InsertActivity
): Promise<ActionState<SelectActivity>> {
  try {
    const [newActivity] = await db.insert(activityTable).values(activity).returning()
    return {
      isSuccess: true,
      message: "Activity logged successfully",
      data: newActivity
    }
  } catch (error) {
    console.error("Error logging activity:", error)
    return { isSuccess: false, message: "Failed to log activity" }
  }
}

export async function getActivitiesAction(
  filters?: ActivityFilters
): Promise<ActionState<ActivityWithRelatedData[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // First, get all activities for this user
    const rawActivities = await db
      .select()
      .from(activityTable)
      .where(eq(activityTable.userId, userId))
      .orderBy(desc(activityTable.createdAt))
      .limit(100)

    // Filter activities by type if needed
    let filteredActivities = rawActivities
    if (filters?.type && filters.type.length > 0) {
      filteredActivities = rawActivities.filter(activity => 
        filters.type?.includes(activity.type as string)
      )
    }

    // Filter by event if needed
    if (filters?.eventId) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.eventId === filters.eventId
      )
    }

    // Filter by date if needed
    if (filters?.date) {
      if (filters.date.from) {
        const fromDate = filters.date.from
        filteredActivities = filteredActivities.filter(activity => 
          new Date(activity.createdAt) >= fromDate
        )
      }
      if (filters.date.to) {
        const toDate = filters.date.to
        filteredActivities = filteredActivities.filter(activity => 
          new Date(activity.createdAt) <= toDate
        )
      }
    }

    // Fetch related data for activities
    const activitiesWithDetails: ActivityWithRelatedData[] = await Promise.all(
      filteredActivities.map(async (activity) => {
        const result = { ...activity } as ActivityWithRelatedData
        
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
        
        // Get expense name if available
        if (result.expenseId) {
          const expense = await db
            .select({ title: expensesTable.title })
            .from(expensesTable)
            .where(eq(expensesTable.id, result.expenseId))
            .then(rows => rows[0])
            
          if (expense) {
            result.expenseName = expense.title
          }
        }
        
        // Get settlement details if this is a payment-related activity
        if (
          result.type.includes("payment_") && 
          result.settlementId
        ) {
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
      message: "Activities retrieved successfully",
      data: activitiesWithDetails
    }
  } catch (error) {
    console.error("Error getting activities:", error)
    return { isSuccess: false, message: "Failed to get activities" }
  }
}

export async function getGroupedActivitiesAction(
  filters?: ActivityFilters
): Promise<ActionState<GroupedActivities[]>> {
  try {
    const activitiesResult = await getActivitiesAction(filters)
    
    if (!activitiesResult.isSuccess) {
      return { isSuccess: false, message: activitiesResult.message }
    }
    
    const activities = activitiesResult.data
    
    // Group activities by date
    const groupedActivities: { [date: string]: ActivityWithRelatedData[] } = {}
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groupedActivities[date]) {
        groupedActivities[date] = []
      }
      
      groupedActivities[date].push(activity)
    })
    
    // Convert to array
    const result: GroupedActivities[] = Object.keys(groupedActivities).map(date => ({
      date,
      activities: groupedActivities[date]
    }))
    
    return {
      isSuccess: true,
      message: "Grouped activities retrieved successfully",
      data: result
    }
  } catch (error) {
    console.error("Error getting grouped activities:", error)
    return { isSuccess: false, message: "Failed to get grouped activities" }
  }
}

export async function deleteActivityAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    await db
      .delete(activityTable)
      .where(and(
        eq(activityTable.id, id),
        eq(activityTable.userId, userId)
      ))
    
    return {
      isSuccess: true,
      message: "Activity deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting activity:", error)
    return { isSuccess: false, message: "Failed to delete activity" }
  }
}

export async function clearActivitiesAction(
  filters?: ActivityFilters
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }
    
    // First get the IDs of activities to delete based on filters
    const activitiesResult = await getActivitiesAction(filters)
    
    if (!activitiesResult.isSuccess) {
      return { isSuccess: false, message: activitiesResult.message }
    }
    
    const activityIds = activitiesResult.data.map(activity => activity.id)
    
    if (activityIds.length === 0) {
      return {
        isSuccess: true,
        message: "No activities matched the filter criteria",
        data: undefined
      }
    }
    
    // Delete the activities
    await Promise.all(activityIds.map(id => deleteActivityAction(id)))
    
    return {
      isSuccess: true,
      message: "Activities cleared successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error clearing activities:", error)
    return { isSuccess: false, message: "Failed to clear activities" }
  }
} 