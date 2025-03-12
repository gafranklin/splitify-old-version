"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowUpDown,
  CalendarIcon,
  MoreHorizontal,
  Receipt,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, cn } from "@/lib/utils"

// Define the expense type with event details
interface ExpenseSummary {
  id: string
  title: string
  amount: number
  date: string | Date
  status: string
  payerId: string
  payerName?: string
  eventId: string
  eventName: string
  currency: string
  hasReceipt?: boolean
}

type SortField = "date" | "title" | "amount" | "eventName"

interface ExpenseListProps {
  expenses: ExpenseSummary[]
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    const sortModifier = sortDirection === "asc" ? 1 : -1

    switch (sortField) {
      case "date":
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) *
          sortModifier
        )
      case "title":
        return a.title.localeCompare(b.title) * sortModifier
      case "amount":
        return (a.amount - b.amount) * sortModifier
      case "eventName":
        return a.eventName.localeCompare(b.eventName) * sortModifier
      default:
        return 0
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("date")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "date" ? "opacity-100" : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("title")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Description
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "title" ? "opacity-100" : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("eventName")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Event
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "eventName" ? "opacity-100" : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("amount")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Amount
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "amount" ? "opacity-100" : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="text-muted-foreground mr-2 size-4" />
                      <span>
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {expense.title}
                      {expense.hasReceipt && (
                        <Receipt className="text-muted-foreground size-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/events/${expense.eventId}`}
                      className="text-primary hover:underline"
                    >
                      {expense.eventName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="float-right"
                    >
                      <Link
                        href={`/events/${expense.eventId}/expenses/${expense.id}`}
                      >
                        <ChevronRight className="size-4" />
                        <span className="sr-only">View expense details</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
