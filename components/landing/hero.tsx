/*
This client component provides the hero section for the landing page.
*/

"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Rocket, ArrowRightLeft, Receipt, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const HeroSection = () => {
  console.log(
    "[HERO_SECTION] Rendering hero section - Updated with Splitify branding"
  )

  return (
    <div className="flex flex-col items-center justify-center px-8 pt-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-8 flex max-w-2xl flex-col items-center justify-center gap-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="text-balance text-6xl font-bold"
        >
          Splitify
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="max-w-xl text-balance text-xl"
        >
          Split expenses with friends, your way
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <Link href="/signup">
            <Button className="bg-blue-500 text-lg hover:bg-blue-600">
              <Rocket className="mr-2 size-5" />
              Get Started &rarr;
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1, ease: "easeOut" }}
        className="mx-auto mt-20 flex w-full max-w-screen-lg items-center justify-center"
      >
        {/* App feature illustration */}
        <div className="w-full overflow-hidden rounded-lg border bg-white/50 p-8 shadow-lg backdrop-blur-sm dark:bg-slate-900/50">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-xl bg-slate-50 p-6 shadow dark:bg-slate-800">
              <div className="bg-primary/10 mb-4 flex size-16 items-center justify-center rounded-full">
                <Receipt className="text-primary size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Track Expenses</h3>
              <p className="text-muted-foreground text-center">
                Easily log expenses and track who paid for what
              </p>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-slate-50 p-6 shadow dark:bg-slate-800">
              <div className="bg-primary/10 mb-4 flex size-16 items-center justify-center rounded-full">
                <ArrowRightLeft className="text-primary size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Split Costs</h3>
              <p className="text-muted-foreground text-center">
                Divide expenses equally or create custom splits
              </p>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-slate-50 p-6 shadow dark:bg-slate-800">
              <div className="bg-primary/10 mb-4 flex size-16 items-center justify-center rounded-full">
                <BarChart3 className="text-primary size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Settle Up</h3>
              <p className="text-muted-foreground text-center">
                See balances at a glance and settle debts easily
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
