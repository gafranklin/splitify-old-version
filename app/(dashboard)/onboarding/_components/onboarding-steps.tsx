"use client"

import { motion } from "framer-motion"
import {
  ChevronRightIcon,
  CheckCircle,
  UserPlus,
  Receipt,
  CreditCard,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import Link from "next/link"
import { useOnboardingProgress } from "@/lib/hooks/use-onboarding-progress"

const steps = [
  {
    id: 1,
    title: "Complete Your Profile",
    description:
      "Add your name, contact information, and preferred payment methods.",
    icon: UserPlus,
    link: "/profile",
    cta: "Set Up Profile"
  },
  {
    id: 2,
    title: "Create Your First Event",
    description:
      "Start a new event for a trip, dinner, or any shared expense situation.",
    icon: Calendar,
    link: "/events/new",
    cta: "Create Event"
  },
  {
    id: 3,
    title: "Add Your First Expense",
    description: "Record an expense and learn how to split it with others.",
    icon: Receipt,
    link: "#", // This will be updated dynamically once they create an event
    cta: "Add Expense"
  },
  {
    id: 4,
    title: "Try a Settlement",
    description:
      "See how Splitify simplifies who pays whom with flexible payment options.",
    icon: CreditCard,
    link: "#", // This will be updated dynamically once they create an event
    cta: "View Settlements"
  }
]

export default function OnboardingSteps() {
  const { activeStep, completedSteps, markStepCompleted, isAllCompleted } =
    useOnboardingProgress()

  const handleStepAction = (stepId: number) => {
    markStepCompleted(stepId)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Get Started in 4 Easy Steps</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map(step => {
          const isActive = activeStep === step.id
          const isCompleted = completedSteps.includes(step.id)

          return (
            <Card
              key={step.id}
              className={`border-2 transition-all ${
                isActive
                  ? "border-primary shadow-lg"
                  : isCompleted
                    ? "border-green-500/30 bg-green-50 dark:bg-green-950/10"
                    : "border-gray-200 opacity-70"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        isCompleted
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="size-5" />
                      ) : (
                        <step.icon className="size-5" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <div className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                    {step.id}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-sm">
                  {step.description}
                </CardDescription>
              </CardContent>

              <CardFooter>
                <Button
                  variant={isCompleted ? "outline" : "default"}
                  className={`w-full ${isCompleted ? "border-green-200 text-green-600" : ""}`}
                  asChild
                  onClick={() => handleStepAction(step.id)}
                >
                  <Link href={step.link}>
                    <span className="flex items-center justify-center gap-2">
                      {isCompleted ? "Completed" : step.cta}
                      {!isCompleted && <ChevronRightIcon className="size-4" />}
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {isAllCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center dark:bg-green-950/10"
        >
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
            Congratulations! You've completed the onboarding process.
          </h3>
          <p className="mt-2 text-green-600 dark:text-green-500">
            You're all set to make the most of Splitify. Go to your dashboard to
            continue.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </motion.div>
      )}
    </div>
  )
}
