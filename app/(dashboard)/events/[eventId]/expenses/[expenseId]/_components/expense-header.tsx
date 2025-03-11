"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  CalendarIcon,
  CreditCard,
  Edit2Icon,
  MoreHorizontal,
  Trash2Icon
} from "lucide-react"

import { ExpenseWithDetails } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { deleteExpenseAction } from "@/actions/db/expenses-actions"

interface ExpenseHeaderProps {
  expense: ExpenseWithDetails
  eventId: string
}

export default function ExpenseHeader({
  expense,
  eventId
}: ExpenseHeaderProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Format currency
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(expense.amount))

  // Format date
  const formattedDate = format(new Date(expense.date), "MMMM d, yyyy")

  // Status badge styling
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

  // Delete expense
  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteExpenseAction(expense.id)
      if (result.isSuccess) {
        router.push(`/events/${eventId}/expenses`)
        router.refresh()
      } else {
        console.error("Failed to delete expense:", result.message)
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{expense.title}</h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`capitalize ${getStatusColor()}`}
            >
              {expense.status}
            </Badge>
            <span className="text-xl font-semibold">{formattedAmount}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/events/${eventId}/expenses/${expense.id}/edit`}>
                    <Edit2Icon className="mr-2 size-4" />
                    Edit Expense
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/events/${eventId}/expenses/${expense.id}/split`}
                  >
                    <CreditCard className="mr-2 size-4" />
                    Edit Split
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2Icon className="mr-2 size-4" />
                  Delete Expense
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <span className="text-muted-foreground text-sm">Paid by:</span>
          <span className="text-sm font-medium">{expense.payerName}</span>
        </div>
      </CardContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense and all its allocation
              details. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
