/*
Receipt-related type definitions.
*/

import { SelectReceipt } from "@/db/schema"

// OCR result structure
export interface OCRResult {
  merchant?: string
  date?: string
  total?: number
  items?: {
    name: string
    price: number
    quantity?: number
  }[]
  taxAmount?: number
  tipAmount?: number
  raw?: string // Raw OCR text data
  confidence?: number
}

// Extended receipt type with OCR data parsed
export interface ExtendedReceipt extends SelectReceipt {
  parsedOcrData?: OCRResult
  signedUrl?: string
}

// Receipt creation parameters
export interface CreateReceiptParams {
  expenseId: string
  eventId: string // Needed for storage path
  file: File
}

// Receipt update parameters
export interface UpdateReceiptParams {
  id: string
  status?: "pending" | "processing" | "processed" | "failed"
  ocrData?: OCRResult | string
  hasBeenReviewed?: boolean
}
