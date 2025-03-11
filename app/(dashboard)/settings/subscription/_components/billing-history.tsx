"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface Invoice {
  id: string
  number: string
  date: Date
  amount: number
  status: "paid" | "open" | "failed"
  url?: string
}

interface BillingHistoryProps {
  invoices: Invoice[]
  isLoading?: boolean
}

export function BillingHistory({
  invoices = [],
  isLoading = false
}: BillingHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [downloading, setDownloading] = useState<string | null>(null)
  const itemsPerPage = 5

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatAmount(invoice.amount).includes(searchQuery)

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="border-green-500 bg-green-50 text-green-700"
          >
            Paid
          </Badge>
        )
      case "open":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 bg-blue-50 text-blue-700"
          >
            Open
          </Badge>
        )
      case "failed":
        return (
          <Badge
            variant="outline"
            className="border-red-500 bg-red-50 text-red-700"
          >
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDownload = async (invoice: Invoice) => {
    if (!invoice.url) return

    setDownloading(invoice.id)
    try {
      window.open(invoice.url, "_blank")
      // In a real implementation, you might track downloads or perform additional actions
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error downloading invoice:", error)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Billing History</CardTitle>
        <CardDescription>View and download your past invoices</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="text-muted-foreground mx-auto mb-3 size-10" />
                <h3 className="mb-1 text-lg font-medium">No invoices found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery || statusFilter !== "all"
                    ? "Try changing your search or filter"
                    : "Your billing history will appear here once you have some invoices"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.number}
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatAmount(invoice.amount)}</TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1"
                              onClick={() => handleDownload(invoice)}
                              disabled={
                                !invoice.url || downloading === invoice.id
                              }
                            >
                              {downloading === invoice.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Download className="size-3.5" />
                              )}
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Showing {startIndex + 1}-
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredInvoices.length
                      )}{" "}
                      of {filteredInvoices.length}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage(prev => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage(prev => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function BillingHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-1 h-5 w-60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full md:w-[180px]" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
