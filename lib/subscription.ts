/*
Subscription utility functions.
*/

import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { SubscriptionStatus } from "./stripe"

// Premium features
export const PREMIUM_FEATURES = {
  UNLIMITED_EVENTS: "UNLIMITED_EVENTS",
  OCR_SCANNING: "OCR_SCANNING",
  RIDESHARE_INTEGRATION: "RIDESHARE_INTEGRATION",
  BULK_PAYMENT_REQUESTS: "BULK_PAYMENT_REQUESTS",
  PAYMENT_REMINDERS: "PAYMENT_REMINDERS",
  PAYMENT_ANALYTICS: "PAYMENT_ANALYTICS",
  PAYMENT_PROOF_MANAGEMENT: "PAYMENT_PROOF_MANAGEMENT",
  PDF_REPORTS: "PDF_REPORTS"
} as const

export type PremiumFeature = keyof typeof PREMIUM_FEATURES

// Feature access map
const FEATURE_ACCESS: Record<PremiumFeature, boolean> = {
  UNLIMITED_EVENTS: false,
  OCR_SCANNING: false,
  RIDESHARE_INTEGRATION: false,
  BULK_PAYMENT_REQUESTS: false,
  PAYMENT_REMINDERS: false,
  PAYMENT_ANALYTICS: false,
  PAYMENT_PROOF_MANAGEMENT: false,
  PDF_REPORTS: false
}

// Free tier feature access
const FREE_FEATURES: Record<PremiumFeature, boolean> = {
  ...FEATURE_ACCESS
  // No premium features in free tier
}

// Pro tier feature access
const PRO_FEATURES: Record<PremiumFeature, boolean> = {
  ...FEATURE_ACCESS,
  UNLIMITED_EVENTS: true,
  OCR_SCANNING: true,
  RIDESHARE_INTEGRATION: true,
  BULK_PAYMENT_REQUESTS: true,
  PAYMENT_REMINDERS: true,
  PAYMENT_ANALYTICS: true,
  PAYMENT_PROOF_MANAGEMENT: true,
  PDF_REPORTS: true
}

/**
 * Checks if a user has access to a premium feature.
 *
 * @param userId The user ID to check
 * @param feature The premium feature to check access for
 * @returns Whether the user has access to the feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: PremiumFeature
): Promise<boolean> {
  try {
    // Get the user's profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!profile) {
      return false
    }

    // Check if the user has a pro membership
    const isPro = profile.membership === "pro"

    // Return feature access based on membership
    return isPro ? PRO_FEATURES[feature] : FREE_FEATURES[feature]
  } catch (error) {
    console.error("Error checking feature access:", error)
    return false
  }
}

/**
 * Checks if a user has a pro subscription.
 *
 * @param userId The user ID to check
 * @returns Whether the user has a pro subscription
 */
export async function hasProSubscription(userId: string): Promise<boolean> {
  try {
    // Get the user's profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!profile) {
      return false
    }

    // Check if the user has a pro membership
    return profile.membership === "pro"
  } catch (error) {
    console.error("Error checking pro subscription:", error)
    return false
  }
}

/**
 * Gets the number of events a user can create based on their subscription.
 *
 * @param userId The user ID to check
 * @returns The maximum number of events the user can create
 */
export async function getMaxEvents(userId: string): Promise<number> {
  const hasUnlimitedEvents = await hasFeatureAccess(
    userId,
    "UNLIMITED_EVENTS" as PremiumFeature
  )

  return hasUnlimitedEvents ? Infinity : 3 // Free tier allows 3 events
}

/**
 * Checks if a user can create a new event based on their subscription and current event count.
 *
 * @param userId The user ID to check
 * @param currentEventCount The user's current event count
 * @returns Whether the user can create a new event
 */
export async function canCreateEvent(
  userId: string,
  currentEventCount: number
): Promise<boolean> {
  const maxEvents = await getMaxEvents(userId)
  return currentEventCount < maxEvents
}
