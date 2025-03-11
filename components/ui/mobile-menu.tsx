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
    { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Events", href: "/events", icon: <Calendar className="h-5 w-5" /> },
    { name: "Expenses", href: "/expenses", icon: <BarChart className="h-5 w-5" /> },
    { name: "Payments", href: "/settlements", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Participants", href: "/participants", icon: <Users className="h-5 w-5" /> },
    { name: "Activity", href: "/activity", icon: <Bell className="h-5 w-5" /> },
    { name: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
    { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className={`block lg:hidden ${className}`}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Splitify</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                          ${isActive 
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
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 