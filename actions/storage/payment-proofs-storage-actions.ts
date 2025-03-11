"use server"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ActionState } from "@/types"

/**
 * Uploads a payment proof image to Supabase storage
 */
export async function uploadPaymentProofStorage(
  bucket: string,
  path: string,
  file: File
): Promise<ActionState<{ path: string }>> {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    return {
      isSuccess: true,
      message: "Payment proof uploaded successfully",
      data: { path: data.path }
    }
  } catch (error) {
    console.error("Error uploading payment proof:", error)
    return { isSuccess: false, message: "Failed to upload payment proof" }
  }
}

/**
 * Gets a public URL for a payment proof
 */
export async function getPaymentProofUrlStorage(
  bucket: string,
  path: string
): Promise<ActionState<{ url: string }>> {
  try {
    const supabase = createClientComponentClient()

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    if (!data.publicUrl) {
      throw new Error("Could not generate public URL")
    }

    return {
      isSuccess: true,
      message: "Public URL generated successfully",
      data: { url: data.publicUrl }
    }
  } catch (error) {
    console.error("Error getting payment proof URL:", error)
    return { isSuccess: false, message: "Failed to get payment proof URL" }
  }
}

/**
 * Deletes a payment proof from storage
 */
export async function deletePaymentProofStorage(
  bucket: string,
  path: string
): Promise<ActionState<void>> {
  try {
    const supabase = createClientComponentClient()

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error

    return {
      isSuccess: true,
      message: "Payment proof deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting payment proof:", error)
    return { isSuccess: false, message: "Failed to delete payment proof" }
  }
} 