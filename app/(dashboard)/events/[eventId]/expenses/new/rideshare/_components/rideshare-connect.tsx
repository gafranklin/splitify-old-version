"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, ExternalLink, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  checkUberConnectionAction,
  getUberAuthUrlAction
} from "@/actions/uber-actions"

interface RideshareConnectProps {
  eventId: string
}

export default function RideshareConnect({ eventId }: RideshareConnectProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Check connection status on mount
  useState(() => {
    const checkConnection = async () => {
      setIsLoading(true)

      try {
        const result = await checkUberConnectionAction()
        if (result.isSuccess) {
          setIsConnected(result.data)
        }
      } catch (err) {
        console.error("Error checking connection:", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  })

  // Handle connect to Uber button click
  const handleConnectUber = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getUberAuthUrlAction()

      if (result.isSuccess && result.data) {
        // Redirect to Uber OAuth flow
        window.location.href = result.data
      } else {
        setError(result.message || "Failed to connect to Uber")
      }
    } catch (err) {
      console.error("Error connecting to Uber:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle continue to rides button click
  const handleContinueToRides = () => {
    router.push(`/events/${eventId}/expenses/new/rideshare/rides`)
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Car className="mr-2 size-5" />
          Connect Rideshare Account
        </CardTitle>
        <CardDescription>
          Connect your Uber account to import ride expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isConnected ? (
          <Alert className="bg-green-50">
            <AlertTitle className="text-green-800">
              Your Uber account is connected
            </AlertTitle>
            <AlertDescription className="text-green-700">
              You can now import your rides
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTitle>Connect your account</AlertTitle>
            <AlertDescription>
              Connect your Uber account to automatically import ride information
              and create expenses.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {isConnected ? (
            <Button onClick={handleContinueToRides} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Continue to Rides
            </Button>
          ) : (
            <Button onClick={handleConnectUber} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Connect Uber Account
              <ExternalLink className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
