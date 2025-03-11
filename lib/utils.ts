/*
Contains the utility functions for the app.
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (e.g., USD, EUR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Extract initials from a name
 * @param name The full name to extract initials from
 * @returns The initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return 'U'
  
  const parts = name.trim().split(/\s+/)
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
