"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { SelectSettlement } from "@/db/schema"
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Phone
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PaymentDisputeProps {
  settlement: SelectSettlement
  payerName: string
  payeeName: string
  eventName: string
  payerEmail?: string
  payeeEmail?: string
  payerPhone?: string
  payeePhone?: string
}

export function PaymentDispute({
  settlement,
  payerName,
  payeeName,
  eventName,
  payerEmail,
  payeeEmail,
  payerPhone,
  payeePhone
}: PaymentDisputeProps) {
  const router = useRouter()
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [proofOpen, setProofOpen] = useState(false)

  // Determine if we have proof of payment
  const hasProof =
    settlement.paymentReference &&
    settlement.paymentReference.startsWith("http")

  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount.toString()).toFixed(2)
  }

  const handleSendMessage = async () => {
    // In a real app, this would send a message to the other person
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success("Message sent successfully")
      setContactDialogOpen(false)
      setMessageText("")
    } catch (error) {
      toast.error("Failed to send message")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSubject = () => {
    return `Payment dispute for ${eventName}`
  }

  const createBody = () => {
    return `Hi,

I'm contacting you regarding a payment dispute for the event "${eventName}".

Payment amount: $${formatCurrency(settlement.amount)}
Payment method: ${settlement.paymentMethod || "N/A"}
${settlement.paymentReference ? `Reference: ${settlement.paymentReference}` : ""}

${messageText}

Let's resolve this issue.

Thanks,
${settlement.status === "requested" ? payerName : payeeName}`
  }

  const emailSubject = encodeURIComponent(createSubject())
  const emailBody = encodeURIComponent(createBody())

  const contactEmail =
    settlement.status === "requested" ? payeeEmail : payerEmail

  const contactPhone =
    settlement.status === "requested" ? payeePhone : payerPhone

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Dispute</CardTitle>
            <Badge variant="destructive">Disputed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Payment Issue</AlertTitle>
              <AlertDescription>
                There is a dispute regarding the payment of $
                {formatCurrency(settlement.amount)}
                {settlement.status === "requested"
                  ? ` that you've made to ${payeeName}.`
                  : ` from ${payerName}.`}
              </AlertDescription>
            </Alert>

            <div className="text-sm">
              <p className="mb-1 font-medium">Payment Details:</p>
              <p>
                <span className="text-muted-foreground">Amount:</span> $
                {formatCurrency(settlement.amount)}
              </p>
              {settlement.paymentMethod && (
                <p>
                  <span className="text-muted-foreground">Method:</span>{" "}
                  {settlement.paymentMethod}
                </p>
              )}
              {settlement.paymentReference && !hasProof && (
                <p>
                  <span className="text-muted-foreground">Reference:</span>{" "}
                  {settlement.paymentReference}
                </p>
              )}
              {settlement.notes && (
                <p className="mt-2">
                  <span className="text-muted-foreground">Notes:</span>
                  <br />
                  {settlement.notes}
                </p>
              )}
            </div>

            {hasProof && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setProofOpen(true)}
                >
                  <ExternalLink className="size-4" />
                  View Payment Proof
                </Button>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-3 text-sm">
                To resolve this dispute, contact the other party:
              </p>
              <Button
                className="flex w-full items-center gap-2"
                onClick={() => setContactDialogOpen(true)}
              >
                <MessageSquare className="size-4" />
                Contact to Resolve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact to Resolve Dispute</DialogTitle>
            <DialogDescription>
              Reach out to{" "}
              {settlement.status === "requested" ? payeeName : payerName} to
              resolve the payment dispute.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="message" className="mt-4 w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="message">Message</TabsTrigger>
              <TabsTrigger value="email" disabled={!contactEmail}>
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" disabled={!contactPhone}>
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="message" className="mt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your message about the payment dispute..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={5}
                />
                <Button
                  className="w-full"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 size-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-4">
              <div className="space-y-4">
                {contactEmail ? (
                  <>
                    <p className="text-sm">
                      Send an email to resolve this dispute:
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`
                        )
                      }
                    >
                      <Mail className="mr-2 size-4" />
                      Send Email
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No email address available.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              <div className="space-y-4">
                {contactPhone ? (
                  <>
                    <p className="text-sm">Contact by phone: {contactPhone}</p>
                    <Button
                      className="w-full"
                      onClick={() => window.open(`tel:${contactPhone}`)}
                    >
                      <Phone className="mr-2 size-4" />
                      Call
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No phone number available.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setContactDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Image Dialog */}
      {hasProof && (
        <Dialog open={proofOpen} onOpenChange={setProofOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Proof</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image
                src={settlement.paymentReference || ""}
                alt="Payment proof"
                fill
                className="object-contain"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setProofOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
