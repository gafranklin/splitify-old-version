/*
Premium features definition and descriptions.
This file is safe to import in client components as it contains only static data.
*/

import { PREMIUM_FEATURES } from "./subscription-client"

// Feature categories
export const FEATURE_CATEGORIES = {
  EVENTS: "Events",
  EXPENSES: "Expenses",
  PAYMENTS: "Payments",
  REPORTS: "Reports"
} as const

export type FeatureCategory = keyof typeof FEATURE_CATEGORIES

// Feature details with descriptions and categories
export interface FeatureDetails {
  id: string
  title: string
  description: string
  category: FeatureCategory
}

export const PREMIUM_FEATURE_DETAILS: Record<
  keyof typeof PREMIUM_FEATURES,
  FeatureDetails
> = {
  UNLIMITED_EVENTS: {
    id: PREMIUM_FEATURES.UNLIMITED_EVENTS,
    title: "Unlimited Events",
    description: "Create and manage as many events as you need",
    category: "EVENTS"
  },
  OCR_SCANNING: {
    id: PREMIUM_FEATURES.OCR_SCANNING,
    title: "Receipt Scanning",
    description: "Automatically extract information from receipts using OCR",
    category: "EXPENSES"
  },
  RIDESHARE_INTEGRATION: {
    id: PREMIUM_FEATURES.RIDESHARE_INTEGRATION,
    title: "Rideshare Integration",
    description: "Import expenses directly from rideshare services",
    category: "EXPENSES"
  },
  BULK_PAYMENT_REQUESTS: {
    id: PREMIUM_FEATURES.BULK_PAYMENT_REQUESTS,
    title: "Bulk Payment Requests",
    description: "Generate multiple payment requests at once",
    category: "PAYMENTS"
  },
  PAYMENT_REMINDERS: {
    id: PREMIUM_FEATURES.PAYMENT_REMINDERS,
    title: "Payment Reminders",
    description: "Schedule and send automatic payment reminders",
    category: "PAYMENTS"
  },
  PAYMENT_ANALYTICS: {
    id: PREMIUM_FEATURES.PAYMENT_ANALYTICS,
    title: "Payment Analytics",
    description: "View detailed analytics about payment history and trends",
    category: "PAYMENTS"
  },
  PAYMENT_PROOF_MANAGEMENT: {
    id: PREMIUM_FEATURES.PAYMENT_PROOF_MANAGEMENT,
    title: "Payment Proof Management",
    description: "Advanced tools for managing payment verification and proofs",
    category: "PAYMENTS"
  },
  PDF_REPORTS: {
    id: PREMIUM_FEATURES.PDF_REPORTS,
    title: "PDF Reports",
    description: "Generate and download detailed PDF settlement reports",
    category: "REPORTS"
  }
}

// Get features by category
export function getFeaturesByCategory(
  category: FeatureCategory
): FeatureDetails[] {
  return Object.values(PREMIUM_FEATURE_DETAILS).filter(
    feature => feature.category === category
  )
}

// Get all payment-related premium features
export function getPaymentFeatures(): FeatureDetails[] {
  return getFeaturesByCategory("PAYMENTS")
}

// Check if a feature is payment-related
export function isPaymentFeature(
  featureId: keyof typeof PREMIUM_FEATURES
): boolean {
  return PREMIUM_FEATURE_DETAILS[featureId].category === "PAYMENTS"
}
