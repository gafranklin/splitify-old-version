"use client"

import { format } from "date-fns"
import { ExpenseWithItems } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SplitSummaryProps {
  expense: ExpenseWithItems
}

export default function SplitSummary({ expense }: SplitSummaryProps) {
  // Format currency
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(expense.amount))

  // Format date
  const formattedDate = format(new Date(expense.date), "MMM d, yyyy")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium">{expense.title}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{formattedAmount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge
              variant="outline"
              className={`capitalize ${
                expense.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : expense.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {expense.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Items:</span>
            <span>{expense.items.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
