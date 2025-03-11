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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileSearch className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  ?
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              404
            </h1>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Page Not Found
            </h2>
            
            <p className="text-gray-600 mb-8">
              We couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button 
                asChild
                className="w-full flex items-center justify-center gap-2"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-gray-100 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Lost? Try searching for what you need or checking the navigation menu.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6">
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