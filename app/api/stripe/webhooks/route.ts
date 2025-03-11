/*
This API route handles Stripe webhook events to manage subscription status changes and updates user profiles accordingly.
*/

"use server"

import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { stripe } from "@/lib/stripe"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET")
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Get the customer ID and subscription ID
        const { customer, subscription } = session

        if (customer && subscription) {
          // Get the user ID from the metadata
          const userId = session.metadata?.userId

          if (userId) {
            // Update the user's profile with the subscription information
            await db
              .update(profilesTable)
              .set({
                stripeCustomerId: customer as string,
                stripeSubscriptionId: subscription as string,
                membership: "pro"
              })
              .where(eq(profilesTable.userId, userId))
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Get the customer ID
        const { customer } = subscription

        // Find the user with this customer ID
        const profile = await db.query.profiles.findFirst({
          where: eq(profilesTable.stripeCustomerId, customer as string)
        })

        if (profile) {
          // Update the subscription status based on the subscription status
          const status = subscription.status
          const membership = status === "active" ? "pro" : "free"

          await db
            .update(profilesTable)
            .set({
              stripeSubscriptionId: subscription.id,
              membership
            })
            .where(eq(profilesTable.userId, profile.userId))
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Get the customer ID
        const { customer } = subscription

        // Find the user with this customer ID
        const profile = await db.query.profiles.findFirst({
          where: eq(profilesTable.stripeCustomerId, customer as string)
        })

        if (profile) {
          // Update the user's membership to free
          await db
            .update(profilesTable)
            .set({
              stripeSubscriptionId: null,
              membership: "free"
            })
            .where(eq(profilesTable.userId, profile.userId))
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return new NextResponse("Error handling webhook", { status: 500 })
  }
}
