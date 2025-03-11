"use client"

import React from "react"
import Link from "next/link"
import { ProfileWithPermissions } from "@/types"
import { MobileMenu } from "@/components/ui/mobile-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"

interface DashboardHeaderProps {
  profile: ProfileWithPermissions | null
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const { user } = useUser()

  return (
    <header className="bg-background sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 md:px-6">
      {/* Logo and mobile menu */}
      <div className="flex items-center gap-2">
        <MobileMenu />

        <Link href="/" className="flex items-center gap-2">
          <span className="hidden text-xl font-bold sm:inline-block">
            Splitify
          </span>
          <span className="text-xl font-bold sm:hidden">S</span>
        </Link>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/activity">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>

        {/* User profile */}
        <Link href="/profile" className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              src={user?.imageUrl || ""}
              alt={user?.fullName || "User"}
            />
            <AvatarFallback>
              {getInitials(user?.fullName || "User")}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline-block">
            {user?.fullName || "User"}
          </span>
        </Link>
      </div>
    </header>
  )
}
