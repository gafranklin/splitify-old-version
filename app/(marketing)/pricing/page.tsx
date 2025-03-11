/*
This server page displays pricing options for the product, integrating Stripe payment links.
*/

"use server"

import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import PricingTable from "@/components/landing/pricing-table"

export default async function PricingPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="container mx-auto py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg">
          Choose the plan that works best for you. All plans include our core
          features.
        </p>

        <PricingTable className="mx-auto max-w-4xl" />
      </section>

      <section className="bg-muted w-full py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Find answers to common questions about Splitify and our pricing
              plans.
            </p>
          </div>

          <div className="bg-card mx-auto max-w-3xl divide-y rounded-lg border">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-medium">
                Can I use Splitify for free?
              </h3>
              <p className="text-muted-foreground">
                Yes! Splitify offers a free plan with all the essential features
                you need for occasional expense sharing. You can create
                unlimited events, track expenses, and settle up with friends
                without paying anything.
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-medium">
                What payment methods are supported?
              </h3>
              <p className="text-muted-foreground">
                Splitify supports all payment methods! Unlike other
                expense-sharing apps, we don't force you to use a specific
                payment system. You can track payments made through cash, Venmo,
                PayPal, Zelle, bank transfers, or any other method you prefer.
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-medium">
                What's included in the Premium plan?
              </h3>
              <p className="text-muted-foreground">
                The Premium plan includes advanced features like bulk payment
                request generation, advanced payment proof management, payment
                reminder automation, payment history analytics, PDF settlement
                report generation, rideshare expense integration, and priority
                support.
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-medium">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your Premium subscription at any time. Your
                subscription will remain active until the end of your current
                billing period, after which you'll be downgraded to the Free
                plan.
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-medium">
                Is there a limit to the number of events I can create?
              </h3>
              <p className="text-muted-foreground">
                No, both Free and Premium plans allow you to create unlimited
                events. There are no restrictions on the number of events,
                participants, or expenses you can track.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to simplify expense sharing?
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          Join thousands of users who are already using Splitify to manage their
          shared expenses.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/features">Learn More</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
