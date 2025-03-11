"use client"

import { useState } from "react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Bell, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  className?: string
}

export default function DashboardHeader({ className }: DashboardHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <header className={cn("bg-background border-b px-4 py-3", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="size-4" />
                <span className="sr-only">Create new</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/events/new">New Event</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/expenses/new">New Expense</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
