"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileSearch, Home, ArrowLeft } from "lucide-react"

/**
 * Global 404 page component that will be rendered when a page is not found
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex size-24 items-center justify-center rounded-full bg-blue-100">
                  <FileSearch className="size-12 text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full bg-blue-500 text-xl font-bold text-white">
                  ?
                </div>
              </div>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-gray-900">404</h1>

            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Page Not Found
            </h2>

            <p className="mb-8 text-gray-600">
              We couldn't find the page you're looking for. The page may have
              been moved, deleted, or never existed.
            </p>

            <div className="flex flex-col space-y-3">
              <Button
                asChild
                className="flex w-full items-center justify-center gap-2"
              >
                <Link href="/">
                  <Home className="size-4" />
                  Go to Home
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex w-full items-center justify-center gap-2"
              >
                <ArrowLeft className="size-4" />
                Go Back
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-100 px-8 py-4">
            <p className="text-center text-sm text-gray-600">
              Lost? Try searching for what you need or checking the navigation
              menu.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/contact"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
