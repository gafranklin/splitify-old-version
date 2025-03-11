"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ReceiptViewerProps {
  imageUrl: string
  isLoading?: boolean
  className?: string
  altText?: string
}

export function ReceiptViewer({
  imageUrl,
  isLoading = false,
  className,
  altText = "Receipt image"
}: ReceiptViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  const rotate = () => setRotation(prev => (prev + 90) % 360)

  // Handle image download
  const downloadImage = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = "receipt.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="bg-muted flex items-center justify-between p-2">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={zoomLevel >= 3 || isLoading}
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={zoomLevel <= 0.5 || isLoading}
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={rotate}
            disabled={isLoading}
          >
            <RotateCw className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={downloadImage}
          disabled={isLoading}
        >
          <Download className="size-4" />
        </Button>
      </div>

      <CardContent className="relative overflow-auto p-0">
        <div
          className="relative flex min-h-[400px] items-center justify-center"
          style={{
            transform: `scale(${zoomLevel})`,
            transition: "transform 0.2s ease-in-out"
          }}
        >
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.3s ease"
              }}
              className="relative"
            >
              {/* Use regular img tag instead of Next.js Image for external URLs */}
              <img
                src={imageUrl}
                alt={altText}
                className="max-h-[600px] max-w-full object-contain"
                style={{ display: "block" }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
