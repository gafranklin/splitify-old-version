"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

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
import { ProfileWithPermissions } from "@/types"
import { SUBSCRIPTION_PRICES } from "@/lib/stripe"
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
  getSubscriptionStatusAction,
  redirectToCheckoutAction,
  redirectToPortalAction
} from "@/actions/stripe-actions"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"

interface SubscriptionManagementProps {
  profile: ProfileWithPermissions | null
}

export default function SubscriptionManagement({
  profile
}: SubscriptionManagementProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly")

  const isPro = profile?.membership === "pro"

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) return

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
    if (!user || !profile?.stripeCustomerId) return

    setIsLoading(true)

    try {
      await redirectToPortalAction(window.location.href)
    } catch (error) {
      console.error("Error managing subscription:", error)
      toast.error("Failed to open subscription management")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {isPro ? (
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
              <div className="grid gap-1">
                <div className="text-sm font-medium">Features included:</div>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Unlimited events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Receipt scanning with OCR</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Rideshare integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Bulk payment requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Payment reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Payment analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Advanced payment proof management</span>
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
      ) : (
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
                    <div className="text-sm font-medium">
                      Features included:
                    </div>
                    <ul className="grid gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Unlimited events</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Receipt scanning with OCR</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Rideshare integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Bulk payment requests</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Payment reminders</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Payment analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Advanced payment proof management</span>
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
                    <div className="text-sm font-medium">
                      Features included:
                    </div>
                    <ul className="grid gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Unlimited events</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Receipt scanning with OCR</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Rideshare integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Bulk payment requests</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Payment reminders</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Payment analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Advanced payment proof management</span>
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
      )}
    </div>
  )
}
