"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ReceiptScannerProps {
  onCapture: (file: File) => void
  isLoading?: boolean
  className?: string
}

export function ReceiptScanner({
  onCapture,
  isLoading = false,
  className
}: ReceiptScannerProps) {
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreamActive, setIsStreamActive] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)

  // Initialize camera
  const startCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream
        setStream(videoStream)
        setIsStreamActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasCamera(false)
      setCaptureMode("upload")
    }
  }

  // Stop camera stream
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsStreamActive(false)
    }
  }

  // Switch to camera mode
  const handleCameraMode = () => {
    setCaptureMode("camera")
    if (!isStreamActive && hasCamera) {
      startCamera()
    }
  }

  // Switch to upload mode
  const handleUploadMode = () => {
    setCaptureMode("upload")
    stopCameraStream()
  }

  // Take a photo using the camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          blob => {
            if (blob) {
              const file = new File([blob], "receipt.jpg", {
                type: "image/jpeg"
              })
              const imageUrl = URL.createObjectURL(blob)
              setPreviewUrl(imageUrl)
              onCapture(file)
            }
          },
          "image/jpeg",
          0.8
        )
      }
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setPreviewUrl(imageUrl)
      onCapture(file)
    }
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCameraStream()
      // Revoke any object URLs to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4">
        <div className="mb-4 flex space-x-2">
          {hasCamera && (
            <Button
              type="button"
              variant={captureMode === "camera" ? "default" : "outline"}
              onClick={handleCameraMode}
              disabled={isLoading}
            >
              <Camera className="mr-2 size-4" />
              Camera
            </Button>
          )}
          <Button
            type="button"
            variant={captureMode === "upload" ? "default" : "outline"}
            onClick={handleUploadMode}
            disabled={isLoading}
          >
            <Upload className="mr-2 size-4" />
            Upload
          </Button>
        </div>

        <div className="bg-muted relative aspect-[3/4] overflow-hidden rounded-md">
          {isLoading && (
            <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
              <Skeleton className="size-full" />
            </div>
          )}

          {captureMode === "camera" && !previewUrl ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="size-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : previewUrl ? (
            <div className="size-full">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="size-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="p-4 text-center">
                <Upload className="text-muted-foreground mx-auto mb-2 size-10" />
                <p className="text-muted-foreground text-sm">
                  Select a receipt image to upload
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          {captureMode === "camera" && !previewUrl ? (
            <Button
              type="button"
              className="w-full"
              onClick={capturePhoto}
              disabled={!isStreamActive || isLoading}
            >
              Take Photo
            </Button>
          ) : captureMode === "upload" && !previewUrl ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isLoading}
              />
              <Button
                type="button"
                className="w-full"
                onClick={triggerFileInput}
                disabled={isLoading}
              >
                Select File
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setPreviewUrl(null)
                if (captureMode === "camera") {
                  startCamera()
                }
              }}
              disabled={isLoading}
            >
              Retake/Upload New
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
