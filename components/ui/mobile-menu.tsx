"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Home,
  Calendar,
  BarChart,
  Settings,
  CreditCard,
  Users,
  Bell,
  User,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useClerk } from "@clerk/nextjs"
import { useMobile } from "@/lib/hooks/use-mobile"

interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
}

interface MobileMenuProps {
  className?: string
}

export function MobileMenu({ className = "" }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { isMobile } = useMobile()
  const { signOut } = useClerk()

  // Close menu on navigation or when screen size changes to desktop
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Don't render if not on mobile
  if (!isMobile) {
    return null
  }

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/", icon: <Home className="size-5" /> },
    { name: "Events", href: "/events", icon: <Calendar className="size-5" /> },
    {
      name: "Expenses",
      href: "/expenses",
      icon: <BarChart className="size-5" />
    },
    {
      name: "Payments",
      href: "/settlements",
      icon: <CreditCard className="size-5" />
    },
    {
      name: "Participants",
      href: "/participants",
      icon: <Users className="size-5" />
    },
    { name: "Activity", href: "/activity", icon: <Bell className="size-5" /> },
    { name: "Profile", href: "/profile", icon: <User className="size-5" /> },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="size-5" />
    }
  ]

  return (
    <div className={`block lg:hidden ${className}`}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Splitify</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {menuItems.map(item => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                          ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t p-4">
              <Button
                variant="outline"
                className="flex w-full items-center justify-start gap-2"
                onClick={() => signOut()}
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
