/*
This server page is the marketing homepage.
*/

"use server"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/landing/hero"
import PaymentMethods from "@/components/landing/payment-methods"

export default async function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <HeroSection />

      <section className="container mx-auto py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Split expenses with friends, your way
        </h2>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg">
          Splitify makes it easy to track shared expenses and settle up with
          friends, no matter how you prefer to pay.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow">
            <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Group Expenses</h3>
            <p className="text-muted-foreground">
              Create events, add participants, and track all expenses in one
              place.
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow">
            <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Flexible Payments</h3>
            <p className="text-muted-foreground">
              Settle up using any payment method you prefer, with built-in
              tracking.
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow">
            <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Smart Tracking</h3>
            <p className="text-muted-foreground">
              Scan receipts, import rideshare expenses, and split costs
              intelligently.
            </p>
          </div>
        </div>
      </section>

      <PaymentMethods />

      <section className="bg-muted py-20">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to simplify expense sharing?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Join thousands of users who are already using Splitify to manage
            their shared expenses.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
