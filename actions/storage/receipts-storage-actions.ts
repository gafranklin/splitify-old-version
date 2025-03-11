"use server"

import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"

// Initialize Supabase client for server-side operations
const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const BUCKET_NAME = process.env.RECEIPT_BUCKET_NAME || "receipts"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

/**
 * Validates a receipt file before upload
 */
function validateReceiptFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`)
  }

  return true
}

/**
 * Creates a unique filename for a receipt
 */
function createUniqueFilename(eventId: string, expenseId: string, originalFilename: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "")
  const extension = originalFilename.split(".").pop()
  return `${eventId}/${expenseId}/${timestamp}_${Math.random().toString(36).substring(2, 7)}.${extension}`
}

/**
 * Uploads a receipt file to Supabase storage
 */
export async function uploadReceiptStorage(
  eventId: string,
  expenseId: string,
  file: File
): Promise<ActionState<{ path: string; url: string }>> {
  try {
    validateReceiptFile(file)
    const supabase = createSupabaseClient()
    
    const path = createUniqueFilename(eventId, expenseId, file.name)
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 60 * 60) // 1 hour expiry

    if (!urlData?.signedUrl) {
      throw new Error("Could not generate signed URL")
    }

    return {
      isSuccess: true,
      message: "Receipt uploaded successfully",
      data: { 
        path: data.path,
        url: urlData.signedUrl
      }
    }
  } catch (error: any) {
    console.error("Error uploading receipt:", error)
    return { isSuccess: false, message: error.message || "Failed to upload receipt" }
  }
}

/**
 * Gets a signed URL for a receipt
 */
export async function getReceiptUrlStorage(
  path: string
): Promise<ActionState<{ url: string }>> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 60 * 60) // 1 hour expiry

    if (error) throw error
    
    if (!data?.signedUrl) {
      throw new Error("Could not generate signed URL")
    }

    return {
      isSuccess: true,
      message: "Receipt URL generated successfully",
      data: { url: data.signedUrl }
    }
  } catch (error: any) {
    console.error("Error getting receipt URL:", error)
    return { isSuccess: false, message: error.message || "Failed to get receipt URL" }
  }
}

/**
 * Deletes a receipt from storage
 */
export async function deleteReceiptStorage(
  path: string
): Promise<ActionState<void>> {
  try {
    const supabase = createSupabaseClient()
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) throw error

    return {
      isSuccess: true,
      message: "Receipt deleted successfully",
      data: undefined
    }
  } catch (error: any) {
    console.error("Error deleting receipt:", error)
    return { isSuccess: false, message: error.message || "Failed to delete receipt" }
  }
} 