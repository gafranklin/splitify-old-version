/*
Contains the event-related types.
*/

import { SelectEvent } from "@/db/schema"
import { SelectParticipant } from "@/db/schema"

// Extended event type with additional information
export interface EventWithDetails extends SelectEvent {
  participantCount: number
  totalExpenses: number
  userRole?: string
}

// Event summary for dashboard display
export interface EventSummary {
  id: string
  name: string
  startDate?: Date
  endDate?: Date
  participantCount: number
  isActive: boolean
  userRole: string
}
