"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getCurrentProfileAction } from "@/actions/db/profiles-actions"
import SubscriptionManagement from "./_components/subscription-management"
import { Skeleton } from "@/components/ui/skeleton"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and subscription
        </p>
      </div>

      <div className="space-y-8">
        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionSection />
        </Suspense>
      </div>
    </div>
  )
}

async function SubscriptionSection() {
  const profileResponse = await getCurrentProfileAction()
  const profile = profileResponse.isSuccess ? profileResponse.data : null

  return <SubscriptionManagement profile={profile} />
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
