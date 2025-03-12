/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/events(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/expenses(.*)",
  "/activity(.*)",
  "/onboarding(.*)"
])

// Define public API routes that should bypass auth checks
const isPublicApiRoute = createRouteMatcher([
  "/api/stripe/webhooks(.*)" // Stripe webhooks should be accessible without auth
])

export default clerkMiddleware(async (auth, req) => {
  // For production, remove detailed logging
  const { userId, redirectToSignIn } = await auth()
  
  // Create response with pathname header for server component route checking
  const response = NextResponse.next()
  response.headers.set("x-pathname", req.nextUrl.pathname)
  
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Allow public API routes to bypass auth
  if (isPublicApiRoute(req)) {
    return response
  }
  
  // Special case for the home page
  if (req.nextUrl.pathname === "/home") {
    return response
  }
  
  // Handle the deprecated /participants route
  if (req.nextUrl.pathname === "/participants") {
    if (userId) {
      return NextResponse.redirect(new URL("/events", req.url))
    } else {
      return redirectToSignIn({ returnBackUrl: req.url })
    }
  }
  
  // Root path handling
  if (req.nextUrl.pathname === "/") {
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return response
  }

  // Protected route handling
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  if (userId && isProtectedRoute(req)) {
    return response
  }
  
  return response
})

// Expand the matcher to include more specific patterns if needed
export const config = {
  matcher: ["/((?!.*\\..*|_next|_vercel|favicon.ico).*)", "/", "/(api|trpc)(.*)"]
}
