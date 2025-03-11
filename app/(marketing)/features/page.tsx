/*
This server page displays the main features and capabilities of the product.
*/

"use server"

import Link from "next/link"
import {
  CreditCard,
  FileText,
  Image,
  LayoutDashboard,
  Receipt,
  Split,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import PaymentMethods from "@/components/landing/payment-methods"

export default async function FeaturesPage() {
  const features = [
    {
      icon: LayoutDashboard,
      title: "Event Management",
      description:
        "Create and manage events for trips, dinners, or any shared expense situation. Invite participants and keep everything organized in one place."
    },
    {
      icon: Receipt,
      title: "Receipt Scanning",
      description:
        "Snap a photo of your receipt and let our OCR technology automatically extract the details, saving you time and reducing errors."
    },
    {
      icon: Split,
      title: "Smart Expense Splitting",
      description:
        "Split expenses evenly, by percentage, or with custom amounts. Our intelligent system makes it easy to handle complex splitting scenarios."
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Tracking",
      description:
        "Track payments made through any method - cash, Venmo, PayPal, bank transfers, and more. No forced payment integrations, just simple tracking."
    },
    {
      icon: Image,
      title: "Payment Proof Management",
      description:
        "Upload and store payment proof images for verification. Ensure everyone has confidence in the payment process with visual confirmation."
    },
    {
      icon: FileText,
      title: "Settlement Reports",
      description:
        "Generate clear settlement reports showing who owes what to whom. Optimize the number of transactions needed to settle up."
    },
    {
      icon: Users,
      title: "Friend Management",
      description:
        "Keep track of friends you frequently split expenses with. Quickly add them to new events without re-entering their information."
    }
  ]

  return (
    <div className="flex flex-col items-center">
      <section className="container mx-auto py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Features
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg">
          Splitify offers a comprehensive set of features to make expense
          sharing simple, flexible, and stress-free.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <div
              key={feature.title}
              className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm"
            >
              <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full">
                <feature.icon className="text-primary size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted w-full py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Pay Your Way, Track Your Way
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Unlike other expense-sharing apps that force you to use their
              payment system, Splitify gives you the freedom to pay and track
              however you prefer.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">
                Payment Flexibility
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>Use any payment method you prefer</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>No forced integrations or fees</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>Track cash payments easily</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>Generate payment links for popular payment apps</span>
                </li>
              </ul>
            </div>

            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">
                Payment Verification
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>Upload payment proof images</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>
                    Track payment status (pending, confirmed, disputed)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>Add payment reference numbers</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary mr-2 flex size-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </span>
                  <span>Confirm payments received with timestamps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PaymentMethods />

      <section className="container mx-auto py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          Join thousands of users who are already using Splitify to manage their
          shared expenses.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Sign Up for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
