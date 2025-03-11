/*
Contains server actions related to Stripe.
*/

"use server"

import {
  updateProfileAction,
  updateProfileByStripeCustomerIdAction
} from "@/actions/db/profiles-actions"
import { SelectProfile } from "@/db/schema"
import { stripe, SUBSCRIPTION_PRICES, SubscriptionStatus } from "@/lib/stripe"
import Stripe from "stripe"
import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { auth, currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

type MembershipStatus = SelectProfile["membership"]

const getMembershipStatus = (
  status: Stripe.Subscription.Status,
  membership: MembershipStatus
): MembershipStatus => {
  switch (status) {
    case "active":
    case "trialing":
      return membership
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      return "free"
    default:
      return "free"
  }
}

const getSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"]
  })
}

export const updateStripeCustomer = async (
  userId: string,
  subscriptionId: string,
  customerId: string
) => {
  try {
    if (!userId || !subscriptionId || !customerId) {
      throw new Error("Missing required parameters for updateStripeCustomer")
    }

    const subscription = await getSubscription(subscriptionId)

    const result = await updateProfileAction(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id
    })

    if (!result.isSuccess) {
      throw new Error("Failed to update customer profile")
    }

    return result.data
  } catch (error) {
    console.error("Error in updateStripeCustomer:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update Stripe customer")
  }
}

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
): Promise<MembershipStatus> => {
  try {
    if (!subscriptionId || !customerId || !productId) {
      throw new Error(
        "Missing required parameters for manageSubscriptionStatusChange"
      )
    }

    const subscription = await getSubscription(subscriptionId)
    const product = await stripe.products.retrieve(productId)
    const membership = product.metadata.membership as MembershipStatus

    if (!["free", "pro"].includes(membership)) {
      throw new Error(
        `Invalid membership type in product metadata: ${membership}`
      )
    }

    const membershipStatus = getMembershipStatus(
      subscription.status,
      membership
    )

    const updateResult = await updateProfileByStripeCustomerIdAction(
      customerId,
      { stripeSubscriptionId: subscription.id, membership: membershipStatus }
    )

    if (!updateResult.isSuccess) {
      throw new Error("Failed to update subscription status")
    }

    return membershipStatus
  } catch (error) {
    console.error("Error in manageSubscriptionStatusChange:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update subscription status")
  }
}

/**
 * Creates a Stripe Checkout session for subscription.
 */
export async function createCheckoutSessionAction(
  priceId: string,
  returnUrl: string
): Promise<ActionState<{ url: string }>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the user's profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!profile) {
      return { isSuccess: false, message: "Profile not found" }
    }

    // Get the user's email from Clerk
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress

    // Create a Stripe customer if one doesn't exist
    if (!profile.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId
        }
      })

      // Update the profile with the Stripe customer ID
      await db
        .update(profilesTable)
        .set({ stripeCustomerId: customer.id })
        .where(eq(profilesTable.userId, userId))
    }

    // Get the updated profile with Stripe customer ID
    const updatedProfile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!updatedProfile?.stripeCustomerId) {
      return { isSuccess: false, message: "Failed to create Stripe customer" }
    }

    // Create a Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: updatedProfile.stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId
      }
    })

    if (!session.url) {
      return { isSuccess: false, message: "Failed to create checkout session" }
    }

    return {
      isSuccess: true,
      message: "Checkout session created",
      data: { url: session.url }
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return { isSuccess: false, message: "Failed to create checkout session" }
  }
}

/**
 * Creates a Stripe Customer Portal session for managing subscription.
 */
export async function createPortalSessionAction(
  returnUrl: string
): Promise<ActionState<{ url: string }>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the user's profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!profile?.stripeCustomerId) {
      return { isSuccess: false, message: "No Stripe customer found" }
    }

    // Create a Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: returnUrl
    })

    return {
      isSuccess: true,
      message: "Portal session created",
      data: { url: session.url }
    }
  } catch (error) {
    console.error("Error creating portal session:", error)
    return { isSuccess: false, message: "Failed to create portal session" }
  }
}

/**
 * Gets the current subscription status for a user.
 */
export async function getSubscriptionStatusAction(): Promise<
  ActionState<{
    status: SubscriptionStatus | null
    interval: "month" | "year" | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
  }>
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Get the user's profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!profile?.stripeCustomerId || !profile.stripeSubscriptionId) {
      return {
        isSuccess: true,
        message: "No subscription found",
        data: {
          status: null,
          interval: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        }
      }
    }

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripeSubscriptionId
    )

    // Get the subscription interval
    const price = await stripe.prices.retrieve(
      subscription.items.data[0].price.id
    )
    const interval = price.recurring?.interval as "month" | "year" | null

    return {
      isSuccess: true,
      message: "Subscription retrieved",
      data: {
        status: subscription.status as SubscriptionStatus,
        interval,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    }
  } catch (error) {
    console.error("Error getting subscription status:", error)
    return { isSuccess: false, message: "Failed to get subscription status" }
  }
}

/**
 * Redirects to Stripe Checkout for subscription.
 */
export async function redirectToCheckoutAction(
  plan: "monthly" | "yearly",
  returnUrl: string
): Promise<void> {
  const priceId =
    plan === "monthly"
      ? SUBSCRIPTION_PRICES.MONTHLY
      : SUBSCRIPTION_PRICES.YEARLY

  const result = await createCheckoutSessionAction(priceId, returnUrl)

  if (result.isSuccess && result.data.url) {
    redirect(result.data.url)
  } else {
    // Redirect back to the return URL with an error
    redirect(`${returnUrl}?error=true`)
  }
}

/**
 * Redirects to Stripe Customer Portal for managing subscription.
 */
export async function redirectToPortalAction(returnUrl: string): Promise<void> {
  const result = await createPortalSessionAction(returnUrl)

  if (result.isSuccess && result.data.url) {
    redirect(result.data.url)
  } else {
    // Redirect back to the return URL with an error
    redirect(`${returnUrl}?error=true`)
  }
}
