"use client"

import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import ErrorDisplay from "@/components/ui/error-display"
import { logError } from "@/lib/error-handling"
import { AlertOctagon, Home } from "lucide-react"
import Link from "next/link"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error page component that will be rendered when an uncaught error
 * is thrown in a route segment or layout
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // Log the error
  useEffect(() => {
    logError(error, { source: "global-error-page", digest: error.digest })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="p-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
                <AlertOctagon className="size-10 text-red-600" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Something went wrong!
            </h1>

            <p className="mb-6 text-gray-600">
              We're sorry, but we encountered an unexpected error. Our team has
              been notified.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={reset} variant="outline" className="w-full">
                Try Again
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                className="flex w-full items-center justify-center gap-2"
              >
                <Home className="size-4" />
                Home
              </Button>
            </div>
          </div>

          {/* Show error details only in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="border-t border-gray-200 bg-gray-100 px-6 py-4">
              <p className="mb-1 font-mono text-xs text-gray-500">
                Error Details (dev only):
              </p>
              <p className="font-mono text-sm text-gray-700">{error.message}</p>
              {error.digest && (
                <p className="mt-2 font-mono text-xs text-gray-500">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
