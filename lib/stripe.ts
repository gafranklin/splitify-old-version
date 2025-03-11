/*
Stripe client configuration.
*/

import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia", // Use the version compatible with the Stripe package
  appInfo: {
    name: "Splitify",
    version: "1.0.0"
  }
})

// Subscription price IDs
export const SUBSCRIPTION_PRICES = {
  MONTHLY: process.env.STRIPE_MONTHLY_PRICE_ID || "",
  YEARLY: process.env.STRIPE_YEARLY_PRICE_ID || ""
}

// Subscription status mapping
export const SUBSCRIPTION_STATUS = {
  active: "active",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  past_due: "past_due",
  trialing: "trialing",
  unpaid: "unpaid"
} as const

// Subscription types
export type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS

// Subscription interval
export type SubscriptionInterval = "month" | "year"

// Subscription plan
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  interval: SubscriptionInterval
  price: number
  currency: string
  features: string[]
}

// Available subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for personal use",
    interval: "month",
    price: 0,
    currency: "usd",
    features: [
      "Create up to 3 events",
      "Basic expense tracking",
      "Simple settlement suggestions",
      "Manual payment tracking"
    ]
  },
  {
    id: "pro-monthly",
    name: "Pro Monthly",
    description: "Advanced features for frequent travelers",
    interval: "month",
    price: 10,
    currency: "usd",
    features: [
      "Unlimited events",
      "Receipt scanning with OCR",
      "Rideshare integration",
      "Advanced payment tracking",
      "Bulk payment requests",
      "Payment reminders",
      "Payment analytics"
    ]
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    description: "Save 17% with annual billing",
    interval: "year",
    price: 100,
    currency: "usd",
    features: [
      "Unlimited events",
      "Receipt scanning with OCR",
      "Rideshare integration",
      "Advanced payment tracking",
      "Bulk payment requests",
      "Payment reminders",
      "Payment analytics",
      "Priority support"
    ]
  }
]
