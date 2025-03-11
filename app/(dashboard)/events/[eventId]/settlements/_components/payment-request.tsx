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
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  MessageSquare
} from "lucide-react"
import { useCopyToClipboard, formatCurrency } from "@/lib/hooks/use-utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  generateVenmoLink,
  generatePayPalLink,
  generateCashAppLink,
  generatePaymentReference
} from "@/lib/payment-links"
import {
  generatePaymentRequestMessage,
  generatePaymentEmailSubject,
  generatePaymentEmailBody
} from "@/lib/payment-notifications"
import { updateSettlementAction } from "@/actions/db/settlements-actions"

const paymentRequestSchema = z.object({
  paymentMethod: z.enum(["cash", "venmo", "paypal", "zelle", "other"]),
  paymentReference: z
    .string()
    .min(4, "Reference must be at least 4 characters"),
  notes: z.string().optional(),
  paymentLink: z.string().optional()
})

interface PaymentRequestProps {
  isOpen: boolean
  onClose: () => void
  settlement: SelectSettlement
  fromParticipant: SelectParticipant
  toParticipant: SelectParticipant
  eventId: string
}

type PaymentPlatform = "venmo" | "paypal" | "zelle" | "cashapp"

export default function PaymentRequest({
  isOpen,
  onClose,
  settlement,
  fromParticipant,
  toParticipant,
  eventId
}: PaymentRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState<PaymentPlatform>("venmo")
  const [eventName, setEventName] = useState("Event") // Default event name
  const { copy, isCopied } = useCopyToClipboard()

  // Generate a reference if none exists
  const reference = settlement.paymentReference || generatePaymentReference()

  // Get amount as a number for display
  const amount = parseFloat(settlement.amount.toString())

  // Create form
  const form = useForm<z.infer<typeof paymentRequestSchema>>({
    resolver: zodResolver(paymentRequestSchema),
    defaultValues: {
      paymentMethod: (settlement.paymentMethod as any) || "venmo",
      paymentReference: reference,
      notes: settlement.notes || ""
    }
  })

  const onSubmit = async (values: z.infer<typeof paymentRequestSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await updateSettlementAction(settlement.id, {
        ...values,
        status: "requested",
        requestedAt: new Date()
      })

      if (result.isSuccess) {
        toast.success("Payment request sent")
        onClose()
        // Refresh the page
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to send payment request")
      }
    } catch (error) {
      toast.error("An error occurred while sending the payment request")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate payment links
  const venmoLink = generateVenmoLink({
    amount: amount.toString(),
    receiver:
      form.watch("paymentMethod") === "venmo"
        ? form.watch("paymentLink") || ""
        : "",
    note: `Payment for ${eventName} (Ref: ${reference})`
  })

  const paypalLink = generatePayPalLink({
    amount: amount.toString(),
    receiver:
      form.watch("paymentMethod") === "paypal"
        ? form.watch("paymentLink") || ""
        : "",
    note: `Payment for ${eventName} (Ref: ${reference})`
  })

  const cashAppLink = generateCashAppLink({
    amount: amount.toString(),
    receiver:
      form.watch("paymentMethod") === "other"
        ? form.watch("paymentLink") || ""
        : "",
    note: `Payment for ${eventName} (Ref: ${reference})`
  })

  // Handle SMS share
  const handleSmsShare = () => {
    const message = generatePaymentRequestMessage(
      settlement,
      fromParticipant,
      toParticipant,
      eventName,
      reference
    )

    // Check if the Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: "Payment Request",
          text: message
        })
        .catch(error => {
          console.error("Error sharing:", error)
          // Fallback to copying
          copy(message)
          toast.success("Message copied to clipboard")
        })
    } else {
      // Fallback to copying
      copy(message)
      toast.success("Message copied to clipboard")
    }
  }

  // Handle email share
  const handleEmailShare = () => {
    const subject = generatePaymentEmailSubject(eventName, reference)
    const body = generatePaymentEmailBody(
      settlement,
      fromParticipant,
      toParticipant,
      eventName,
      reference,
      getCurrentPaymentLink()
    )

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, "_blank")
  }

  // Get the current payment link based on the selected tab
  const getCurrentPaymentLink = (): string => {
    switch (currentTab) {
      case "venmo":
        return venmoLink
      case "paypal":
        return paypalLink
      case "cashapp":
        return cashAppLink
      default:
        return ""
    }
  }

  // Copy the current payment link
  const handleCopyLink = () => {
    copy(getCurrentPaymentLink())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Payment</DialogTitle>
          <DialogDescription>
            Send a payment request to{" "}
            {fromParticipant.displayName || "the participant"} for{" "}
            {formatCurrency(amount)}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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

              {form.watch("paymentMethod") === "venmo" && (
                <FormField
                  control={form.control}
                  name="paymentLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venmo Username</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("paymentMethod") === "paypal" && (
                <FormField
                  control={form.control}
                  name="paymentLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayPal Email or Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com or username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("paymentMethod") === "zelle" && (
                <FormField
                  control={form.control}
                  name="paymentLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zelle Email or Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com or phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("paymentMethod") === "other" && (
                <FormField
                  control={form.control}
                  name="paymentLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash App Username</FormLabel>
                      <FormControl>
                        <Input placeholder="$cashtag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference</FormLabel>
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

            <Tabs defaultValue="message" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="message">
                  <MessageSquare className="mr-2 size-4" />
                  Message
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="mr-2 size-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="link">
                  <ExternalLink className="mr-2 size-4" />
                  Link
                </TabsTrigger>
              </TabsList>
              <TabsContent value="message" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    {generatePaymentRequestMessage(
                      settlement,
                      fromParticipant,
                      toParticipant,
                      eventName,
                      reference
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSmsShare}
                  >
                    <Share2 className="mr-2 size-4" />
                    Share Message
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="email" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 max-h-[120px] overflow-y-auto rounded-md p-3 text-sm">
                    <p className="font-semibold">
                      Subject:{" "}
                      {generatePaymentEmailSubject(eventName, reference)}
                    </p>
                    <div className="mt-2 whitespace-pre-line">
                      {generatePaymentEmailBody(
                        settlement,
                        fromParticipant,
                        toParticipant,
                        eventName,
                        reference
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleEmailShare}
                  >
                    <Mail className="mr-2 size-4" />
                    Open Email
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="link" className="mt-4">
                <div className="space-y-4">
                  <Tabs
                    value={currentTab}
                    onValueChange={value =>
                      setCurrentTab(value as PaymentPlatform)
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="venmo">Venmo</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                      <TabsTrigger value="cashapp">Cash App</TabsTrigger>
                    </TabsList>
                    <TabsContent value="venmo" className="mt-2">
                      <div className="bg-muted/50 truncate rounded-md p-3 text-sm">
                        {venmoLink}
                      </div>
                    </TabsContent>
                    <TabsContent value="paypal" className="mt-2">
                      <div className="bg-muted/50 truncate rounded-md p-3 text-sm">
                        {paypalLink}
                      </div>
                    </TabsContent>
                    <TabsContent value="cashapp" className="mt-2">
                      <div className="bg-muted/50 truncate rounded-md p-3 text-sm">
                        {cashAppLink}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCopyLink}
                    >
                      {isCopied ? (
                        <Check className="mr-2 size-4" />
                      ) : (
                        <Copy className="mr-2 size-4" />
                      )}
                      Copy Link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(getCurrentPaymentLink(), "_blank")
                      }
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Open Link
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
