"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import Sidebar from "@/components/sidebar/sidebar"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar defaultCollapsed={false} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
