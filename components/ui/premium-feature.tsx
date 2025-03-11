"use client"

import { ReactNode, useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

import { hasFeatureAccess } from "@/lib/subscription"
import type { PremiumFeature } from "@/lib/subscription"
import { PREMIUM_FEATURE_DETAILS } from "@/lib/premium-features"
import PremiumUpgrade from "./premium-upgrade"

interface PremiumFeatureProps {
  children: ReactNode
  feature: PremiumFeature
  fallback?: ReactNode
  showUpgradeCard?: boolean
  className?: string
}

export default function PremiumFeature({
  children,
  feature,
  fallback,
  showUpgradeCard = true,
  className
}: PremiumFeatureProps) {
  const { user, isLoaded } = useUser()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (!isLoaded || !user) {
        setLoading(false)
        setHasAccess(false)
        return
      }

      try {
        const access = await hasFeatureAccess(user.id, feature)
        setHasAccess(access)
      } catch (error) {
        console.error("Error checking feature access:", error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, isLoaded, feature])

  // While loading, show a minimal loading state
  if (loading) {
    return <div className="bg-muted size-full animate-pulse rounded-md"></div>
  }

  // If the user has access, show the feature
  if (hasAccess) {
    return <>{children}</>
  }

  // If no access and we have a fallback, show it
  if (fallback) {
    return <>{fallback}</>
  }

  // Otherwise, show the upgrade prompt if enabled
  if (showUpgradeCard) {
    const featureDetails = PREMIUM_FEATURE_DETAILS[feature]

    return (
      <PremiumUpgrade
        title={featureDetails.title}
        description={featureDetails.description}
        className={className}
      />
    )
  }

  // If no fallback and no upgrade card, render nothing
  return null
}
