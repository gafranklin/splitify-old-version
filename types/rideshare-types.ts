import { InsertRideshare, SelectRideshare } from "@/db/schema"

export interface RideDetails {
  provider: "uber" | "other"
  rideId?: string
  pickupAddress?: string
  dropoffAddress?: string
  pickupTime?: Date
  dropoffTime?: Date
  distance?: number
  duration?: number
  amount?: number
  currency?: string
}

export interface UberRide {
  trip_id: string
  request_time: string
  product_type: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  dropoff_time: string
  distance: number
  duration: number
  fare: {
    amount: number
    currency: string
  }
  raw: any
}

export interface RideshareApiConnection {
  provider: "uber"
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  userId: string
}

export type RideshareWithExpense = SelectRideshare & {
  expense: {
    id: string
    amount: number
    name: string
    currency: string
  }
}
