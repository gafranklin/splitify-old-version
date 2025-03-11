"use server"

import { db } from "@/db/db"
import { 
  InsertParticipant, 
  SelectParticipant, 
  participantsTable, 
  participantRoleEnum 
} from "@/db/schema"
import { expensesTable } from "@/db/schema"
import { ActionState, ParticipantWithDetails, ParticipantSummary, ParticipantInvitation } from "@/types"
import { eq, and, sum, count, sql } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// Add participant to an event
export async function addParticipantAction(
  participant: InsertParticipant
): Promise<ActionState<SelectParticipant>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user adding the participant is an organizer
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, participant.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.role, 'organizer'),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: Only organizers can add participants" }
    }

    // Check if participant already exists
    const existingParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, participant.eventId),
        eq(participantsTable.userId, participant.userId)
      )
    })

    if (existingParticipant) {
      // If participant exists but is inactive, reactivate them
      if (existingParticipant.isActive === 'false') {
        const [updatedParticipant] = await db
          .update(participantsTable)
          .set({ 
            isActive: 'true',
            role: participant.role,
            displayName: participant.displayName
          })
          .where(eq(participantsTable.id, existingParticipant.id))
          .returning()

        return {
          isSuccess: true,
          message: "Participant reactivated successfully",
          data: updatedParticipant
        }
      }
      
      return { 
        isSuccess: false, 
        message: "This user is already a participant in the event" 
      }
    }

    // Add the participant
    const [newParticipant] = await db.insert(participantsTable).values(participant).returning()
    
    return {
      isSuccess: true,
      message: "Participant added successfully",
      data: newParticipant
    }
  } catch (error) {
    console.error("Error adding participant:", error)
    return { isSuccess: false, message: "Failed to add participant" }
  }
}

// Invite participant to an event
export async function inviteParticipantAction(
  invitation: ParticipantInvitation
): Promise<ActionState<SelectParticipant>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the user inviting is an organizer
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, invitation.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.role, 'organizer'),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: Only organizers can invite participants" }
    }

    // Check if email is already invited
    const existingInvite = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, invitation.eventId),
        eq(participantsTable.email, invitation.email)
      )
    })

    if (existingInvite) {
      return { isSuccess: false, message: "This email has already been invited" }
    }

    // Create a participant record with email and no userId (will be filled when they join)
    const [newInvite] = await db.insert(participantsTable).values({
      eventId: invitation.eventId,
      email: invitation.email,
      displayName: invitation.displayName || null,
      role: (invitation.role as any) || 'member',
      userId: '', // Placeholder until the user registers/accepts
      isActive: 'false' // Inactive until they accept
    }).returning()
    
    // Note: In a real implementation, you would send an email invitation here
    
    return {
      isSuccess: true,
      message: "Invitation sent successfully",
      data: newInvite
    }
  } catch (error) {
    console.error("Error inviting participant:", error)
    return { isSuccess: false, message: "Failed to send invitation" }
  }
}

// Get participants for an event
export async function getEventParticipantsAction(
  eventId: string
): Promise<ActionState<SelectParticipant[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the current user is a participant in the event
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Get all active participants for the event
    const participants = await db.query.participants.findMany({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.isActive, 'true')
      )
    })

    // Return the full participant objects
    return {
      isSuccess: true,
      message: "Participants retrieved successfully",
      data: participants
    }
  } catch (error) {
    console.error("Error getting event participants:", error)
    return { isSuccess: false, message: "Failed to get participants" }
  }
}

// Additionally, add a function to get participant summaries when needed
export async function getEventParticipantSummariesAction(
  eventId: string
): Promise<ActionState<ParticipantSummary[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if the current user is a participant in the event
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Get all active participants for the event
    const participants = await db.query.participants.findMany({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.isActive, 'true')
      )
    })

    // Transform to participant summaries
    const participantSummaries: ParticipantSummary[] = participants.map(participant => ({
      id: participant.id,
      displayName: participant.displayName,
      userId: participant.userId,
      role: participant.role,
      isCurrentUser: participant.userId === userId
    }))

    return {
      isSuccess: true,
      message: "Participant summaries retrieved successfully",
      data: participantSummaries
    }
  } catch (error) {
    console.error("Error getting event participant summaries:", error)
    return { isSuccess: false, message: "Failed to get participant summaries" }
  }
}

// Get participant details including balance information
export async function getParticipantDetailsAction(
  participantId: string
): Promise<ActionState<ParticipantWithDetails>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the participant
    const participant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, participantId)
    })

    if (!participant) {
      return { isSuccess: false, message: "Participant not found" }
    }

    // Check if the requesting user is a participant in the same event
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, participant.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // Get total paid by this participant
    const totalPaidResult = await db
      .select({ total: sum(expensesTable.amount) })
      .from(expensesTable)
      .where(eq(expensesTable.payerId, participantId))
      .execute()

    const totalPaid = Number(totalPaidResult[0]?.total) || 0

    // In a real implementation, you would calculate totalOwed based on the
    // expense allocations. This is a placeholder.
    const totalOwed = 0 // Placeholder

    // Calculate balance (paid - owed)
    const balance = totalPaid - totalOwed

    const participantWithDetails: ParticipantWithDetails = {
      ...participant,
      isCurrentUser: participant.userId === userId,
      totalPaid,
      totalOwed,
      balance
    }

    return {
      isSuccess: true,
      message: "Participant details retrieved successfully",
      data: participantWithDetails
    }
  } catch (error) {
    console.error("Error getting participant details:", error)
    return { isSuccess: false, message: "Failed to get participant details" }
  }
}

// Update a participant
export async function updateParticipantAction(
  participantId: string,
  data: Partial<InsertParticipant>
): Promise<ActionState<SelectParticipant>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the participant
    const participant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, participantId)
    })

    if (!participant) {
      return { isSuccess: false, message: "Participant not found" }
    }

    // Check if the user is an organizer or the participant themself
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, participant.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    const isOrganizer = currentUserParticipant.role === 'organizer'
    const isSelf = participant.userId === userId

    if (!isOrganizer && !isSelf) {
      return { isSuccess: false, message: "Unauthorized: You can only update your own participant record" }
    }

    // If they're trying to change the role, only organizers can do that
    if (data.role && !isOrganizer) {
      return { isSuccess: false, message: "Unauthorized: Only organizers can change roles" }
    }

    // Update the participant
    const [updatedParticipant] = await db
      .update(participantsTable)
      .set(data)
      .where(eq(participantsTable.id, participantId))
      .returning()

    return {
      isSuccess: true,
      message: "Participant updated successfully",
      data: updatedParticipant
    }
  } catch (error) {
    console.error("Error updating participant:", error)
    return { isSuccess: false, message: "Failed to update participant" }
  }
}

// Remove a participant (soft delete by setting isActive to false)
export async function removeParticipantAction(
  participantId: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the participant
    const participant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, participantId)
    })

    if (!participant) {
      return { isSuccess: false, message: "Participant not found" }
    }

    // Check if the user is an organizer or the participant themself
    const currentUserParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, participant.eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!currentUserParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    const isOrganizer = currentUserParticipant.role === 'organizer'
    const isSelf = participant.userId === userId

    // Only allow organizers to remove others, but anyone can remove themselves
    if (!isOrganizer && !isSelf) {
      return { isSuccess: false, message: "Unauthorized: You can only remove yourself" }
    }

    // Don't allow the last organizer to be removed
    if (participant.role === 'organizer') {
      const organizerCount = await db
        .select({ count: count() })
        .from(participantsTable)
        .where(and(
          eq(participantsTable.eventId, participant.eventId),
          eq(participantsTable.role, 'organizer'),
          eq(participantsTable.isActive, 'true')
        ))
        .execute()

      if (organizerCount[0]?.count === 1) {
        return { isSuccess: false, message: "Cannot remove the last organizer from the event" }
      }
    }

    // Soft delete by setting isActive to false
    await db
      .update(participantsTable)
      .set({ isActive: 'false' })
      .where(eq(participantsTable.id, participantId))

    return {
      isSuccess: true,
      message: "Participant removed successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error removing participant:", error)
    return { isSuccess: false, message: "Failed to remove participant" }
  }
} 