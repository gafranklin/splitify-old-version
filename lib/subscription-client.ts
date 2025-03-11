/*
Client-side subscription utility functions and constants.
This file is safe to import in client components.
*/

// Premium features constants - duplicated from server file to avoid importing server-only code
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
export const FREE_FEATURES: Record<PremiumFeature, boolean> = {
  ...FEATURE_ACCESS
  // No premium features in free tier
}

// Pro tier feature access
export const PRO_FEATURES: Record<PremiumFeature, boolean> = {
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
 * Client-side helper to check if a feature is available for a given membership level
 * Used for UI rendering only, actual feature access is always verified on the server
 *
 * @param membership The membership level ('free' or 'pro')
 * @param feature The premium feature to check access for
 * @returns Whether the feature is available for the given membership
 */
export function hasFeatureForMembership(
  membership: "free" | "pro",
  feature: PremiumFeature
): boolean {
  return membership === "pro" ? PRO_FEATURES[feature] : FREE_FEATURES[feature]
}

/**
 * Get maximum events allowed for a membership level
 *
 * @param membership The membership level ('free' or 'pro')
 * @returns The maximum number of events allowed
 */
export function getMaxEventsForMembership(membership: "free" | "pro"): number {
  return membership === "pro" ? Infinity : 3 // Free tier allows 3 events
}
