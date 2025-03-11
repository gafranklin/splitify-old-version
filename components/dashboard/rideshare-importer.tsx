"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { checkUberConnectionAction } from "@/actions/uber-actions"

interface RideshareImporterProps {
  eventId: string
}

export default function RideshareImporter({ eventId }: RideshareImporterProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImportRides = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if the user has connected their Uber account
      const result = await checkUberConnectionAction()

      if (result.isSuccess) {
        if (result.data) {
          // If connected, go directly to the rides page
          router.push(`/events/${eventId}/expenses/new/rideshare/rides`)
        } else {
          // If not connected, go to the connect page
          router.push(`/events/${eventId}/expenses/new/rideshare`)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error checking Uber connection:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Car className="mr-2 size-5" />
          Import Rideshare Expenses
        </CardTitle>
        <CardDescription>
          Automatically import your Uber rides as expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Connect your Uber account to import your rides as expenses. This makes
          it easy to track and split transportation costs with your group.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleImportRides}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Import Rides
        </Button>
      </CardContent>
    </Card>
  )
}
