import { SelectNotification } from "@/db/schema"

export interface NotificationWithRelatedData extends SelectNotification {
  eventName?: string
  settlementDetails?: {
    fromUser: string
    toUser: string
    amount: number
  }
}

export interface NotificationSettings {
  paymentRequests: boolean
  paymentReminders: boolean
  paymentConfirmations: boolean
  eventInvitations: boolean
  expenseUpdates: boolean
  email: boolean
  push: boolean
}
