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
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Logo and mobile menu */}
      <div className="flex items-center gap-2">
        <MobileMenu />
        
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl hidden sm:inline-block">Splitify</span>
          <span className="font-bold text-xl sm:hidden">S</span>
        </Link>
      </div>
      
      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/activity">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
        
        {/* User profile */}
        <Link href="/profile" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.imageUrl || ""} 
              alt={user?.fullName || "User"} 
            />
            <AvatarFallback>
              {getInitials(user?.fullName || "User")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline-block">
            {user?.fullName || "User"}
          </span>
        </Link>
      </div>
    </header>
  )
}
