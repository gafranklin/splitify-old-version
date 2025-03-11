"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import Sidebar from "@/components/sidebar/sidebar"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import DashboardHeader from "./_components/dashboard-header"
import { ProfileWithPermissions } from "@/types"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  // Get user profile
  const profileResponse = await getProfileByUserIdAction(userId)
  const profile = profileResponse.isSuccess ? profileResponse.data : null

  return (
    <div className="flex flex-col h-screen overflow-hidden lg:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:flex-shrink-0">
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
