"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SelectProfile } from "@/db/schema"
import { SubscriptionStatus as SubscriptionStatusType } from "@/lib/stripe"
import {
  redirectToCheckoutAction,
  redirectToPortalAction
} from "@/actions/stripe-actions"
import { toast } from "sonner"
import {
  Loader2,
  CheckCircle,
  CreditCard,
  Receipt,
  Clock,
  AlertCircle
} from "lucide-react"
import { PREMIUM_FEATURES } from "@/lib/subscription"
import { getPaymentFeatures } from "@/lib/premium-features"

interface SubscriptionInfo {
  status: SubscriptionStatusType | null
  interval: "month" | "year" | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

interface SubscriptionStatusProps {
  profile: SelectProfile
  subscription: SubscriptionInfo | null
}

export function SubscriptionStatus({
  profile,
  subscription
}: SubscriptionStatusProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly")

  const isPro = profile?.membership === "pro"
  const paymentFeatures = getPaymentFeatures()

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setIsLoading(true)

    try {
      await redirectToCheckoutAction(plan, window.location.href)
    } catch (error) {
      console.error("Error subscribing:", error)
      toast.error("Failed to start subscription process")
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!profile?.stripeCustomerId) return

    setIsLoading(true)

    try {
      await redirectToPortalAction(window.location.href)
    } catch (error) {
      console.error("Error managing subscription:", error)
      toast.error("Failed to open subscription management")
      setIsLoading(false)
    }
  }

  if (isPro) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="default" className="bg-green-600">
              Pro
            </Badge>
          </div>
          <CardDescription>
            You currently have access to all premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription?.currentPeriodEnd && (
              <div className="bg-muted rounded-md p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground size-4" />
                  <span>
                    Your subscription will{" "}
                    {subscription.cancelAtPeriodEnd ? "end" : "renew"} on{" "}
                    <strong>
                      {format(subscription.currentPeriodEnd, "MMMM d, yyyy")}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-1">
              <div className="text-sm font-medium">Features included:</div>
              <ul className="grid gap-2 text-sm">
                {paymentFeatures.map(feature => (
                  <li key={feature.id} className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>{feature.title}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span>Unlimited events</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span>PDF settlement reports</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Tabs
      defaultValue="monthly"
      value={activeTab}
      onValueChange={value => setActiveTab(value as "monthly" | "yearly")}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">Yearly (Save 17%)</TabsTrigger>
      </TabsList>
      <TabsContent value="monthly">
        <Card>
          <CardHeader>
            <CardTitle>Pro Plan - Monthly</CardTitle>
            <CardDescription>
              Get access to all premium features for $10/month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">$10/month</div>
              <div className="grid gap-1">
                <div className="text-sm font-medium">Features included:</div>
                <ul className="grid gap-2 text-sm">
                  {paymentFeatures.map(feature => (
                    <li key={feature.id} className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <span>{feature.title}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Unlimited events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>PDF settlement reports</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleSubscribe("monthly")}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="yearly">
        <Card>
          <CardHeader>
            <CardTitle>Pro Plan - Yearly</CardTitle>
            <CardDescription>
              Get access to all premium features for $100/year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">
                $100/year{" "}
                <span className="text-muted-foreground text-sm">
                  (Save $20)
                </span>
              </div>
              <div className="grid gap-1">
                <div className="text-sm font-medium">Features included:</div>
                <ul className="grid gap-2 text-sm">
                  {paymentFeatures.map(feature => (
                    <li key={feature.id} className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <span>{feature.title}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Unlimited events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>PDF settlement reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleSubscribe("yearly")}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

interface PaymentMethodProps {
  customerId: string
}

export function SubscriptionPaymentMethod({ customerId }: PaymentMethodProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true)

    try {
      await redirectToPortalAction(window.location.href)
    } catch (error) {
      console.error("Error updating payment method:", error)
      toast.error("Failed to open payment method management")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="size-5" />
          <CardTitle>Payment Method</CardTitle>
        </div>
        <CardDescription>
          Manage your payment method for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-9 w-14 items-center justify-center rounded-md">
                <CreditCard className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Credit/Debit Card</p>
                <p className="text-muted-foreground text-xs">
                  Manage your payment card
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={handleUpdatePaymentMethod}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Update Payment Method"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

interface BillingHistoryProps {
  customerId: string
}

export function SubscriptionBillingHistory({
  customerId
}: BillingHistoryProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleViewInvoices = async () => {
    setIsLoading(true)

    try {
      await redirectToPortalAction(window.location.href)
    } catch (error) {
      console.error("Error viewing invoices:", error)
      toast.error("Failed to open billing portal")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Receipt className="size-5" />
          <CardTitle>Billing History</CardTitle>
        </div>
        <CardDescription>
          View your past invoices and billing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border p-4 text-center">
          <div className="text-muted-foreground mb-2 flex justify-center">
            <Receipt className="size-8" />
          </div>
          <p className="text-sm">
            Access your complete billing history in the Stripe portal
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={handleViewInvoices}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Please wait
            </>
          ) : (
            "View Billing History"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
