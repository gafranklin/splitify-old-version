"use server"

import { db } from "@/db/db"
import { InsertReceipt, SelectReceipt, receiptsTable } from "@/db/schema"
import { 
  ActionState, 
  CreateReceiptParams, 
  ExtendedReceipt, 
  OCRResult, 
  UpdateReceiptParams 
} from "@/types"
import { eq } from "drizzle-orm"
import { 
  deleteReceiptStorage, 
  getReceiptUrlStorage, 
  uploadReceiptStorage 
} from "../storage/receipts-storage-actions"

/**
 * Creates a new receipt record with uploaded file
 */
export async function createReceiptAction(
  params: CreateReceiptParams
): Promise<ActionState<ExtendedReceipt>> {
  try {
    const { expenseId, eventId, file } = params

    // 1. Upload the file to storage
    const uploadResult = await uploadReceiptStorage(eventId, expenseId, file)
    if (!uploadResult.isSuccess) {
      throw new Error(uploadResult.message)
    }

    // 2. Create the receipt record in database
    const receiptData: InsertReceipt = {
      expenseId,
      storagePath: uploadResult.data.path,
      originalFilename: file.name,
      mimeType: file.type,
      status: "pending",
      hasBeenReviewed: false
    }

    const [newReceipt] = await db.insert(receiptsTable)
      .values(receiptData)
      .returning()

    return {
      isSuccess: true,
      message: "Receipt created successfully",
      data: {
        ...newReceipt,
        signedUrl: uploadResult.data.url
      }
    }
  } catch (error: any) {
    console.error("Error creating receipt:", error)
    return { 
      isSuccess: false, 
      message: error.message || "Failed to create receipt" 
    }
  }
}

/**
 * Gets a receipt by ID with a signed URL
 */
export async function getReceiptAction(
  id: string
): Promise<ActionState<ExtendedReceipt>> {
  try {
    const receipt = await db.select().from(receiptsTable).where(eq(receiptsTable.id, id)).limit(1).then(rows => rows[0])

    if (!receipt) {
      throw new Error("Receipt not found")
    }

    // Get a signed URL for the receipt
    const urlResult = await getReceiptUrlStorage(receipt.storagePath)
    
    // Parse OCR data if available
    let parsedOcrData: OCRResult | undefined = undefined
    if (receipt.ocrData) {
      try {
        parsedOcrData = JSON.parse(receipt.ocrData)
      } catch {
        console.error("Failed to parse OCR data for receipt:", id)
      }
    }

    return {
      isSuccess: true,
      message: "Receipt retrieved successfully",
      data: {
        ...receipt,
        parsedOcrData,
        signedUrl: urlResult.isSuccess ? urlResult.data.url : undefined
      }
    }
  } catch (error: any) {
    console.error("Error getting receipt:", error)
    return { 
      isSuccess: false, 
      message: error.message || "Failed to get receipt" 
    }
  }
}

/**
 * Gets all receipts for an expense
 */
export async function getReceiptsByExpenseAction(
  expenseId: string
): Promise<ActionState<ExtendedReceipt[]>> {
  try {
    const receipts = await db.select().from(receiptsTable).where(eq(receiptsTable.expenseId, expenseId))

    // Get signed URLs and parse OCR data for all receipts
    const extendedReceipts = await Promise.all(
      receipts.map(async (receipt: SelectReceipt) => {
        const urlResult = await getReceiptUrlStorage(receipt.storagePath)
        
        // Parse OCR data if available
        let parsedOcrData: OCRResult | undefined = undefined
        if (receipt.ocrData) {
          try {
            parsedOcrData = JSON.parse(receipt.ocrData)
          } catch {
            console.error("Failed to parse OCR data for receipt:", receipt.id)
          }
        }

        return {
          ...receipt,
          parsedOcrData,
          signedUrl: urlResult.isSuccess ? urlResult.data.url : undefined
        }
      })
    )

    return {
      isSuccess: true,
      message: "Receipts retrieved successfully",
      data: extendedReceipts
    }
  } catch (error: any) {
    console.error("Error getting receipts for expense:", error)
    return { 
      isSuccess: false, 
      message: error.message || "Failed to get receipts" 
    }
  }
}

/**
 * Updates a receipt record
 */
export async function updateReceiptAction(
  params: UpdateReceiptParams
): Promise<ActionState<SelectReceipt>> {
  try {
    const { id, ...updateData } = params

    // Convert OCR data to string if it's an object
    let ocrDataString = updateData.ocrData
    if (typeof updateData.ocrData === 'object') {
      ocrDataString = JSON.stringify(updateData.ocrData)
    }

    const [updatedReceipt] = await db.update(receiptsTable)
      .set({
        ...updateData,
        ocrData: ocrDataString as string | undefined,
        updatedAt: new Date()
      })
      .where(eq(receiptsTable.id, id))
      .returning()

    if (!updatedReceipt) {
      throw new Error("Receipt not found")
    }

    return {
      isSuccess: true,
      message: "Receipt updated successfully",
      data: updatedReceipt
    }
  } catch (error: any) {
    console.error("Error updating receipt:", error)
    return { 
      isSuccess: false, 
      message: error.message || "Failed to update receipt" 
    }
  }
}

/**
 * Deletes a receipt and its storage file
 */
export async function deleteReceiptAction(
  id: string
): Promise<ActionState<void>> {
  try {
    // Get the receipt to find the storage path
    const receipt = await db.select().from(receiptsTable).where(eq(receiptsTable.id, id)).limit(1).then(rows => rows[0])

    if (!receipt) {
      throw new Error("Receipt not found")
    }

    // Delete the file from storage
    const deleteStorageResult = await deleteReceiptStorage(receipt.storagePath)
    if (!deleteStorageResult.isSuccess) {
      console.warn(`Failed to delete receipt file from storage: ${deleteStorageResult.message}`)
      // Continue with deleting the database record
    }

    // Delete the database record
    await db.delete(receiptsTable)
      .where(eq(receiptsTable.id, id))

    return {
      isSuccess: true,
      message: "Receipt deleted successfully",
      data: undefined
    }
  } catch (error: any) {
    console.error("Error deleting receipt:", error)
    return { 
      isSuccess: false, 
      message: error.message || "Failed to delete receipt" 
    }
  }
} 