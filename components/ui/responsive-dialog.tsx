"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMobile } from "@/lib/hooks/use-mobile"

interface ResponsiveDialogProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode
  contentClassName?: string
  withCloseButton?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * ResponsiveDialog component that renders as a Dialog on desktop and a Sheet on mobile
 */
export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  footer,
  contentClassName = "",
  withCloseButton = false,
  open,
  onOpenChange
}: ResponsiveDialogProps) {
  const { isMobile } = useMobile()
  const [internalOpen, setInternalOpen] = useState(false)

  // Sync internal state with controlled state if provided
  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  // Use internal state if not controlled externally
  const isOpen = open !== undefined ? open : internalOpen

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side="bottom"
          className={`max-h-[90vh] overflow-y-auto ${contentClassName}`}
        >
          {withCloseButton && (
            <div className="absolute right-4 top-4">
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>
            </div>
          )}

          {title && (
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
              )}
            </SheetHeader>
          )}

          <div className="py-4">{children}</div>

          {footer && (
            <SheetFooter className="sm:justify-end">{footer}</SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto ${contentClassName}`}
      >
        {withCloseButton && (
          <div className="absolute right-4 top-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        )}

        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </DialogHeader>
        )}

        <div className="py-4">{children}</div>

        {footer && (
          <DialogFooter className="sm:justify-end">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
