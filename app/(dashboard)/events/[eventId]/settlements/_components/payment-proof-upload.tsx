"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { SelectSettlement } from "@/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, FileImage, X, Check } from "lucide-react"
import { updateSettlementAction } from "@/actions/db/settlements-actions"
import { uploadPaymentProofStorage } from "@/actions/storage/payment-proofs-storage-actions"

interface PaymentProofUploadProps {
  settlement: SelectSettlement
  eventId: string
  onSuccess?: () => void
}

export default function PaymentProofUpload({
  settlement,
  eventId,
  onSuccess
}: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("File size exceeds 5MB")
      return
    }

    setFile(selectedFile)

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      // Create a unique filename
      const timestamp = new Date().getTime()
      const fileExt = file.name.split(".").pop()
      const fileName = `${settlement.id}_${timestamp}.${fileExt}`
      const path = `payment_proofs/${eventId}/${fileName}`

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Upload file to storage
      const uploadResult = await uploadPaymentProofStorage(
        "payment_proofs",
        path,
        file
      )

      clearInterval(progressInterval)

      if (!uploadResult.isSuccess) {
        throw new Error(uploadResult.message)
      }

      setUploadProgress(95)

      // Update settlement with proof image URL
      const updateResult = await updateSettlementAction(settlement.id, {
        proofImageUrl: path
      })

      if (!updateResult.isSuccess) {
        throw new Error(updateResult.message)
      }

      setUploadProgress(100)
      toast.success("Payment proof uploaded successfully")

      // Clear the form
      setFile(null)
      setPreview(null)

      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error uploading payment proof:", error)
      toast.error("Failed to upload payment proof")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleClearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Upload Payment Proof</CardTitle>
        <CardDescription>
          Provide evidence of your payment by uploading an image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proof">Payment Screenshot or Receipt</Label>
          <Input
            id="proof"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!preview ? (
            <div
              className="hover:bg-muted/50 cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors"
              onClick={handleCameraClick}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="bg-primary-foreground rounded-full p-3">
                  <FileImage className="text-primary size-8" />
                </div>
                <div className="text-sm font-medium">
                  Click to upload an image
                </div>
                <p className="text-muted-foreground text-xs">
                  JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={preview}
                alt="Payment proof preview"
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 rounded-full"
                onClick={handleClearFile}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="bg-muted h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="bg-muted/50 space-y-2 rounded-md p-3 text-sm">
          <h4 className="font-medium">What to include:</h4>
          <ul className="space-y-1 text-xs">
            <li className="flex items-start gap-1">
              <Check className="mt-0.5 size-3 text-green-500" />
              Confirmation number or transaction ID
            </li>
            <li className="flex items-start gap-1">
              <Check className="mt-0.5 size-3 text-green-500" />
              Payment amount and date
            </li>
            <li className="flex items-start gap-1">
              <Check className="mt-0.5 size-3 text-green-500" />
              Payee information (if available)
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!file || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Upload className="size-4 animate-pulse" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="size-4" />
              Upload Payment Proof
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
