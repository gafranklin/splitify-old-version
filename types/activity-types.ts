import { SelectActivity } from "@/db/schema"

export interface ActivityWithRelatedData extends SelectActivity {
  eventName?: string
  expenseName?: string
  settlementDetails?: {
    fromUser: string
    toUser: string
    amount: number
  }
}

export interface ActivityFilters {
  type?: string[]
  eventId?: string
  date?: {
    from?: Date
    to?: Date
  }
}

export type GroupedActivities = {
  date: string
  activities: ActivityWithRelatedData[]
}
