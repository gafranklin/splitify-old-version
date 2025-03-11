"use client"

import Link from "next/link"
import { LockIcon } from "lucide-react"

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
import { getPaymentFeatures } from "@/lib/premium-features"

interface PremiumUpgradeProps {
  title?: string
  description?: string
  className?: string
  showFeatureList?: boolean
}

export default function PremiumUpgrade({
  title = "Premium Feature",
  description = "This feature is only available to premium subscribers.",
  className,
  showFeatureList = true
}: PremiumUpgradeProps) {
  const paymentFeatures = getPaymentFeatures()

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 text-center">
        <div className="bg-primary/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
          <LockIcon className="text-primary size-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {showFeatureList && (
        <CardContent className="text-muted-foreground p-6 text-center text-sm">
          <p>
            Upgrade to our premium plan to unlock this feature and many more
            benefits, including:
          </p>
          <ul className="mt-4 space-y-2 text-left">
            {paymentFeatures.map(feature => (
              <li key={feature.id} className="flex items-center">
                <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                  ✓
                </span>
                {feature.title}
              </li>
            ))}
          </ul>
        </CardContent>
      )}

      <CardFooter className="bg-muted/50 flex justify-center px-6 py-4">
        <Button asChild>
          <Link href="/settings/subscription">Upgrade to Premium</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
