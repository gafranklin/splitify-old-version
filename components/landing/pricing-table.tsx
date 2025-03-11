"use client"

import { Check } from "lucide-react"
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

interface PricingTier {
  name: string
  description: string
  price: {
    monthly: string
    yearly: string
  }
  features: string[]
  cta: string
  popular?: boolean
}

interface PricingTableProps {
  className?: string
}

export default function PricingTable({ className }: PricingTableProps) {
  const tiers: PricingTier[] = [
    {
      name: "Free",
      description: "Essential features for occasional expense sharing.",
      price: {
        monthly: "$0",
        yearly: "$0"
      },
      features: [
        "Unlimited events",
        "Basic expense tracking",
        "Simple expense splitting",
        "Manual payment tracking",
        "Basic receipt scanning",
        "Email support"
      ],
      cta: "Get Started"
    },
    {
      name: "Premium",
      description: "Advanced features for frequent expense sharing.",
      price: {
        monthly: "$10",
        yearly: "$100"
      },
      features: [
        "Everything in Free",
        "Bulk payment request generation",
        "Advanced payment proof management",
        "Payment reminder automation",
        "Payment history analytics",
        "PDF settlement report generation",
        "Rideshare expense integration",
        "Priority support"
      ],
      cta: "Upgrade Now",
      popular: true
    }
  ]

  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      {tiers.map(tier => (
        <Card
          key={tier.name}
          className={cn(
            "flex flex-col overflow-hidden",
            tier.popular && "border-primary shadow-md"
          )}
        >
          {tier.popular && (
            <div className="bg-primary text-primary-foreground px-4 py-1 text-center text-xs font-medium">
              Most Popular
            </div>
          )}
          <CardHeader className={tier.popular ? "" : "pt-8"}>
            <CardTitle className="text-2xl">{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <div className="mb-6">
              <span className="text-4xl font-bold">{tier.price.monthly}</span>
              <span className="text-muted-foreground">/month</span>
              <p className="text-muted-foreground mt-1 text-sm">
                or {tier.price.yearly}/year (save 16%)
              </p>
            </div>
            <ul className="space-y-2">
              {tier.features.map(feature => (
                <li key={feature} className="flex items-center">
                  <Check className="text-primary mr-2 size-4" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-4">
            <Button
              asChild
              className={cn(
                "w-full",
                tier.popular ? "" : "bg-muted-foreground"
              )}
            >
              <Link
                href={
                  tier.name === "Free" ? "/signup" : "/settings/subscription"
                }
              >
                {tier.cta}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
