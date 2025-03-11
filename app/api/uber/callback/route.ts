"use server"

import { NextRequest, NextResponse } from "next/server"
import { exchangeUberAuthCodeAction } from "@/actions/uber-actions"
import { upsertConnectionAction } from "@/actions/db/connections-actions"
import { convertToDbConnection } from "@/lib/utils/connection-utils"
import { RideshareApiConnection } from "@/types"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle errors from Uber
    if (error) {
      console.error("Uber OAuth error:", error)
      return NextResponse.redirect(
        new URL("/dashboard?error=uber_auth_failed", request.url)
      )
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing required OAuth parameters")
      return NextResponse.redirect(
        new URL("/dashboard?error=missing_params", request.url)
      )
    }

    // Decode state parameter to get user ID
    const decodedState = JSON.parse(Buffer.from(state, "base64").toString())
    const userId = decodedState.userId

    if (!userId) {
      console.error("Invalid state parameter")
      return NextResponse.redirect(
        new URL("/dashboard?error=invalid_state", request.url)
      )
    }

    // Exchange the authorization code for access token
    const { isSuccess, message } = await exchangeUberAuthCodeAction(
      code,
      userId
    )

    if (!isSuccess) {
      console.error("Failed to exchange Uber code:", message)
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=token_exchange_failed&message=${encodeURIComponent(message)}`,
          request.url
        )
      )
    }

    // Create a mock connection object for demo purposes
    // In a real implementation, the exchangeUberAuthCodeAction would return the actual connection
    const connection: RideshareApiConnection = {
      provider: "uber",
      userId,
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    }

    // Store connection in database
    const dbConnection = convertToDbConnection(connection)
    const saveResult = await upsertConnectionAction(dbConnection)

    if (!saveResult.isSuccess) {
      console.error("Failed to save connection:", saveResult.message)
      return NextResponse.redirect(
        new URL(`/dashboard?error=connection_save_failed`, request.url)
      )
    }

    // Create a success URL with connection info
    const successUrl = new URL(
      "/dashboard/rideshares?connected=true",
      request.url
    )

    // Redirect to the dashboard with success message
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error("Error in Uber OAuth callback:", error)
    return NextResponse.redirect(
      new URL("/dashboard?error=internal_error", request.url)
    )
  }
}
