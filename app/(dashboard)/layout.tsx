"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

import Sidebar from "@/components/sidebar/sidebar"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import DashboardHeader from "./_components/dashboard-header"
import { ProfileWithPermissions } from "@/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { path?: string[] }
}

export default async function DashboardLayout({
  children,
  params
}: DashboardLayoutProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  // Get user profile
  const profileResponse = await getProfileByUserIdAction(userId)
  const profile = profileResponse.isSuccess ? profileResponse.data : null

  // Skip the redirect for the onboarding route itself to prevent infinite loops
  const currentPath = params.path?.[0] || ""
  const isOnboardingRoute = currentPath === "onboarding"

  // Redirect new users to onboarding, unless they're already there
  if (!profile && !isOnboardingRoute) {
    redirect("/onboarding")
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:shrink-0">
        <Sidebar defaultCollapsed={false} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <DashboardHeader profile={profile} />

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 pb-4 pt-2 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
