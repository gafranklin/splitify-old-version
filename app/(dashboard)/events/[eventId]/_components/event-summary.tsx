"use client"

import Link from "next/link"
import {
  BanknoteIcon,
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  MapPinIcon,
  PlusIcon,
  ReceiptIcon,
  UsersIcon
} from "lucide-react"

import { EventWithDetails } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface EventSummaryProps {
  event: EventWithDetails
}

export default function EventSummary({ event }: EventSummaryProps) {
  const currency = event.currency || "USD"

  return (
    <div className="space-y-6">
      {/* Event Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Event Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(event.totalExpenses, currency)}
            </div>
            <p className="text-muted-foreground text-xs">
              Across all participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.participantCount}</div>
            <p className="text-muted-foreground text-xs">
              People sharing expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Per Person Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                event.participantCount > 0
                  ? event.totalExpenses / event.participantCount
                  : 0,
                currency
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Average cost per participant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Track and manage all expenses for this event
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between">
            <Button asChild variant="outline">
              <Link href={`/events/${event.id}/expenses`}>
                <ReceiptIcon className="mr-2 size-4" />
                View All Expenses
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/events/${event.id}/expenses/new`}>
                <PlusIcon className="mr-2 size-4" />
                Add Expense
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              Manage who's involved in this event
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between">
            <Button asChild variant="outline">
              <Link href={`/events/${event.id}/participants`}>
                <UsersIcon className="mr-2 size-4" />
                View Participants
              </Link>
            </Button>
            {event.userRole === "organizer" && (
              <Button asChild>
                <Link href={`/events/${event.id}/participants`}>
                  <PlusIcon className="mr-2 size-4" />
                  Add Participant
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settlements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Settlements</CardTitle>
          <CardDescription>See who owes what and settle up</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button asChild variant="outline">
            <Link href={`/events/${event.id}/balances`}>
              <DollarSignIcon className="mr-2 size-4" />
              View Balances
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/events/${event.id}/settlements`}>
              <BanknoteIcon className="mr-2 size-4" />
              Settle Up
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
