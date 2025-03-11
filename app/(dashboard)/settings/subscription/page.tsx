"use server"

import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

import {
  SubscriptionStatus,
  SubscriptionBillingHistory,
  SubscriptionPaymentMethod
} from "./_components/subscription-status"
import { getSubscriptionStatusAction } from "@/actions/stripe-actions"

export default async function SubscriptionPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profilesTable.userId, user.id)
  })

  if (!profile) {
    redirect("/")
  }

  // Get subscription status
  const subscriptionResult = await getSubscriptionStatusAction()
  const subscription = subscriptionResult.isSuccess
    ? subscriptionResult.data
    : null

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment details
        </p>
      </div>

      <div className="grid gap-8">
        <SubscriptionStatus profile={profile} subscription={subscription} />

        {profile.stripeCustomerId && subscription?.status === "active" && (
          <>
            <SubscriptionPaymentMethod customerId={profile.stripeCustomerId} />
            <SubscriptionBillingHistory customerId={profile.stripeCustomerId} />
          </>
        )}
      </div>
    </div>
  )
}
