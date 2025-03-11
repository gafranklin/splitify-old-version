/*
This server page displays information about the company, mission, and team.
*/

"use server"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default async function AboutPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="container mx-auto py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          About Splitify
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg">
          We're on a mission to make expense sharing simple, flexible, and
          stress-free.
        </p>
      </section>

      <section className="bg-muted w-full py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-3xl font-bold tracking-tight">
              Our Story
            </h2>
            <div className="space-y-4 text-lg">
              <p>
                Splitify was born out of frustration with existing
                expense-sharing apps that force users into specific payment
                methods and lack flexibility.
              </p>
              <p>
                We believe that expense sharing should adapt to how you and your
                friends prefer to pay each other, not the other way around.
                Whether you prefer cash, Venmo, PayPal, or bank transfers,
                Splitify lets you track it all in one place.
              </p>
              <p>
                Our team has experienced firsthand the challenges of managing
                shared expenses during trips, roommate situations, and group
                outings. We've built Splitify to solve these problems with a
                focus on flexibility, transparency, and ease of use.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold">Flexibility</h3>
              <p className="text-muted-foreground">
                We believe in adapting to your preferences, not forcing you to
                change your habits. Pay your way, track your way.
              </p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold">Transparency</h3>
              <p className="text-muted-foreground">
                Clear, straightforward expense tracking and settlement plans
                that everyone can understand and trust.
              </p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold">Simplicity</h3>
              <p className="text-muted-foreground">
                Powerful features wrapped in an intuitive interface that makes
                expense sharing accessible to everyone.
              </p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold">Trust</h3>
              <p className="text-muted-foreground">
                Built-in verification features that help maintain trust between
                friends when money is involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted w-full py-20">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Join thousands of users who are already using Splitify to manage
            their shared expenses.
          </p>
          <Button asChild size="lg">
            <Link href="/signup" className="group">
              Get Started for Free
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
