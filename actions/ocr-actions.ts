"use server"

import { ActionState, OCRResult } from "@/types"
import { getReceiptAction, updateReceiptAction } from "./db/receipts-actions"
import { AnalyzeExpenseCommand, TextractClient } from "@aws-sdk/client-textract"

/**
 * Processes a receipt image using OCR to extract relevant information
 * Uses AWS Textract for OCR processing
 */
export async function processReceiptOcrAction(
  receiptId: string
): Promise<ActionState<OCRResult>> {
  try {
    // 1. Get the receipt details
    const receiptResult = await getReceiptAction(receiptId)
    if (!receiptResult.isSuccess) {
      throw new Error(`Failed to get receipt: ${receiptResult.message}`)
    }

    const receipt = receiptResult.data
    if (!receipt.signedUrl) {
      throw new Error("Receipt image URL not available")
    }

    // 2. Update receipt status to processing
    await updateReceiptAction({
      id: receiptId,
      status: "processing"
    })

    // 3. Process the receipt image with OCR
    let ocrResult: OCRResult
    try {
      ocrResult = await performOcrProcessing(receipt.signedUrl)
    } catch (error: any) {
      // If OCR processing fails, mark the receipt as failed and rethrow
      await updateReceiptAction({
        id: receiptId,
        status: "failed"
      })
      throw error
    }

    // 4. Update receipt with OCR results
    await updateReceiptAction({
      id: receiptId,
      status: "processed",
      ocrData: ocrResult
    })

    return {
      isSuccess: true,
      message: "Receipt processed successfully",
      data: ocrResult
    }
  } catch (error: any) {
    console.error("Error processing receipt OCR:", error)
    return {
      isSuccess: false,
      message: error.message || "Failed to process receipt"
    }
  }
}

/**
 * Updates OCR data manually with user-corrected information
 */
export async function updateReceiptOcrDataAction(
  receiptId: string,
  ocrData: OCRResult
): Promise<ActionState<OCRResult>> {
  try {
    // Update receipt with corrected OCR data and mark as reviewed
    const updateResult = await updateReceiptAction({
      id: receiptId,
      ocrData,
      hasBeenReviewed: true
    })

    if (!updateResult.isSuccess) {
      throw new Error(`Failed to update receipt: ${updateResult.message}`)
    }

    return {
      isSuccess: true,
      message: "OCR data updated successfully",
      data: ocrData
    }
  } catch (error: any) {
    console.error("Error updating receipt OCR data:", error)
    return {
      isSuccess: false,
      message: error.message || "Failed to update OCR data"
    }
  }
}

/**
 * Performs OCR processing on a receipt image using AWS Textract
 */
async function performOcrProcessing(imageUrl: string): Promise<OCRResult> {
  // Check for AWS credentials
  const accessKeyId = process.env.AWS_TEXTRACT_ACCESS_KEY
  const secretAccessKey = process.env.AWS_TEXTRACT_SECRET_KEY
  const region = process.env.AWS_TEXTRACT_REGION || "us-east-1"
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS Textract credentials not configured")
  }

  // Initialize Textract client with credentials from environment variables
  const textractClient = new TextractClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  try {
    // Fetch the image data from the URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }
    
    // Get image as blob and convert to buffer
    const imageBlob = await imageResponse.blob()
    const imageArrayBuffer = await imageBlob.arrayBuffer()
    const imageBuffer = Buffer.from(imageArrayBuffer)

    // Create Textract command for expense analysis
    const command = new AnalyzeExpenseCommand({
      Document: {
        Bytes: imageBuffer
      }
    })

    // Send request to AWS Textract
    const textractResponse = await textractClient.send(command)
    
    // Process the Textract response
    const ocrResult = parseTextractResponse(textractResponse)
    
    return ocrResult
  } catch (error: any) {
    console.error("AWS Textract processing error:", error)
    throw new Error(`OCR processing failed: ${error.message}`)
  }
}

/**
 * Parses the AWS Textract response to extract relevant receipt data
 */
function parseTextractResponse(textractResponse: any): OCRResult {
  const result: OCRResult = {
    items: [],
    raw: JSON.stringify(textractResponse) // Store the raw response for debugging
  }

  try {
    // Extract expense documents
    const expenseDocuments = textractResponse.ExpenseDocuments || []
    
    if (expenseDocuments.length === 0) {
      return result
    }

    const document = expenseDocuments[0]
    
    // Extract summary fields
    const summaryFields = document.SummaryFields || []
    
    // Process summary fields
    for (const field of summaryFields) {
      const type = field.Type?.Text
      const value = field.ValueDetection?.Text
      
      if (!type || !value) continue
      
      // Map Textract fields to our OCR result structure
      if (type.toLowerCase().includes("vendor") || type.toLowerCase().includes("merchant")) {
        result.merchant = value
      } else if (type.toLowerCase().includes("date") || type.toLowerCase().includes("receipt date")) {
        result.date = value
      } else if (type.toLowerCase().includes("total")) {
        const totalValue = parseFloat(value.replace(/[^0-9.-]+/g, ""))
        if (!isNaN(totalValue)) {
          result.total = totalValue
        }
      } else if (type.toLowerCase().includes("tax")) {
        const taxValue = parseFloat(value.replace(/[^0-9.-]+/g, ""))
        if (!isNaN(taxValue)) {
          result.taxAmount = taxValue
        }
      } else if (type.toLowerCase().includes("tip") || type.toLowerCase().includes("gratuity")) {
        const tipValue = parseFloat(value.replace(/[^0-9.-]+/g, ""))
        if (!isNaN(tipValue)) {
          result.tipAmount = tipValue
        }
      }
    }
    
    // Extract line item groups
    const lineItemGroups = document.LineItemGroups || []
    
    // Process line items
    for (const group of lineItemGroups) {
      const lineItems = group.LineItems || []
      
      for (const item of lineItems) {
        const lineItemExpenseFields = item.LineItemExpenseFields || []
        
        let itemName = ""
        let itemPrice = 0
        let itemQuantity = 1
        
        // Process expense fields
        for (const field of lineItemExpenseFields) {
          const type = field.Type?.Text
          const value = field.ValueDetection?.Text
          
          if (!type || !value) continue
          
          if (type.toLowerCase().includes("item") || type.toLowerCase().includes("description")) {
            itemName = value
          } else if (type.toLowerCase().includes("price") || type.toLowerCase().includes("amount")) {
            const priceValue = parseFloat(value.replace(/[^0-9.-]+/g, ""))
            if (!isNaN(priceValue)) {
              itemPrice = priceValue
            }
          } else if (type.toLowerCase().includes("quantity")) {
            const quantityValue = parseFloat(value)
            if (!isNaN(quantityValue)) {
              itemQuantity = quantityValue
            }
          }
        }
        
        // Only add items that have at least a name and price
        if (itemName && itemPrice > 0) {
          result.items?.push({
            name: itemName,
            price: itemPrice,
            quantity: itemQuantity
          })
        }
      }
    }
    
    // Set an estimated confidence level
    result.confidence = 0.9 // Textract is generally quite accurate
    
    return result
  } catch (error) {
    console.error("Error parsing Textract response:", error)
    return result
  }
} 