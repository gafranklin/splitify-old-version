"use server"

import { auth } from "@clerk/nextjs/server"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WelcomeMessage() {
  return (
    <Card className="border-primary/10 border-2 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">
          Welcome to Splitify!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={<p>Loading your personal welcome...</p>}>
          <WelcomeContent />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function WelcomeContent() {
  const { userId } = await auth()
  const firstName = userId ? "there" : "there" // In a real app, you'd fetch the user's name from their profile

  return (
    <>
      <p className="text-lg">
        Hi {firstName}! We're excited to have you join us. Splitify makes it
        easy to split expenses with friends, track who owes what, and settle up
        with flexible payment options.
      </p>
      <p>
        Whether you're planning a trip, sharing household expenses, or just
        splitting the bill at dinner, Splitify helps you keep everything
        organized and stress-free.
      </p>
      <p className="font-medium">
        Let's get you set up with everything you need to start splitting
        expenses!
      </p>
    </>
  )
}
