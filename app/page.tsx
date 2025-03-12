"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default async function RootPage() {
  console.log("[ROOT_PAGE] Processing root page")
  console.log(
    "[ROOT_PAGE] Current URL pathname:",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/` : "localhost"
  )
  console.log("[ROOT_PAGE] NODE_ENV:", process.env.NODE_ENV)
  console.log("[ROOT_PAGE] Checking for marketing/home/page.tsx existence")

  const { userId } = await auth()
  console.log(`[ROOT_PAGE] User authenticated: ${!!userId}`)

  // If user is authenticated, redirect to dashboard
  if (userId) {
    console.log("[ROOT_PAGE] Redirecting authenticated user to /dashboard")
    redirect("/dashboard")
  }

  // Otherwise, redirect to marketing page
  console.log("[ROOT_PAGE] Redirecting unauthenticated user to /home")
  console.log(
    "[ROOT_PAGE] This redirect may be the issue - we should check if /home exists and is configured correctly"
  )
  redirect("/home")
}
