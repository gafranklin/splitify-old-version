"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { getGroupedActivitiesAction } from "@/actions/db/activity-actions"
import {
  ActivityFilters,
  ActivityWithRelatedData,
  GroupedActivities
} from "@/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/lib/hooks/use-toast"
import ActivityItem from "./activity-item"

interface ActivityListProps {
  filters?: ActivityFilters
}

export default function ActivityList({ filters }: ActivityListProps) {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [groupedActivities, setGroupedActivities] = useState<
    GroupedActivities[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getGroupedActivitiesAction(filters)

      if (result.isSuccess) {
        setGroupedActivities(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError("Failed to load activities")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [userId, filters])

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
        <Button variant="outline" onClick={fetchActivities}>
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (groupedActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Activity</CardTitle>
          <CardDescription>
            There is no activity to display. Activities will appear here as you
            use the app.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Activity History</h2>
        <Button variant="outline" size="sm" onClick={fetchActivities}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {groupedActivities.map(group => (
        <div key={group.date} className="space-y-4">
          <h3 className="bg-background text-muted-foreground sticky top-0 py-2 text-sm font-medium">
            {group.date}
          </h3>
          <div className="space-y-2">
            {group.activities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
