"use client"

import React from "react"
import { formatErrorMessage, AppError } from "@/lib/error-handling"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  error: Error | null
  reset?: () => void
  showReset?: boolean
  showTryAgain?: boolean
  showHome?: boolean
  title?: string
  className?: string
}

/**
 * Component to display user-friendly error messages
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  reset,
  showReset = true,
  showTryAgain = true,
  showHome = true,
  title = "Something went wrong",
  className = "",
}) => {
  const message = error ? formatErrorMessage(error) : "An unknown error occurred."

  // Get error type for styling (default to "unknown")
  const errorType = error && (error as AppError).type ? (error as AppError).type : "unknown"
  
  // Determine severity-based styling
  const getSeverityColor = () => {
    switch (errorType) {
      case "validation":
      case "not_found":
        return "border-yellow-500 bg-yellow-50 text-yellow-800"
      case "authentication":
      case "authorization":
        return "border-orange-500 bg-orange-50 text-orange-800"
      case "server_error":
      case "database_error":
      case "unknown":
      default:
        return "border-red-500 bg-red-50 text-red-800"
    }
  }

  return (
    <div className={`rounded-lg border p-6 ${getSeverityColor()} ${className}`}>
      <div className="flex flex-col items-center text-center">
        <AlertTriangle className="h-12 w-12 mb-4" />
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        
        <p className="mb-6">{message}</p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {showReset && reset && (
            <Button 
              variant="outline" 
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          {showTryAgain && (
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          )}
          
          {showHome && (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay 