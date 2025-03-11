"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PREMIUM_FEATURES } from "@/lib/subscription"
import PremiumFeature from "@/components/ui/premium-feature"
import { getPaymentFeatures, FeatureDetails } from "@/lib/premium-features"
import {
  FileTextIcon,
  ClockIcon,
  BarChart3Icon,
  ClipboardCheckIcon,
  Users2Icon
} from "lucide-react"

interface FeatureCardProps {
  feature: FeatureDetails
  icon: React.ReactNode
}

function FeatureCard({ feature, icon }: FeatureCardProps) {
  return (
    <PremiumFeature feature={feature.id as keyof typeof PREMIUM_FEATURES}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              {icon}
            </div>
          </div>
          <CardTitle className="mt-4">{feature.title}</CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p>
              This premium feature helps you efficiently manage payments and
              settlements with your group.
            </p>
          </div>
        </CardContent>
      </Card>
    </PremiumFeature>
  )
}

export default function PremiumPaymentFeatures() {
  const paymentFeatures = getPaymentFeatures()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Premium Payment Features</h2>
        <p className="text-muted-foreground">
          Advanced payment tools to simplify expense settlements
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          feature={paymentFeatures[0]}
          icon={<Users2Icon className="text-primary size-5" />}
        />
        <FeatureCard
          feature={paymentFeatures[1]}
          icon={<ClockIcon className="text-primary size-5" />}
        />
        <FeatureCard
          feature={paymentFeatures[2]}
          icon={<BarChart3Icon className="text-primary size-5" />}
        />
        <FeatureCard
          feature={paymentFeatures[3]}
          icon={<ClipboardCheckIcon className="text-primary size-5" />}
        />
      </div>

      <div className="mt-8">
        <PremiumFeature feature="PDF_REPORTS">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
                  <FileTextIcon className="text-primary size-5" />
                </div>
              </div>
              <CardTitle className="mt-4">PDF Settlement Reports</CardTitle>
              <CardDescription>
                Generate comprehensive PDF reports of your event settlements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>
                  Create professional PDF reports summarizing expenses,
                  payments, and settlements for your events. These reports are
                  perfect for record-keeping and sharing with participants who
                  prefer paper documentation.
                </p>
              </div>
            </CardContent>
          </Card>
        </PremiumFeature>
      </div>
    </div>
  )
}
