"use client"

import { useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ChevronRight, CalendarIcon, DollarSign, Users } from "lucide-react"

import { ExpenseSummary } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ExpenseListProps {
  expenses: ExpenseSummary[]
  eventId: string
}

export default function ExpenseList({ expenses, eventId }: ExpenseListProps) {
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [expenses])

  return (
    <div className="space-y-4">
      {sortedExpenses.map(expense => (
        <ExpenseCard key={expense.id} expense={expense} eventId={eventId} />
      ))}
    </div>
  )
}

function ExpenseCard({
  expense,
  eventId
}: {
  expense: ExpenseSummary
  eventId: string
}) {
  // Format currency
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(expense.amount)

  // Format date
  const formattedDate = format(new Date(expense.date), "MMM d, yyyy")

  // Get status badge color
  const getStatusColor = () => {
    switch (expense.status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    }
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/events/${eventId}/expenses/${expense.id}`}
        className="block"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{expense.title}</h3>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{formattedAmount}</span>
              <ChevronRight className="text-muted-foreground size-4" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-muted-foreground flex items-center text-sm">
              <CalendarIcon className="mr-1 size-3" />
              {formattedDate}
            </div>
            <Badge
              variant="outline"
              className={`capitalize ${getStatusColor()}`}
            >
              {expense.status}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="text-muted-foreground flex items-center gap-1">
              <Users className="size-3" />
              <span>Paid by: {expense.payerName}</span>
            </div>

            {expense.itemCount > 0 && (
              <div className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="size-3" />
                <span>
                  {expense.itemCount} item{expense.itemCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
