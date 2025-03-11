"use client"

import { useState, useCallback } from "react"

/**
 * Hook for copying text to clipboard
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => {
        console.error("Failed to copy text: ", err)
      })
  }, [])

  return { copy, isCopied }
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount)
}
