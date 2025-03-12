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

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()
  
  // Add detailed logging for debugging
  console.log(`[MIDDLEWARE] Processing path: ${req.nextUrl.pathname}`)
  console.log(`[MIDDLEWARE] User authenticated: ${!!userId}`)
  console.log(`[MIDDLEWARE] Is protected route: ${isProtectedRoute(req)}`)
  console.log(`[MIDDLEWARE] URL: ${req.url}`)
  console.log(`[MIDDLEWARE] Method: ${req.method}`)
  
  // Create response with pathname header for server component route checking
  const response = NextResponse.next()
  response.headers.set("x-pathname", req.nextUrl.pathname)
  
  // Add specific logging for /home path
  if (req.nextUrl.pathname === "/home") {
    console.log("[MIDDLEWARE] Processing /home path")
    console.log("[MIDDLEWARE] This should be accessible to unauthenticated users")
    return response
  }
  
  // Specifically handle the /participants route that no longer exists
  if (req.nextUrl.pathname === "/participants") {
    console.log("[MIDDLEWARE] Detected request to deprecated /participants route")
    
    // Redirect to events page instead
    if (userId) {
      console.log("[MIDDLEWARE] Redirecting authenticated user from /participants to /events")
      return NextResponse.redirect(new URL("/events", req.url))
    } else {
      console.log("[MIDDLEWARE] Redirecting unauthenticated user from /participants to sign-in")
      return redirectToSignIn({ returnBackUrl: req.url })
    }
  }
  
  // Check if we're at the root path
  if (req.nextUrl.pathname === "/") {
    console.log("[MIDDLEWARE] Processing root path")
    
    // If user is authenticated, redirect to dashboard
    if (userId) {
      console.log("[MIDDLEWARE] Authenticated user at root path - redirecting to /dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    
    // If user is not authenticated, let them see the marketing page
    console.log("[MIDDLEWARE] Unauthenticated user at root path - showing marketing page")
    return response
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    console.log("[MIDDLEWARE] Unauthenticated user attempting to access protected route - redirecting to sign-in")
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && isProtectedRoute(req)) {
    console.log("[MIDDLEWARE] Authenticated user accessing protected route - allowing access")
    return response
  }
  
  console.log("[MIDDLEWARE] Default case - proceeding with request")
  return response
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
}
