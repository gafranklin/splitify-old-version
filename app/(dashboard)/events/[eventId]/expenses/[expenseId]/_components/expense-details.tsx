"use client"

import { format } from "date-fns"
import { InfoIcon, PackageIcon, Receipt } from "lucide-react"
import Link from "next/link"

import { ExpenseWithDetails } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

interface ExpenseDetailsProps {
  expense: ExpenseWithDetails
  eventId: string
}

export default function ExpenseDetails({
  expense,
  eventId
}: ExpenseDetailsProps) {
  // Format currency
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(amount))
  }

  return (
    <div className="space-y-6">
      {/* Additional information */}
      {expense.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <InfoIcon className="mr-2 size-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{expense.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Expense items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <PackageIcon className="mr-2 size-5" />
              Items
            </CardTitle>
            {expense.items.length > 0 && (
              <Badge variant="outline">
                {expense.items.length} item
                {expense.items.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {expense.items.length === 0 ? (
            <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
              No items added to this expense.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expense.items.map(item => {
                  const quantity = Number(item.quantity)
                  const price = Number(item.price)
                  const totalPrice = quantity * price

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name}
                        {item.description && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {item.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalPrice)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Allocations section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Receipt className="mr-2 size-5" />
              Split Details
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {expense.allocations && expense.allocations.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expense.allocations.map(allocation => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        {/* Display participant name (would need to be fetched or passed) */}
                        Participant {allocation.participantId.substring(0, 4)}
                        ...
                      </TableCell>
                      <TableCell className="capitalize">
                        {allocation.allocationType}
                      </TableCell>
                      <TableCell className="text-right">
                        {allocation.allocationType === "equal" ? (
                          <span className="text-muted-foreground">
                            Equal share
                          </span>
                        ) : allocation.allocationType === "percent" ? (
                          <span>{Number(allocation.percentage)}%</span>
                        ) : (
                          formatCurrency(allocation.amount || 0)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                This expense hasn't been split yet.
              </div>
              <div className="flex justify-center">
                <Button asChild>
                  <Link
                    href={`/events/${eventId}/expenses/${expense.id}/split`}
                  >
                    Split Expense
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt section - only if there's a receipt */}
      {expense.hasReceipt && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Receipt className="mr-2 size-5" />
              Receipt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {/* This would show the receipt image if available */}
              <Button asChild variant="outline">
                <Link
                  href={`/events/${eventId}/expenses/${expense.id}/receipt`}
                >
                  View Receipt
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
