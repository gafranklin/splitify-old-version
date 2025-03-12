"use server"

import { Metadata } from "next"
import OnboardingSteps from "./_components/onboarding-steps"
import WelcomeMessage from "./_components/welcome-message"
import FeatureTour from "./_components/feature-tour"

export const metadata: Metadata = {
  title: "Onboarding | Splitify",
  description:
    "Welcome to Splitify! Get started with your expense splitting journey."
}

export default async function OnboardingPage() {
  return (
    <div className="container max-w-5xl space-y-8 py-8">
      <WelcomeMessage />
      <OnboardingSteps />
      <FeatureTour />
    </div>
  )
}
