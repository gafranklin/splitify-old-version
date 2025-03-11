"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Loader2, MapPin, Navigation } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { getUberRidesAction } from "@/actions/uber-actions"
import { createExpenseFromRideshareAction } from "@/actions/db/rideshares-actions"
import { ParticipantSummary } from "@/types"

interface RideListProps {
  eventId: string
  participants: ParticipantSummary[]
}

interface UberRide {
  id: string
  startTime: string
  endTime: string
  startAddress: string
  endAddress: string
  fare: number
  distance: number
  duration: number
  status: string
}

export default function RideList({ eventId, participants }: RideListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rides, setRides] = useState<UberRide[]>([])
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null)
  const [selectedPayerId, setSelectedPayerId] = useState<string>("")

  // Fetch rides on mount
  useState(() => {
    const fetchRides = async () => {
      setIsFetching(true)

      try {
        const result = await getUberRidesAction(eventId)

        if (result.isSuccess) {
          setRides(result.data)

          // If there are participants, select the first one as default payer
          if (participants.length > 0) {
            setSelectedPayerId(participants[0].id)
          }
        } else {
          setError(result.message)
        }
      } catch (err) {
        console.error("Error fetching rides:", err)
        setError("Failed to fetch rides")
      } finally {
        setIsFetching(false)
      }
    }

    fetchRides()
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

  // Format duration in minutes to human readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours} hr`
    }

    return `${hours} hr ${remainingMinutes} min`
  }

  // Handle ride selection
  const handleRideSelect = (rideId: string) => {
    setSelectedRideId(rideId)
  }

  // Handle payer selection
  const handlePayerSelect = (payerId: string) => {
    setSelectedPayerId(payerId)
  }

  // Handle create expense button click
  const handleCreateExpense = async () => {
    if (!selectedRideId || !selectedPayerId) {
      setError("Please select a ride and a payer")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const selectedRide = rides.find(ride => ride.id === selectedRideId)

      if (!selectedRide) {
        setError("Selected ride not found")
        return
      }

      const result = await createExpenseFromRideshareAction(eventId, {
        provider: "uber",
        rideId: selectedRide.id,
        pickupAddress: selectedRide.startAddress,
        dropoffAddress: selectedRide.endAddress,
        pickupTime: selectedRide.startTime,
        dropoffTime: selectedRide.endTime,
        distance: selectedRide.distance,
        duration: selectedRide.duration,
        fare: selectedRide.fare,
        payerId: selectedPayerId
      })

      if (result.isSuccess) {
        // Redirect to the expense page
        router.push(`/events/${eventId}/expenses/${result.data.expenseId}`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error creating expense:", err)
      setError("Failed to create expense")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Select a Ride</CardTitle>
        <CardDescription>Choose a ride to create an expense</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rides.length === 0 ? (
          <Alert>
            <AlertDescription>
              No rides found. Try connecting your account again or contact
              support.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <RadioGroup
              value={selectedRideId || ""}
              onValueChange={handleRideSelect}
              className="space-y-4"
            >
              {rides.map(ride => (
                <div
                  key={ride.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    selectedRideId === ride.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <RadioGroupItem
                    value={ride.id}
                    id={ride.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={ride.id}
                    className="flex cursor-pointer flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Uber Ride</span>
                      <span className="font-semibold">
                        {formatCurrency(ride.fare)}
                      </span>
                    </div>

                    <div className="text-muted-foreground space-y-2 text-sm">
                      <div className="flex items-start">
                        <Calendar className="mr-2 mt-0.5 size-4 shrink-0" />
                        <span>{formatDate(ride.startTime)}</span>
                      </div>

                      <div className="flex items-start">
                        <Clock className="mr-2 mt-0.5 size-4 shrink-0" />
                        <span>{formatTime(ride.startTime)}</span>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="mr-2 mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2">
                          {ride.startAddress}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <Navigation className="mr-2 mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2">{ride.endAddress}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span>{ride.distance.toFixed(1)} miles</span>
                        <span>{formatDuration(ride.duration)}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="payer">Who paid for this ride?</Label>
              <Select
                value={selectedPayerId}
                onValueChange={handlePayerSelect}
                disabled={!selectedRideId}
              >
                <SelectTrigger id="payer">
                  <SelectValue placeholder="Select a payer" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(participant => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.displayName ||
                        `User ${participant.id.substring(0, 4)}`}
                      {participant.isCurrentUser && " (You)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleCreateExpense}
            disabled={isLoading || !selectedRideId || !selectedPayerId}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
