"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  ArrowUpDown,
  ChevronDown,
  DollarSign,
  MoreHorizontal,
  Receipt,
  User
} from "lucide-react"
import Link from "next/link"

import { SelectExpense } from "@/db/schema"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
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

interface ExpenseListProps {
  expenses: SelectExpense[]
  eventId: string
  className?: string
  onDelete?: (expenseId: string) => void
  payerNames?: Record<string, string>
  hasReceiptMap?: Record<string, boolean>
}

type SortField = "date" | "amount" | "description" | "payer"
type SortDirection = "asc" | "desc"

export default function ExpenseList({
  expenses,
  eventId,
  className,
  onDelete,
  payerNames = {},
  hasReceiptMap = {}
}: ExpenseListProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1

    switch (sortField) {
      case "date":
        return (
          direction * (new Date(a.date).getTime() - new Date(b.date).getTime())
        )
      case "amount":
        return direction * (Number(a.amount) - Number(b.amount))
      case "description":
        return (
          direction * (a.description || "").localeCompare(b.description || "")
        )
      case "payer":
        const payerA = payerNames[a.payerId] || ""
        const payerB = payerNames[b.payerId] || ""
        return direction * payerA.localeCompare(payerB)
      default:
        return 0
    }
  })

  if (expenses.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>No expenses found for this event.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href={`/events/${eventId}/expenses/new`}>Add Expense</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Expenses</CardTitle>
          <Button asChild size="sm">
            <Link href={`/events/${eventId}/expenses/new`}>Add Expense</Link>
          </Button>
        </div>
        <CardDescription>
          Manage and track all expenses for this event.
        </CardDescription>
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
                  onClick={() => handleSort("description")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Description
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "description"
                          ? "opacity-100"
                          : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("payer")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Paid By
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "payer" ? "opacity-100" : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("amount")}
                  className="cursor-pointer text-right"
                >
                  <div className="flex items-center justify-end">
                    Amount
                    <ArrowUpDown
                      className={cn(
                        "ml-1 size-4",
                        sortField === "amount" ? "opacity-100" : "opacity-40"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {format(new Date(expense.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {hasReceiptMap[expense.id] && (
                        <Receipt className="text-muted-foreground mr-2 size-4" />
                      )}
                      <span className="line-clamp-1">
                        {expense.description || expense.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="mr-2 size-6">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      {payerNames[expense.payerId] || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/events/${eventId}/expenses/${expense.id}`}
                          >
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/events/${eventId}/expenses/${expense.id}/edit`}
                          >
                            Edit Expense
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/events/${eventId}/expenses/${expense.id}/split`}
                          >
                            Split Expense
                          </Link>
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(expense.id)}
                          >
                            Delete Expense
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
