/*
This client page provides the signup form from Clerk.
*/

"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function SignUpPage() {
  const { theme } = useTheme()

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold">Create an account</h2>
        <p className="text-muted-foreground text-sm">
          Sign up to start splitting expenses with friends
        </p>
      </div>

      <SignUp
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
