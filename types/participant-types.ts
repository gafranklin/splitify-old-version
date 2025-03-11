/*
Contains the participant-related types.
*/

import { SelectParticipant } from "@/db/schema"

// Extended participant type with additional information
export interface ParticipantWithDetails extends SelectParticipant {
  isCurrentUser: boolean
  totalPaid: number
  totalOwed: number
  balance: number
}

// Invitation data structure for inviting participants
export interface ParticipantInvitation {
  eventId: string
  email: string
  displayName?: string
  role?: string
}

// Participant summary for simple listings
export interface ParticipantSummary {
  id: string
  displayName: string | null
  userId: string
  role: string
  isCurrentUser: boolean
}
