"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReceiptUpload } from "./receipt-upload"
import { OCRPreview } from "./ocr-preview"
import { ExtendedReceipt } from "@/types"

interface ReceiptPageContentProps {
  eventId: string
  expenseId: string
}

export function ReceiptPageContent({
  eventId,
  expenseId
}: ReceiptPageContentProps) {
  const router = useRouter()
  const [receipt, setReceipt] = useState<ExtendedReceipt | null>(null)

  // Handle when receipt upload is complete
  const handleUploadComplete = (uploadedReceipt: ExtendedReceipt) => {
    setReceipt(uploadedReceipt)
  }

  // Handle when OCR preview is complete
  const handlePreviewComplete = (updatedReceipt: ExtendedReceipt) => {
    // Redirect back to expense creation with receipt data
    router.push(
      `/events/${eventId}/expenses/new?receiptId=${updatedReceipt.id}`
    )
  }

  // Go back to expense creation
  const handleBackToExpense = () => {
    router.push(`/events/${eventId}/expenses/new`)
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={handleBackToExpense} className="mb-2">
          <ArrowLeft className="mr-2 size-4" />
          Back to Expense
        </Button>
        <h1 className="text-2xl font-bold">Receipt Scanner</h1>
        <p className="text-muted-foreground">
          Upload a receipt image to automatically extract expense data
        </p>
      </div>

      {!receipt ? (
        <ReceiptUpload
          eventId={eventId}
          expenseId={expenseId}
          onComplete={handleUploadComplete}
          onBack={handleBackToExpense}
        />
      ) : (
        <OCRPreview
          receipt={receipt}
          eventId={eventId}
          onComplete={handlePreviewComplete}
        />
      )}
    </div>
  )
}
