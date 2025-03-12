"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Receipt,
  Users,
  CreditCard,
  Calculator
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

interface Feature {
  id: number
  title: string
  description: string
  icon: React.ElementType
  imageUrl?: string
}

const features: Feature[] = [
  {
    id: 1,
    title: "Easy Expense Tracking",
    description:
      "Add expenses quickly and keep track of who paid for what. Attach receipt photos for easy reference.",
    icon: Receipt,
    imageUrl: "/images/features/expense-tracking.png"
  },
  {
    id: 2,
    title: "Multiple Split Options",
    description:
      "Split expenses evenly, by percentage, or with custom amounts. Perfectly fair for everyone.",
    icon: Calculator,
    imageUrl: "/images/features/split-options.png"
  },
  {
    id: 3,
    title: "Group Management",
    description:
      "Organize participants by event and track who owes what to whom within each group.",
    icon: Users,
    imageUrl: "/images/features/group-management.png"
  },
  {
    id: 4,
    title: "Flexible Payments",
    description:
      "Settle debts with various payment methods and track payment status easily.",
    icon: CreditCard,
    imageUrl: "/images/features/payment-options.png"
  }
]

export default function FeatureTour() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const nextFeature = () => {
    setCurrentFeature(prev => (prev === features.length - 1 ? 0 : prev + 1))
  }

  const prevFeature = () => {
    setCurrentFeature(prev => (prev === 0 ? features.length - 1 : prev - 1))
  }

  const feature = features[currentFeature]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl">Key Features</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="relative h-[300px] overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col justify-between p-6"
            >
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full p-2.5">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>

                <p className="text-muted-foreground">{feature.description}</p>

                {feature.imageUrl && (
                  <div className="mt-auto flex h-[160px] items-center justify-center pt-4 opacity-80">
                    <div className="text-muted-foreground flex size-full items-center justify-center rounded-md bg-slate-200 p-4 text-sm dark:bg-slate-800">
                      [Feature Screenshot]
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" size="icon" onClick={prevFeature}>
          <ChevronLeftIcon className="size-4" />
        </Button>

        <div className="flex gap-1">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeature(index)}
              className={`size-2 rounded-full transition-colors ${
                index === currentFeature
                  ? "bg-primary"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        <Button variant="outline" size="icon" onClick={nextFeature}>
          <ChevronRightIcon className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
