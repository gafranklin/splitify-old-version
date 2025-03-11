"use client"

import { ReactNode } from "react"
import { LockIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

interface FeatureGuardProps {
  children: ReactNode
  isPremium: boolean
  hasAccess: boolean
  title?: string
  description?: string
  className?: string
}

export default function FeatureGuard({
  children,
  isPremium,
  hasAccess,
  title = "Premium Feature",
  description = "This feature is only available to premium subscribers.",
  className
}: FeatureGuardProps) {
  // If it's not a premium feature or the user has access, render the children
  if (!isPremium || hasAccess) {
    return <>{children}</>
  }

  // Otherwise, render the premium upgrade prompt
  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 text-center">
        <div className="bg-primary/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
          <LockIcon className="text-primary size-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground p-6 text-center text-sm">
        <p>
          Upgrade to our premium plan to unlock this feature and many more
          benefits, including:
        </p>
        <ul className="mt-4 space-y-2 text-left">
          <li className="flex items-center">
            <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
              ✓
            </span>
            Bulk payment request generation
          </li>
          <li className="flex items-center">
            <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
              ✓
            </span>
            Advanced payment proof management
          </li>
          <li className="flex items-center">
            <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
              ✓
            </span>
            Payment reminder automation
          </li>
          <li className="flex items-center">
            <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
              ✓
            </span>
            Payment history analytics
          </li>
          <li className="flex items-center">
            <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
              ✓
            </span>
            PDF settlement report generation
          </li>
        </ul>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-center px-6 py-4">
        <Button asChild>
          <Link href="/settings/subscription">Upgrade to Premium</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
