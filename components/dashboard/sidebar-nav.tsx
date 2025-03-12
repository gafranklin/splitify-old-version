"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart,
  Calendar,
  CreditCard,
  Home,
  Settings,
  Users
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps {
  className?: string
  isCollapsed?: boolean
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export default function SidebarNav({
  className,
  isCollapsed = false
}: SidebarNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="size-4" />
    },
    {
      title: "Events",
      href: "/events",
      icon: <Calendar className="size-4" />
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <CreditCard className="size-4" />
    },
    {
      title: "Activity",
      href: "/activity",
      icon: <BarChart className="size-4" />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="size-4" />
    }
  ]

  return (
    <nav className={cn("flex flex-col gap-2 p-2", className)}>
      {navItems.map(item => {
        return (
          <Button
            key={item.href}
            asChild
            variant={pathname === item.href ? "default" : "ghost"}
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              pathname === item.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : "hover:bg-muted",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <Link href={item.href}>
              {item.icon}
              {!isCollapsed && <span className="ml-2">{item.title}</span>}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
