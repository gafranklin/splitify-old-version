"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import SidebarNav from "@/components/dashboard/sidebar-nav"

interface SidebarProps {
  className?: string
  defaultCollapsed?: boolean
}

export default function Sidebar({
  className,
  defaultCollapsed = false
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold"
                >
                  <span className="text-lg">Splitify</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <SidebarNav />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "bg-background relative flex h-screen flex-col border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          isCollapsed && "justify-center"
        )}
      >
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Splitify</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8", !isCollapsed && "ml-auto")}
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
          <span className="sr-only">
            {isCollapsed ? "Expand" : "Collapse"} Sidebar
          </span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <SidebarNav isCollapsed={isCollapsed} />
      </ScrollArea>
    </div>
  )
}
