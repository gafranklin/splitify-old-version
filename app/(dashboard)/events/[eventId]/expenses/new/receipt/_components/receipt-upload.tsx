"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Scan, FileImage, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ReceiptScanner } from "@/components/dashboard/receipt-scanner"
import { createReceiptAction } from "@/actions/db/receipts-actions"
import { processReceiptOcrAction } from "@/actions/ocr-actions"
import { ExtendedReceipt } from "@/types"

interface ReceiptUploadProps {
  eventId: string
  expenseId: string
  onComplete: (receipt: ExtendedReceipt) => void
  onBack: () => void
}

export function ReceiptUpload({
  eventId,
  expenseId,
  onComplete,
  onBack
}: ReceiptUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCapture = async (file: File) => {
    try {
      setIsUploading(true)

      // Step 1: Create receipt record in database
      const createResult = await createReceiptAction({
        eventId,
        expenseId,
        file
      })

      if (!createResult.isSuccess) {
        throw new Error(createResult.message)
      }

      const receipt = createResult.data

      // Step 2: Process the receipt with OCR
      setIsUploading(false)
      setIsProcessing(true)

      const ocrResult = await processReceiptOcrAction(receipt.id)

      if (!ocrResult.isSuccess) {
        toast.error(
          "OCR processing failed. You can still use the receipt or try again."
        )
        // Still complete the flow with the original receipt
        onComplete(receipt)
        return
      }

      // Step 3: Fetch the updated receipt with OCR data and proceed
      toast.success("Receipt processed successfully!")
      onComplete({
        ...receipt,
        parsedOcrData: ocrResult.data
      })
    } catch (error: any) {
      console.error("Error uploading receipt:", error)
      toast.error(error.message || "Failed to upload receipt")
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scan className="mr-2 size-5" />
          Scan Receipt
        </CardTitle>
        <CardDescription>
          Take a photo or upload an image of your receipt to automatically
          extract data
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ReceiptScanner
          onCapture={handleCapture}
          isLoading={isUploading || isProcessing}
        />

        {isProcessing && (
          <div className="mt-3 animate-pulse text-center text-sm">
            Processing receipt with OCR... This may take a moment.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isUploading || isProcessing}
        >
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>

        <Button
          type="button"
          variant="link"
          onClick={() => router.push(`/events/${eventId}/expenses/new`)}
          disabled={isUploading || isProcessing}
        >
          Skip Receipt
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
