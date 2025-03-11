"use server"

import { ActionState } from "@/types"

/**
 * Standard error types for consistent error handling
 */
export type ErrorType =
  | "validation"
  | "authentication"
  | "authorization"
  | "not_found"
  | "server_error"
  | "network_error"
  | "payment_error"
  | "subscription_error"
  | "feature_unavailable"
  | "database_error"
  | "storage_error"
  | "unknown"

/**
 * Extended error interface with additional properties
 */
export interface AppError extends Error {
  type: ErrorType
  code?: string
  details?: Record<string, any>
}

/**
 * Create a formatted error with type information
 */
export async function createAppError(
  message: string,
  type: ErrorType = "unknown",
  details?: Record<string, any>
): Promise<AppError> {
  const error = new Error(message) as AppError
  error.type = type
  if (details) {
    error.details = details
  }
  return error
}

/**
 * Log error with appropriate level and context
 */
export async function logError(
  error: Error | AppError,
  context?: Record<string, any>
): Promise<void> {
  const appError = error as AppError
  const errorType = appError.type || "unknown"

  // In production, would integrate with logging service
  console.error({
    message: error.message,
    type: errorType,
    stack: error.stack,
    ...(appError.details || {}),
    ...(context || {})
  })
}

/**
 * Format error for user display
 */
export async function formatErrorMessage(
  error: Error | AppError
): Promise<string> {
  const appError = error as AppError

  // Return user-friendly error messages based on error type
  switch (appError.type) {
    case "validation":
      return "The submitted information is invalid. Please check your input and try again."
    case "authentication":
      return "You need to be logged in to perform this action."
    case "authorization":
      return "You don't have permission to perform this action."
    case "not_found":
      return "The requested resource was not found."
    case "payment_error":
      return "There was an issue with the payment process. Please try again later."
    case "subscription_error":
      return "There was an issue with your subscription. Please check your subscription status."
    case "feature_unavailable":
      return "This feature is not available on your current plan."
    case "database_error":
      return "There was an issue with our database. Please try again later."
    case "storage_error":
      return "There was an issue with file storage. Please try again later."
    case "network_error":
      return "Network connection issue. Please check your internet connection and try again."
    case "server_error":
    case "unknown":
    default:
      // For unexpected errors, provide a generic message
      return "Something went wrong. Please try again later."
  }
}

/**
 * Handle errors in server actions and return formatted ActionState
 */
export async function handleActionError<T>(
  error: unknown,
  context?: Record<string, any>
): Promise<ActionState<T>> {
  // Convert unknown error to AppError
  const appError =
    error instanceof Error
      ? (error as AppError)
      : await createAppError("An unknown error occurred", "unknown")

  // Log the error
  await logError(appError, context)

  // Return formatted ActionState
  return {
    isSuccess: false,
    message: await formatErrorMessage(appError)
  }
}

/**
 * Check if an error is of a specific type
 */
export async function isErrorType(
  error: unknown,
  type: ErrorType
): Promise<boolean> {
  if (!(error instanceof Error)) return false
  const appError = error as AppError
  return appError.type === type
}

/**
 * Extract validation errors for form handling
 */
export async function getValidationErrors(
  error: unknown
): Promise<Record<string, string> | null> {
  if (!(error instanceof Error)) return null
  const appError = error as AppError

  if (appError.type === "validation" && appError.details) {
    return appError.details as Record<string, string>
  }

  return null
}

/**
 * Create an HTTP error response for API routes
 */
export async function createErrorResponse(
  error: Error | AppError,
  status: number = 500
): Promise<Response> {
  const appError = error as AppError

  // Log the error
  await logError(appError)

  // Return structured error response
  return new Response(
    JSON.stringify({
      error: await formatErrorMessage(appError),
      type: appError.type || "unknown"
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
}
