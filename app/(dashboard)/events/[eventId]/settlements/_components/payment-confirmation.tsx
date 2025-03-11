"use client"

import { useState } from "react"
import { toast } from "sonner"
import { SelectParticipant, SelectSettlement } from "@/db/schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/hooks/use-utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle } from "lucide-react"
import { updateSettlementAction } from "@/actions/db/settlements-actions"
import { createPaymentReceiptFile } from "@/lib/payment-notifications"

const paymentConfirmationSchema = z.object({
  paymentMethod: z.enum(["cash", "venmo", "paypal", "zelle", "other"]),
  paymentReference: z.string().optional(),
  notes: z.string().optional()
})

interface PaymentConfirmationProps {
  isOpen: boolean
  onClose: () => void
  settlement: SelectSettlement
  fromParticipant: SelectParticipant
  toParticipant: SelectParticipant
  eventId: string
}

export default function PaymentConfirmation({
  isOpen,
  onClose,
  settlement,
  fromParticipant,
  toParticipant,
  eventId
}: PaymentConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventName, setEventName] = useState("Event") // Default event name

  // Get amount as a number for display
  const amount = parseFloat(settlement.amount.toString())

  // Create form
  const form = useForm<z.infer<typeof paymentConfirmationSchema>>({
    resolver: zodResolver(paymentConfirmationSchema),
    defaultValues: {
      paymentMethod: (settlement.paymentMethod as any) || "venmo",
      paymentReference: settlement.paymentReference || "",
      notes: settlement.notes || ""
    }
  })

  const onSubmit = async (
    values: z.infer<typeof paymentConfirmationSchema>
  ) => {
    setIsSubmitting(true)
    try {
      const result = await updateSettlementAction(settlement.id, {
        ...values,
        status: "completed",
        completedAt: new Date()
      })

      if (result.isSuccess) {
        toast.success("Payment confirmed")
        onClose()
        // Refresh the page
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to confirm payment")
      }
    } catch (error) {
      toast.error("An error occurred while confirming the payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadReceipt = () => {
    const fileUrl = createPaymentReceiptFile(
      settlement,
      fromParticipant,
      toParticipant,
      eventName
    )

    // Create a temporary anchor element
    const a = document.createElement("a")
    a.href = fileUrl
    a.download = `payment_receipt_${settlement.id}.txt`
    document.body.appendChild(a)
    a.click()

    // Clean up
    window.URL.revokeObjectURL(fileUrl)
    document.body.removeChild(a)

    toast.success("Receipt downloaded")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>
            Confirm that {fromParticipant.displayName || "the participant"} has
            paid {formatCurrency(amount)} to {toParticipant.displayName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label>Amount</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(amount)}
                  </div>
                </div>
                <div className="text-muted-foreground mt-2 flex items-center justify-between text-sm">
                  <div>From: {fromParticipant.displayName}</div>
                  <div>To: {toParticipant.displayName}</div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="venmo">Venmo</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="zelle">Zelle</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference (Optional)</FormLabel>
                    <FormDescription>
                      Transaction ID, payment reference, or other identifier.
                    </FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this payment..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center text-sm">
                <CheckCircle className="mr-2 size-5 text-green-500" />
                <span>Payment will be marked as completed</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadReceipt}
                className="w-full"
              >
                Download Receipt
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Confirming..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
