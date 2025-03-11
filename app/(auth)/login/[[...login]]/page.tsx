/*
This client page provides the login form from Clerk.
*/

"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to your account to continue
        </p>
      </div>

      <SignIn
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90",
            card: "bg-transparent shadow-none",
            footer: "hidden"
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
