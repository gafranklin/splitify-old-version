"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { logError } from "@/lib/error-handling"
import ErrorDisplay from "@/components/ui/error-display"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKey?: any
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error handling service
    // Using void to handle the promise without awaiting it since componentDidCatch is synchronous
    void this.logErrorAsync(error, errorInfo)
  }

  private async logErrorAsync(
    error: Error,
    errorInfo: ErrorInfo
  ): Promise<void> {
    try {
      // Log the error asynchronously
      await logError(error, { componentStack: errorInfo.componentStack })

      // Call the onError callback if provided
      if (this.props.onError) {
        this.props.onError(error, errorInfo)
      }
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // If resetKey changes, reset the error state
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise use default ErrorDisplay
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
