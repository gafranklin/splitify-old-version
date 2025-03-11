"use server"

import { auth } from "@clerk/nextjs/server"
import { ActionState } from "@/types"
import { db } from "@/db/db"
import { participantsTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { getConnectionAction } from "@/actions/db/connections-actions"

// Constants for Uber API
const UBER_API_URL = "https://api.uber.com/v2"

// Mock Uber ride data for demonstration purposes
// In a real implementation, this would come from the Uber API
interface UberRide {
  id: string
  startTime: string
  endTime: string
  startAddress: string
  endAddress: string
  fare: number
  distance: number
  duration: number
  status: string
}

/**
 * Gets the authorization URL for connecting to Uber
 */
export async function getUberAuthUrlAction(): Promise<ActionState<string>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // In a real implementation, this would use the Uber API SDK
    // to generate an OAuth authorization URL with correct scopes
    const clientId = process.env.UBER_CLIENT_ID
    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/uber/callback`)
    const scopes = "history"
    
    const authUrl = `https://auth.uber.com/oauth/v2/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUri}`
    
    return {
      isSuccess: true,
      message: "Auth URL generated successfully",
      data: authUrl
    }
  } catch (error) {
    console.error("Error getting Uber auth URL:", error)
    return { isSuccess: false, message: "Failed to generate Uber authorization URL" }
  }
}

/**
 * Exchanges an authorization code for an access token
 * This would typically be called by the OAuth callback API route
 */
export async function exchangeUberAuthCodeAction(
  code: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    // In a real implementation, this would:
    // 1. Make a request to Uber API to exchange code for access/refresh tokens
    // 2. Store the tokens securely for the user
    // 3. Set up webhooks for ride updates if needed
    
    // Since this is just a demo, we'll simply return success
    return {
      isSuccess: true,
      message: "Uber account connected successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error exchanging Uber auth code:", error)
    return { isSuccess: false, message: "Failed to connect Uber account" }
  }
}

/**
 * Gets recent Uber rides for a user
 */
export async function getUberRidesAction(
  eventId: string
): Promise<ActionState<UberRide[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify the user is a participant in the event
    const userParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.eventId, eventId),
        eq(participantsTable.userId, userId),
        eq(participantsTable.isActive, 'true')
      )
    })

    if (!userParticipant) {
      return { isSuccess: false, message: "Unauthorized: You are not a participant in this event" }
    }

    // In a real implementation, this would fetch real ride data from Uber API
    // For demo purposes, return mock data
    const mockRides: UberRide[] = [
      {
        id: "ride-123456",
        startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        endTime: new Date(Date.now() - 86340000).toISOString(), // Yesterday + 1 minute
        startAddress: "123 Main St, City",
        endAddress: "456 Market St, City",
        fare: 25.50,
        distance: 5.2,
        duration: 18,
        status: "completed"
      },
      {
        id: "ride-234567",
        startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        endTime: new Date(Date.now() - 172740000).toISOString(), // 2 days ago + 1 minute
        startAddress: "789 Park Ave, City",
        endAddress: "321 Lake St, City",
        fare: 18.75,
        distance: 3.8,
        duration: 12,
        status: "completed"
      },
      {
        id: "ride-345678",
        startTime: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        endTime: new Date(Date.now() - 259140000).toISOString(), // 3 days ago + 1 minute
        startAddress: "555 Ocean Dr, City",
        endAddress: "777 Mountain Rd, City",
        fare: 32.20,
        distance: 7.5,
        duration: 24,
        status: "completed"
      }
    ]
    
    return {
      isSuccess: true,
      message: "Rides retrieved successfully",
      data: mockRides
    }
  } catch (error) {
    console.error("Error getting Uber rides:", error)
    return { isSuccess: false, message: "Failed to retrieve Uber rides" }
  }
}

/**
 * Gets details of a specific Uber ride
 */
export async function getUberRideDetailsAction(
  rideId: string
): Promise<ActionState<UberRide>> {
  try {
    // Get the current user
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be logged in to access Uber ride details"
      }
    }
    
    // Get the user's Uber connection from the database
    const connectionResult = await getConnectionAction(userId, "uber")
    
    if (!connectionResult.isSuccess || !connectionResult.data) {
      return {
        isSuccess: false,
        message: "Uber connection not found. Please connect your Uber account first."
      }
    }
    
    const connection = connectionResult.data
    
    // Check if the token is expired
    if (connection.expiresAt && new Date() > connection.expiresAt) {
      return {
        isSuccess: false,
        message: "Uber connection expired, please reconnect"
      }
    }
    
    // Fetch the specific ride details
    const response = await fetch(`${UBER_API_URL}/trips/${rideId}`, {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Uber API error: ${errorData.message || response.statusText}`)
    }
    
    const trip = await response.json()
    
    // Transform the Uber API response into our UberRide format
    const ride: UberRide = {
      id: trip.uuid,
      startTime: trip.request_time,
      endTime: trip.dropoff ? trip.dropoff.time : null,
      startAddress: trip.pickup ? trip.pickup.address : "Unknown",
      endAddress: trip.dropoff ? trip.dropoff.address : "Unknown",
      fare: trip.fare ? trip.fare.value : 0,
      distance: trip.distance,
      duration: trip.duration,
      status: trip.status
    }
    
    return {
      isSuccess: true,
      message: "Successfully retrieved Uber ride details",
      data: ride
    }
  } catch (error) {
    console.error("Error fetching Uber ride details:", error)
    return {
      isSuccess: false,
      message: `Failed to fetch Uber ride details: ${(error as Error).message}`
    }
  }
}

// Check if a user has connected their Uber account
export async function checkUberConnectionAction(): Promise<ActionState<boolean>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // In a real implementation, this would check if the user has valid tokens
    // For demo purposes, return a fixed value
    const isConnected = false
    
    return {
      isSuccess: true,
      message: "Connection status checked successfully",
      data: isConnected
    }
  } catch (error) {
    console.error("Error checking Uber connection:", error)
    return { isSuccess: false, message: "Failed to check Uber connection status" }
  }
} 